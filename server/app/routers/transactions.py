from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.post("/", response_model=schemas.TransactionOut)
def create_transaction(
    trans: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.BUYER))
):
    prop = db.query(models.Property).filter(models.Property.id == trans.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if prop.status != models.PropertyStatusEnum.AVAILABLE:
        raise HTTPException(status_code=400, detail="Property is not available for transaction")

    # Financial Breakdown
    price = prop.price
    if prop.rent_or_buy == models.RentOrBuyEnum.BUY:
        stamp_duty = round(price * 0.05, 2)
        registration_fee = round(price * 0.01, 2)
        processing_fee = 1000.0
    else:
        stamp_duty = round(price * 0.01, 2)
        registration_fee = 500.0
        processing_fee = 0.0

    total_amount = round(price + stamp_duty + registration_fee + processing_fee, 2)
    deed_number = f"DEED-2026-{uuid.uuid4().hex[:8].upper()}"

    # Create transaction
    new_transaction = models.Transaction(
        property_id=prop.id,
        buyer_id=current_user.id,
        agent_id=prop.agent_id,
        price=price,
        stamp_duty=stamp_duty,
        registration_fee=registration_fee,
        total_amount=total_amount,
        deed_number=deed_number,
        payment_method=trans.payment_method or "Net Banking",
        transaction_type=prop.rent_or_buy
    )
    
    # Update property status
    if prop.rent_or_buy == models.RentOrBuyEnum.RENT:
        prop.status = models.PropertyStatusEnum.RENTED
    else:
        prop.status = models.PropertyStatusEnum.SOLD
        
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    return new_transaction

@router.get("/{id}", response_model=schemas.TransactionOut)
def get_transaction_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    tx = db.query(models.Transaction).filter(models.Transaction.id == id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction record not found")
        
    # Check permissions
    if current_user.role != models.RoleEnum.ADMIN and tx.buyer_id != current_user.id:
        agent = db.query(models.Agent).filter(models.Agent.user_id == current_user.id).first()
        if not agent or tx.agent_id != agent.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this transaction deed")
            
    return tx

@router.get("/buyer/me", response_model=List[schemas.TransactionOut])
def get_my_buyer_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.BUYER))
):
    return db.query(models.Transaction).filter(models.Transaction.buyer_id == current_user.id).order_by(models.Transaction.id.desc()).all()

@router.get("/seller/me", response_model=List[schemas.TransactionOut])
def get_my_seller_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.SELLER))
):
    agent = db.query(models.Agent).filter(models.Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=400, detail="User is not an active agent")
    return db.query(models.Transaction).filter(models.Transaction.agent_id == agent.id).order_by(models.Transaction.id.desc()).all()
