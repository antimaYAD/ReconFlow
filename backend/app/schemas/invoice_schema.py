import uuid
from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class InvoiceCreate(BaseModel):
    invoice_type: str
    invoice_number: str
    vendor_name: str | None = None
    customer_name: str | None = None
    amount: Decimal
    invoice_date: date
    due_date: date | None = None
    status: str = "pending"


class InvoiceResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    invoice_type: str
    invoice_number: str
    vendor_name: str | None
    customer_name: str | None
    amount: Decimal
    invoice_date: date
    due_date: date | None
    status: str
    payment_date: date | None

    model_config = {"from_attributes": True}


class InvoiceOCRResult(BaseModel):
    vendor_name: str | None = None
    invoice_number: str | None = None
    amount: Decimal | None = None
    invoice_date: date | None = None
    due_date: date | None = None
