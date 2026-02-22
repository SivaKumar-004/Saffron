import sqlite3
import sqlalchemy
from database import engine

try:
    with engine.connect() as conn:
        # Check if pH exists, if not, add it
        columns = [row[1] for row in conn.execute(sqlalchemy.text("PRAGMA table_info(soil_data);"))]
        if 'ph' not in columns:
            print("Adding 'ph' column to soil_data table...")
            conn.execute(sqlalchemy.text("ALTER TABLE soil_data ADD COLUMN ph FLOAT DEFAULT 7.0;"))
            conn.commit()
            print("Column added successfully.")
        else:
            print("'ph' column already exists.")
except Exception as e:
    print(f"Error: {e}")
