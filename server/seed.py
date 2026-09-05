import sys
import os

# Add server path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app import models, auth

def seed():
    # Create all tables (will not drop, just create if not exists)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if admin already exists
    admin = db.query(models.User).filter(models.User.email == "admin@gov.in").first()
    if not admin:
        admin = models.User(
            email="admin@gov.in",
            name="System Administrator",
            password_hash=auth.get_password_hash("admin123"),
            role=models.RoleEnum.ADMIN
        )
        db.add(admin)
        print("Created Admin user")

    # Check if seller exists
    seller = db.query(models.User).filter(models.User.email == "seller@example.com").first()
    if not seller:
        seller = models.User(
            email="seller@example.com",
            name="Ramesh Properties",
            password_hash=auth.get_password_hash("seller123"),
            role=models.RoleEnum.SELLER
        )
        db.add(seller)
        db.commit()
        db.refresh(seller)
        
        agent = models.Agent(
            user_id=seller.id,
            agency_name="Ramesh Properties Ltd",
            contact_info="9876543210"
        )
        db.add(agent)
        print("Created Seller user and Agent profile")
        
        # Add a property for this seller
        db.commit()
        db.refresh(agent)
        
        prop1 = models.Property(
            agent_id=agent.id,
            city="Delhi",
            address="Connaught Place, Block C",
            rent_or_buy=models.RentOrBuyEnum.RENT,
            price=50000.0,
            remarks="Prime location for office space"
        )
        prop2 = models.Property(
            agent_id=agent.id,
            city="Mumbai",
            address="Andheri West, Lokhandwala",
            rent_or_buy=models.RentOrBuyEnum.BUY,
            price=15000000.0,
            remarks="2BHK with sea view"
        )
        db.add(prop1)
        db.add(prop2)
        print("Created Properties")

    # Check if buyer exists
    buyer = db.query(models.User).filter(models.User.email == "buyer@example.com").first()
    if not buyer:
        buyer = models.User(
            email="buyer@example.com",
            name="Suresh Kumar",
            password_hash=auth.get_password_hash("buyer123"),
            role=models.RoleEnum.BUYER
        )
        db.add(buyer)
        print("Created Buyer user")

    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed()
