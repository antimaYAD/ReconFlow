import io
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.expense import Expense
from app.models.reconciliation_result import ReconciliationResult


router = APIRouter()


@router.get("/dashboard-summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    total_transactions = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.organization_id == user.organization_id)
        .scalar()
    )

    recon_matched = (
        db.query(func.count(ReconciliationResult.id))
        .filter(
            ReconciliationResult.organization_id == user.organization_id,
            ReconciliationResult.match_status == "matched",
        )
        .scalar()
    )

    recon_missing_bank = (
        db.query(func.count(ReconciliationResult.id))
        .filter(
            ReconciliationResult.organization_id == user.organization_id,
            ReconciliationResult.match_status == "missing_in_bank",
        )
        .scalar()
    )

    recon_missing_gateway = (
        db.query(func.count(ReconciliationResult.id))
        .filter(
            ReconciliationResult.organization_id == user.organization_id,
            ReconciliationResult.match_status == "missing_in_gateway",
        )
        .scalar()
    )

    expense_breakdown = (
        db.query(Expense.category, func.sum(Expense.amount))
        .filter(Expense.organization_id == user.organization_id)
        .group_by(Expense.category)
        .all()
    )

    return {
        "total_transactions": total_transactions or 0,
        "reconciliation": {
            "matched": recon_matched or 0,
            "missing_in_bank": recon_missing_bank or 0,
            "missing_in_gateway": recon_missing_gateway or 0,
        },
        "expense_breakdown": [{"category": cat, "total": float(total)} for cat, total in expense_breakdown],
    }


@router.get("/transactions/export-csv")
def export_transactions_csv(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction)
        .filter(Transaction.organization_id == user.organization_id)
        .order_by(Transaction.date.desc())
        .all()
    )

    csv_lines = ["transaction_id,amount,date,reference,source_type"]
    for t in transactions:
        csv_lines.append(
            f"{t.transaction_id or ''},{t.amount},{t.date},{t.reference or ''},{t.source_type}"
        )

    csv_content = "\n".join(csv_lines)
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=transactions.csv"})


@router.get("/expenses/export-csv")
def export_expenses_csv(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    expenses = (
        db.query(Expense)
        .filter(Expense.organization_id == user.organization_id)
        .order_by(Expense.date.desc())
        .all()
    )

    csv_lines = ["description,amount,date,category,auto_categorized"]
    for e in expenses:
        csv_lines.append(f'"{e.description}",{e.amount},{e.date},{e.category},{e.auto_categorized}')

    csv_content = "\n".join(csv_lines)
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=expenses.csv"})
