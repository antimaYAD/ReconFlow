import uuid
from pydantic import BaseModel


class ReconciliationSummary(BaseModel):
    matched: int
    missing_in_bank: int
    missing_in_gateway: int
    amount_mismatch: int


class ReconciliationRunResponse(BaseModel):
    organization_id: uuid.UUID
    summary: ReconciliationSummary
