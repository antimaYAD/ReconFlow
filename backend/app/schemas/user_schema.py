import uuid
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    organization_name: str
    email: EmailStr
    full_name: str | None = None
    password: str
    role: str = "admin"


class UserResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    role: str
    is_active: bool

    model_config = {"from_attributes": True}
