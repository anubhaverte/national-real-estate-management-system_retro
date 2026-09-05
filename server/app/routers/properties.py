from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(prefix="/api/properties", tags=["properties"])

@router.get("/", response_model=List[schemas.PropertyOut])
def get_properties(
    city: Optional[str] = None,
    rent_or_buy: Optional[models.RentOrBuyEnum] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bhk: Optional[int] = None,
    min_sqft: Optional[float] = None,
    address: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Property).filter(models.Property.status == models.PropertyStatusEnum.AVAILABLE)
    
    if city:
        query = query.filter(models.Property.city.ilike(f"%{city}%"))
    if rent_or_buy:
        query = query.filter(models.Property.rent_or_buy == rent_or_buy)
    if min_price is not None:
        query = query.filter(models.Property.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Property.price <= max_price)
    if bhk is not None:
        query = query.filter(models.Property.bhk == bhk)
    if min_sqft is not None:
        query = query.filter(models.Property.sqft >= min_sqft)
    if address:
        query = query.filter(models.Property.address.ilike(f"%{address}%"))
        
    return query.order_by(models.Property.id.desc()).all()

@router.get("/{id}", response_model=schemas.PropertyOut)
def get_property(id: int, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop

@router.post("/", response_model=schemas.PropertyOut)
def create_property(
    prop: schemas.PropertyCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.SELLER))
):
    agent = db.query(models.Agent).filter(models.Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=400, detail="User is not an active agent")
        
    new_property = models.Property(**prop.model_dump(), agent_id=agent.id)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return new_property

@router.put("/{id}", response_model=schemas.PropertyOut)
def update_property(
    id: int,
    prop_update: schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.SELLER))
):
    prop = db.query(models.Property).filter(models.Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    if current_user.role != models.RoleEnum.ADMIN:
        agent = db.query(models.Agent).filter(models.Agent.user_id == current_user.id).first()
        if not agent or prop.agent_id != agent.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this property")
            
    for key, value in prop_update.model_dump(exclude_unset=True).items():
        setattr(prop, key, value)
        
    db.commit()
    db.refresh(prop)
    return prop

@router.delete("/{id}")
def delete_property(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.ADMIN))
):
    prop = db.query(models.Property).filter(models.Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}

@router.get("/seller/me", response_model=List[schemas.PropertyOut])
def get_my_properties(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.SELLER))
):
    agent = db.query(models.Agent).filter(models.Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=400, detail="User is not an active agent")
    return db.query(models.Property).filter(models.Property.agent_id == agent.id).all()

@router.post("/{id}/media", response_model=schemas.PropertyOut)
def upload_property_media(
    id: int,
    photo: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.require_role(models.RoleEnum.SELLER))
):
    prop = db.query(models.Property).filter(models.Property.id == id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
        
    agent = db.query(models.Agent).filter(models.Agent.user_id == current_user.id).first()
    if not agent or prop.agent_id != agent.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this property")
        
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    
    if photo:
        photo_filename = f"prop_{id}_photo_{photo.filename}"
        photo_path = os.path.join(uploads_dir, photo_filename)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        prop.photo_url = f"/uploads/{photo_filename}"
        
    if video:
        video_filename = f"prop_{id}_video_{video.filename}"
        video_path = os.path.join(uploads_dir, video_filename)
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        prop.video_url = f"/uploads/{video_filename}"
        
    db.commit()
    db.refresh(prop)
    return prop
