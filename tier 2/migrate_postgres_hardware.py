import psycopg2
from urllib.parse import urlparse
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Define the database URL (defaulting to the docker-compose internal network URL)
# Since we are running this script inside the backend container or from the host, 
# we need to be careful about the hostname. Assuming we'll run it from the host via scripts/docker-compose exec
# For local host execution against the mapped port:
DB_URL = "postgresql://agrisphere_user:agrisphere_password@localhost:5432/agrisphere_db"

def migrate():
    print("Connecting to database...")
    result = urlparse(DB_URL)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port
    
    try:
        connection = psycopg2.connect(
            database=database,
            user=username,
            password=password,
            host=hostname,
            port=port
        )
        cursor = connection.cursor()
        
        # New columns to add based on the hardware diagram
        new_columns = [
            ("soil_temp", "REAL"),
            ("soil_ec", "REAL"),
            ("air_pressure", "REAL"),
            ("light_intensity", "REAL"),
            ("water_level", "REAL"),
            ("flow_rate", "REAL"),
            ("battery_voltage", "REAL")
        ]
        
        for col_name, col_type in new_columns:
            try:
                # Add the column
                # Since SQLite and Postgres use slightly different float syntaxes, REAL maps well to Float in SQLAlchemy
                print(f"Adding column '{col_name}'...")
                cursor.execute(f"ALTER TABLE soil_data ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                connection.commit()
                print(f"Successfully added '{col_name}'")
            except psycopg2.errors.DuplicateColumn:
                print(f"Column '{col_name}' already exists.")
                connection.rollback()
            except Exception as e:
                print(f"Error adding '{col_name}': {e}")
                connection.rollback()

        print("Migration complete!")
        
    except psycopg2.Error as e:
        print(f"Database connection error: {e}")
    finally:
        if 'connection' in locals() and connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")

if __name__ == "__main__":
    migrate()
