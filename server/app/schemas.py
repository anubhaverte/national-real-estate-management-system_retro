from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import RoleEnum, RentOrBuyEnum, PropertyStatusEnum

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: RoleEnum
    agency_name: Optional[str] = None
    contact_info: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: RoleEnum
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class PropertyCreate(BaseModel):
    city: str
    address: str
    rent_or_buy: RentOrBuyEnum
    price: float
    bhk: Optional[int] = 2
    sqft: Optional[float] = 1000.0
    amenities: Optional[str] = "Parking, Lift, Power Backup, 24x7 Security"
    remarks: Optional[str] = None

class PropertyUpdate(BaseModel):
    city: Optional[str] = None
    address: Optional[str] = None
    rent_or_buy: Optional[RentOrBuyEnum] = None
    price: Optional[float] = None
    bhk: Optional[int] = None
    sqft: Optional[float] = None
    amenities: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[PropertyStatusEnum] = None

class AgentOut(BaseModel):
    id: int
    agency_name: str
    contact_info: str

    class Config:
        from_attributes = True

class PropertyOut(BaseModel):
    id: int
    agent_id: int
    city: str
    address: str
    rent_or_buy: RentOrBuyEnum
    price: float
    bhk: Optional[int] = 2
    sqft: Optional[float] = 1000.0
    amenities: Optional[str] = "Parking, Lift, Power Backup, 24x7 Security"
    is_verified: Optional[bool] = True
    remarks: Optional[str]
    status: PropertyStatusEnum
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    created_at: datetime
    agent: AgentOut

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    property_id: int
    payment_method: Optional[str] = "Net Banking"

class TransactionOut(BaseModel):
    id: int
    property_id: int
    buyer_id: int
    agent_id: int
    price: float
    stamp_duty: Optional[float] = 0.0
    registration_fee: Optional[float] = 0.0
    total_amount: Optional[float] = 0.0
    deed_number: Optional[str] = None
    payment_method: Optional[str] = "Net Banking"
    transaction_type: RentOrBuyEnum
    transaction_time: datetime
    property: PropertyOut
    buyer: UserOut
    agent: AgentOut

    class Config:
        from_attributes = True
