import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import String, Date, Numeric, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)

    transaction_id: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    reference: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    file_upload_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("file_uploads.id"), nullable=True)
