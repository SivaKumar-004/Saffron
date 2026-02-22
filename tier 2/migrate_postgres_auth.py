import sqlalchemy
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./soil_data.db")

try:
    if DATABASE_URL.startswith("postgres"):
        engine = sqlalchemy.create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # 1. Add the column for multi-tenancy
            try:
                conn.execute(sqlalchemy.text("ALTER TABLE soil_data ADD COLUMN farmer_id INTEGER;"))
                print("Successfully added farmer_id column to soil_data table.")
            except sqlalchemy.exc.ProgrammingError as e:
                # Column likely already exists
                print(f"Skipped adding farmer_id column: {e}")
                
            # 2. Add foreign key constraint if Farmers table exists
            try:
                conn.execute(sqlalchemy.text("ALTER TABLE soil_data ADD CONSTRAINT fk_farmer FOREIGN KEY (farmer_id) REFERENCES farmers (id);"))
                print("Successfully added foreign key constraint.")
            except sqlalchemy.exc.ProgrammingError as e:
                print(f"Skipped foreign key constraint: {e}")
                
            conn.commit()
    else:
        print("Not using PostgreSQL. SQLite migrations should be handled manually or via Alembic.")

except Exception as e:
    print(f"Migration error: {e}")
