import psycopg2
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set.")
    exit(1)

# Parse DATABASE_URL
result = urlparse(DATABASE_URL)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port

# Hardcode for docker internal resolution if running from backend container
if hostname == "db":
    print("Detected docker hostname, using db.")
    # No change needed if we are inside the container network

try:
    print(f"Connecting to Postgres database at {hostname}:{port}...")
    connection = psycopg2.connect(
        user=username,
        password=password,
        host=hostname,
        port=port,
        database=database
    )
    cursor = connection.cursor()

    # SQL to add columns if they don't exist
    queries = [
        "ALTER TABLE soil_data ADD COLUMN IF NOT EXISTS nitrogen DOUBLE PRECISION;",
        "ALTER TABLE soil_data ADD COLUMN IF NOT EXISTS phosphorus DOUBLE PRECISION;",
        "ALTER TABLE soil_data ADD COLUMN IF NOT EXISTS potassium DOUBLE PRECISION;",
        "ALTER TABLE soil_data ADD COLUMN IF NOT EXISTS rainfall DOUBLE PRECISION;"
    ]

    for query in queries:
        print(f"Executing: {query}")
        cursor.execute(query)

    connection.commit()
    print("Migration applied successfully. Added NPK and Rainfall columns.")

except (Exception, psycopg2.Error) as error:
    print("Error while connecting to or migrating PostgreSQL", error)
finally:
    if connection:
        cursor.close()
        connection.close()
        print("PostgreSQL connection is closed")
