import sqlalchemy

URL = "postgresql://agrisphere_user:agrisphere_password@localhost:5432/agrisphere_db"

try:
    engine = sqlalchemy.create_engine(URL)
    with engine.connect() as conn:
        print("Connected to PostgreSQL!")
        # Check columns
        result = conn.execute(sqlalchemy.text("SELECT column_name FROM information_schema.columns WHERE table_name='soil_data';"))
        columns = [row[0] for row in result]
        print(f"Current columns in soil_data: {columns}")
        
        if 'ph' not in columns:
            print("Adding 'ph' column...")
            conn.execute(sqlalchemy.text("ALTER TABLE soil_data ADD COLUMN ph FLOAT DEFAULT 7.0;"))
            conn.commit()
            print("'ph' column successfully added to PostgreSQL.")
        else:
            print("'ph' column already exists in PostgreSQL.")
except Exception as e:
    print(f"Error: {e}")
