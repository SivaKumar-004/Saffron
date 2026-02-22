from sqlalchemy import Column, Integer, Float, String, DateTime
from database import Base
import datetime

class SoilDataDB(Base):
    __tablename__ = "soil_data"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, index=True, nullable=True) # Will change to False after legacy data is handled
    moisture = Column(Float, nullable=False)
    temp = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    ph = Column(Float, nullable=True) # Added pH column, nullable for backwards compatibility
    nitrogen = Column(Float, nullable=True)     # Added for DSS (mg/kg)
    phosphorus = Column(Float, nullable=True)   # Added for DSS (mg/kg)
    potassium = Column(Float, nullable=True)    # Added for DSS (mg/kg)
    rainfall = Column(Float, nullable=True)     # Added for DSS (mm)
    timestamp = Column(String, nullable=False) # Storing as ISO string for simplicity out of ESP32

class FarmerDB(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    location = Column(String)
