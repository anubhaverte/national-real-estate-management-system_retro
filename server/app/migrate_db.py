from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        print("Starting DB Schema Migration...")
        
        # Properties table additions
        property_cols = [
            ("bhk", "INT DEFAULT 2"),
            ("sqft", "FLOAT DEFAULT 1000.0"),
            ("amenities", "VARCHAR(500) DEFAULT 'Parking, Lift, Power Backup, 24x7 Security'"),
            ("is_verified", "BOOLEAN DEFAULT TRUE")
        ]
        for col_name, col_type in property_cols:
            try:
                conn.execute(text(f"ALTER TABLE properties ADD COLUMN {col_name} {col_type};"))
                conn.commit()
                print(f"Added column properties.{col_name}")
            except Exception as e:
                print(f"Column properties.{col_name} already exists or error: {e}")

        # Transactions table additions
        transaction_cols = [
            ("stamp_duty", "FLOAT DEFAULT 0.0"),
            ("registration_fee", "FLOAT DEFAULT 0.0"),
            ("total_amount", "FLOAT DEFAULT 0.0"),
            ("deed_number", "VARCHAR(100)"),
            ("payment_method", "VARCHAR(100) DEFAULT 'Net Banking'")
        ]
        for col_name, col_type in transaction_cols:
            try:
                conn.execute(text(f"ALTER TABLE transactions ADD COLUMN {col_name} {col_type};"))
                conn.commit()
                print(f"Added column transactions.{col_name}")
            except Exception as e:
                print(f"Column transactions.{col_name} already exists or error: {e}")

        print("Migration finished!")

if __name__ == "__main__":
    migrate()
