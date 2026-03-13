from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.reconciliation_schema import ReconciliationRunResponse
from app.services.reconciliation_service import run_reconciliation_from_csv


router = APIRouter()


@router.post("/run", response_model=ReconciliationRunResponse)
def run_reconciliation(
    bank_csv: UploadFile = File(...),
    gateway_csv: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "accountant")),
):
    if not bank_csv.filename.lower().endswith(".csv") or not gateway_csv.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV supported for now")

    result = run_reconciliation_from_csv(
        db=db,
        organization_id=user.organization_id,
        bank_file=bank_csv,
        gateway_file=gateway_csv,
        actor_user_id=user.id,
    )
    return result
