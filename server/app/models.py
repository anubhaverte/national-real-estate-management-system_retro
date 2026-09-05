from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    BUYER = "BUYER"
    SELLER = "SELLER"
    ADMIN = "ADMIN"

class RentOrBuyEnum(str, enum.Enum):
    RENT = "RENT"
    BUY = "BUY"

class PropertyStatusEnum(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    RENTED = "RENTED"
    SOLD = "SOLD"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agent_profile = relationship("Agent", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="buyer", foreign_keys="[Transaction.buyer_id]")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    agency_name = Column(String(255), nullable=False)
    contact_info = Column(String(255), nullable=False)

    user = relationship("User", back_populates="agent_profile")
    properties = relationship("Property", back_populates="agent")
    transactions = relationship("Transaction", back_populates="agent", foreign_keys="[Transaction.agent_id]")

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    city = Column(String(255), index=True, nullable=False)
    address = Column(String(255), nullable=False)
    rent_or_buy = Column(Enum(RentOrBuyEnum), index=True, nullable=False)
    price = Column(Float, index=True, nullable=False)
    bhk = Column(Integer, nullable=True, default=2)
    sqft = Column(Float, nullable=True, default=1000.0)
    amenities = Column(String(500), nullable=True, default="Parking, Lift, Power Backup, 24x7 Security")
    is_verified = Column(Boolean, default=True)
    remarks = Column(String(1000))
    status = Column(Enum(PropertyStatusEnum), default=PropertyStatusEnum.AVAILABLE, nullable=False)
    photo_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agent = relationship("Agent", back_populates="properties")
    transactions = relationship("Transaction", back_populates="property")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    price = Column(Float, nullable=False)
    stamp_duty = Column(Float, nullable=True, default=0.0)
    registration_fee = Column(Float, nullable=True, default=0.0)
    total_amount = Column(Float, nullable=True, default=0.0)
    deed_number = Column(String(100), nullable=True)
    payment_method = Column(String(100), nullable=True, default="Net Banking")
    transaction_type = Column(Enum(RentOrBuyEnum), nullable=False)
    transaction_time = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("Property", back_populates="transactions")
    buyer = relationship("User", back_populates="transactions", foreign_keys=[buyer_id])
    agent = relationship("Agent", back_populates="transactions", foreign_keys=[agent_id])
