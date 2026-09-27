import uuid
from datetime import date
from pydantic import BaseModel, EmailStr, Field
from app.models import CareerStatus

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class LoginRequest(RegisterRequest):
    pass

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CareerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    start_date: date | None = None
    season: str | None = Field(default=None, max_length=20)

class CareerResponse(BaseModel):
    id: uuid.UUID
    name: str
    status: CareerStatus
    start_date: date | None
    season: str | None
    model_config = {"from_attributes": True}
