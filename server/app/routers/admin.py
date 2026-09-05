from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import csv
import io
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.ADMIN))
):
    return db.query(models.User).all()

@router.get("/transactions", response_model=List[schemas.TransactionOut])
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.ADMIN))
):
    return db.query(models.Transaction).all()

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.ADMIN))
):
    total_listings = db.query(models.Property).count()
    total_transactions = db.query(models.Transaction).count()
    active_listings = db.query(models.Property).filter(models.Property.status == models.PropertyStatusEnum.AVAILABLE).count()
    sold_listings = db.query(models.Property).filter(models.Property.status == models.PropertyStatusEnum.SOLD).count()
    rented_listings = db.query(models.Property).filter(models.Property.status == models.PropertyStatusEnum.RENTED).count()
    
    transactions_by_city = db.query(
        models.Property.city, func.count(models.Transaction.id)
    ).join(models.Transaction).group_by(models.Property.city).all()

    return {
        "total_listings": total_listings,
        "total_transactions": total_transactions,
        "active_listings": active_listings,
        "sold_listings": sold_listings,
        "rented_listings": rented_listings,
        "transactions_by_city": [{"city": c[0], "count": c[1]} for c in transactions_by_city]
    }

@router.get("/transactions/export/csv")
def export_transactions_csv(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.ADMIN))
):
    transactions = db.query(models.Transaction).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Transaction ID", "Property ID", "Buyer ID", "Agent ID", "Price", "Type", "Date"])
    
    for t in transactions:
        writer.writerow([t.id, t.property_id, t.buyer_id, t.agent_id, t.price, t.transaction_type.value, t.transaction_time])
        
    response = Response(content=output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=transactions.csv"
    response.headers["Content-Type"] = "text/csv"
    
    return response
