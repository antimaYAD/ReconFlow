from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.models.invoice import Invoice
from app.models.file_upload import FileUpload
from app.schemas.invoice_schema import InvoiceCreate, InvoiceResponse, InvoiceOCRResult
from app.services.invoice_service import extract_invoice_data_ocr


router = APIRouter()


@router.post("/upload-ocr", response_model=InvoiceOCRResult)
def upload_invoice_ocr(
    file: UploadFile = File(...),
    user: User = Depends(require_role("admin", "accountant")),
):
    if not file.filename.lower().endswith((".txt", ".pdf", ".jpg", ".png")):
        raise HTTPException(status_code=400, detail="Unsupported file type for OCR")

    extracted = extract_invoice_data_ocr(file)
    return InvoiceOCRResult(**extracted)


@router.post("/", response_model=InvoiceResponse)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "accountant")),
):
    invoice = Invoice(
        organization_id=user.organization_id,
        invoice_type=payload.invoice_type,
        invoice_number=payload.invoice_number,
        vendor_name=payload.vendor_name,
        customer_name=payload.customer_name,
        amount=payload.amount,
        invoice_date=payload.invoice_date,
        due_date=payload.due_date,
        status=payload.status,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/", response_model=list[InvoiceResponse])
def list_invoices(
    invoice_type: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Invoice).filter(Invoice.organization_id == user.organization_id)
    if invoice_type:
        query = query.filter(Invoice.invoice_type == invoice_type)
    if status:
        query = query.filter(Invoice.status == status)
    return query.order_by(Invoice.invoice_date.desc()).all()


@router.get("/overdue", response_model=list[InvoiceResponse])
def list_overdue_invoices(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from datetime import date as dt_date
    today = dt_date.today()
    return (
        db.query(Invoice)
        .filter(
            Invoice.organization_id == user.organization_id,
            Invoice.status == "pending",
            Invoice.due_date < today,
        )
        .order_by(Invoice.due_date.asc())
        .all()
    )
