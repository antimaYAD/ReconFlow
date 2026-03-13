import uuid
from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    description: str
    amount: Decimal
    date: date
    category: str


class ExpenseResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    description: str
    amount: Decimal
    date: date
    category: str
    auto_categorized: bool

    model_config = {"from_attributes": True}


class ExpenseCategoryCreate(BaseModel):
    name: str
    rule_pattern: str | None = None


class ExpenseCategoryResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    rule_pattern: str | None

    model_config = {"from_attributes": True}
