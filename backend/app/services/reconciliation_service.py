import io
from datetime import timedelta
from decimal import Decimal

import pandas as pd
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.file_upload import FileUpload
from app.models.transaction import Transaction
from app.models.reconciliation_result import ReconciliationResult
from app.schemas.reconciliation_schema import ReconciliationRunResponse, ReconciliationSummary


def _read_csv(file: UploadFile) -> pd.DataFrame:
    content = file.file.read()
    file.file.seek(0)
    return pd.read_csv(io.BytesIO(content))


def _normalize(df: pd.DataFrame, source_type: str) -> pd.DataFrame:
    cols = {c.lower().strip(): c for c in df.columns}

    def pick(*names: str) -> str | None:
        for n in names:
            if n in cols:
                return cols[n]
        return None

    txid_col = pick("transaction_id", "transaction id", "id")
    amount_col = pick("amount", "amt")
    date_col = pick("date", "transaction_date", "transaction date")
    ref_col = pick("reference", "ref", "reference_id", "reference id", "description")

    if not amount_col or not date_col:
        raise ValueError("CSV must contain amount and date columns")

    out = pd.DataFrame()
    out["transaction_id"] = df[txid_col].astype(str) if txid_col else None
    out["amount"] = pd.to_numeric(df[amount_col], errors="coerce")
    out["date"] = pd.to_datetime(df[date_col], errors="coerce").dt.date
    out["reference"] = df[ref_col].astype(str) if ref_col else None
    out["source_type"] = source_type

    out = out.dropna(subset=["amount", "date"]).reset_index(drop=True)
    return out


def run_reconciliation_from_csv(
    db: Session,
    organization_id,
    bank_file: UploadFile,
    gateway_file: UploadFile,
    actor_user_id,
) -> ReconciliationRunResponse:
    bank_df = _normalize(_read_csv(bank_file), "bank")
    gateway_df = _normalize(_read_csv(gateway_file), "gateway")

    bank_upload = FileUpload(
        organization_id=organization_id,
        uploaded_by_user_id=actor_user_id,
        filename=bank_file.filename,
        content_type=bank_file.content_type or "text/csv",
        source_type="bank",
    )
    gateway_upload = FileUpload(
        organization_id=organization_id,
        uploaded_by_user_id=actor_user_id,
        filename=gateway_file.filename,
        content_type=gateway_file.content_type or "text/csv",
        source_type="gateway",
    )
    db.add_all([bank_upload, gateway_upload])
    db.flush()

    bank_rows: list[Transaction] = []
    for r in bank_df.to_dict(orient="records"):
        bank_rows.append(
            Transaction(
                organization_id=organization_id,
                transaction_id=(r.get("transaction_id") if r.get("transaction_id") != "None" else None),
                amount=Decimal(str(r["amount"])).quantize(Decimal("0.01")),
                date=r["date"],
                reference=(r.get("reference") if r.get("reference") != "None" else None),
                source_type="bank",
                file_upload_id=bank_upload.id,
            )
        )

    gateway_rows: list[Transaction] = []
    for r in gateway_df.to_dict(orient="records"):
        gateway_rows.append(
            Transaction(
                organization_id=organization_id,
                transaction_id=(r.get("transaction_id") if r.get("transaction_id") != "None" else None),
                amount=Decimal(str(r["amount"])).quantize(Decimal("0.01")),
                date=r["date"],
                reference=(r.get("reference") if r.get("reference") != "None" else None),
                source_type="gateway",
                file_upload_id=gateway_upload.id,
            )
        )

    db.add_all(bank_rows + gateway_rows)
    db.flush()

    bank_index_exact: dict[tuple[str, str, str], Transaction] = {}
    for t in bank_rows:
        if t.transaction_id:
            bank_index_exact[(t.transaction_id, str(t.amount), t.date.isoformat())] = t

    gateway_index_exact: dict[tuple[str, str, str], Transaction] = {}
    for t in gateway_rows:
        if t.transaction_id:
            gateway_index_exact[(t.transaction_id, str(t.amount), t.date.isoformat())] = t

    used_bank: set[str] = set()
    used_gateway: set[str] = set()

    results: list[ReconciliationResult] = []

    def mark_matched(b: Transaction, g: Transaction):
        used_bank.add(str(b.id))
        used_gateway.add(str(g.id))
        results.append(
            ReconciliationResult(
                organization_id=organization_id,
                bank_transaction_id=b.id,
                gateway_transaction_id=g.id,
                match_status="matched",
                mismatch_reason=None,
            )
        )

    for k, b in bank_index_exact.items():
        g = gateway_index_exact.get(k)
        if g:
            mark_matched(b, g)

    gateway_by_ref_amount: dict[tuple[str, str], list[Transaction]] = {}
    for g in gateway_rows:
        if g.reference:
            gateway_by_ref_amount.setdefault((g.reference, str(g.amount)), []).append(g)

    for b in bank_rows:
        if str(b.id) in used_bank:
            continue
        if b.reference:
            candidates = gateway_by_ref_amount.get((b.reference, str(b.amount)), [])
            candidates = [c for c in candidates if str(c.id) not in used_gateway]
            if candidates:
                mark_matched(b, candidates[0])

    amount_tol = Decimal("0.50")
    date_tol = timedelta(days=2)

    gateway_remaining = [g for g in gateway_rows if str(g.id) not in used_gateway]

    for b in bank_rows:
        if str(b.id) in used_bank:
            continue
        best = None
        for g in gateway_remaining:
            if abs(b.amount - g.amount) <= amount_tol and abs(b.date - g.date) <= date_tol:
                best = g
                break
        if best:
            mark_matched(b, best)
            gateway_remaining = [g for g in gateway_remaining if str(g.id) not in used_gateway]

    bank_remaining = [b for b in bank_rows if str(b.id) not in used_bank]
    gateway_remaining = [g for g in gateway_rows if str(g.id) not in used_gateway]

    for b in bank_remaining:
        results.append(
            ReconciliationResult(
                organization_id=organization_id,
                bank_transaction_id=b.id,
                gateway_transaction_id=None,
                match_status="missing_in_gateway",
                mismatch_reason="No matching gateway transaction",
            )
        )

    for g in gateway_remaining:
        results.append(
            ReconciliationResult(
                organization_id=organization_id,
                bank_transaction_id=None,
                gateway_transaction_id=g.id,
                match_status="missing_in_bank",
                mismatch_reason="No matching bank transaction",
            )
        )

    db.add_all(results)
    db.commit()

    summary = ReconciliationSummary(
        matched=sum(1 for r in results if r.match_status == "matched"),
        missing_in_bank=sum(1 for r in results if r.match_status == "missing_in_bank"),
        missing_in_gateway=sum(1 for r in results if r.match_status == "missing_in_gateway"),
        amount_mismatch=sum(1 for r in results if r.match_status == "amount_mismatch"),
    )

    return ReconciliationRunResponse(organization_id=organization_id, summary=summary)
