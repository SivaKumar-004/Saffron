import database
import models
from sqlalchemy.orm import Session

db = database.SessionLocal()
try:
    farmers = db.query(models.FarmerDB).all()
    print(f"Found {len(farmers)} farmers")
    for f in farmers:
        print(f"ID: {f.id}, Name: {f.name}, Phone: {f.phone}")
except Exception as e:
    print(f"Error querying DB: {e}")
finally:
    db.close()
