import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import String, Date, Numeric, DateTime, Uuid, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)

    invoice_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    invoice_number: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    vendor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending", index=True)
    payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    file_upload_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("file_uploads.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
