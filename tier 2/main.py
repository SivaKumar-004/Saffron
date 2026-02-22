from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import database
import models
import os
import random
from datetime import datetime, timedelta
import google.generativeai as genai
from dotenv import load_dotenv

from services.crop_prediction import predict_crop_suitability
from services.fertilizer_optimizer import calculate_fertilizer_deficit
from services.reasoning_engine import generate_decision

load_dotenv()

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)
    # Using 'gemini-2.5-flash-lite' as the new API key doesn't support 1.5 versions
    gemini_model = genai.GenerativeModel("gemini-2.5-flash-lite")
else:
    gemini_model = None

# Create all DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AgriSphere API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class SoilData(BaseModel):
    farmer_id: int
    moisture: float
    temp: float
    humidity: float
    ph: Optional[float] = 7.0 # Default to neutral if previous ESP32 firmware connects
    nitrogen: Optional[float] = 0.0     # Default for backward compatibility
    phosphorus: Optional[float] = 0.0   # Default for backward compatibility
    potassium: Optional[float] = 0.0    # Default for backward compatibility
    rainfall: Optional[float] = 0.0     # Default for backward compatibility
    
    # New IoT Hardware Sensors
    soil_temp: Optional[float] = None
    soil_ec: Optional[float] = None
    air_pressure: Optional[float] = None
    light_intensity: Optional[float] = None
    water_level: Optional[float] = None
    flow_rate: Optional[float] = None
    battery_voltage: Optional[float] = None

    timestamp: str
    
class SoilDataResponse(SoilData):
    id: int
    class Config:
        orm_mode = True

class FarmerRegistration(BaseModel):
    name: str
    phone: str
    location: str

class FarmerLogin(BaseModel):
    phone: str

@app.post("/api/soil-data", status_code=201)
async def receive_soil_data(data: SoilData, db: Session = Depends(get_db)):
    if data.moisture < 0 or data.moisture > 100:
        raise HTTPException(status_code=400, detail="Moisture out of bounds (0-100%)")
    
    db_soil = models.SoilDataDB(**data.dict())
    db.add(db_soil)
    db.commit()
    db.refresh(db_soil)
    return {"status": "success", "message": "Soil data recorded to Database"}

@app.get("/api/soil-data", response_model=List[SoilDataResponse])
async def get_soil_data(farmer_id: int, db: Session = Depends(get_db)):
    # Return last 50 readings for this specific farmer
    return db.query(models.SoilDataDB).filter(models.SoilDataDB.farmer_id == farmer_id).order_by(models.SoilDataDB.id.desc()).limit(50).all()[::-1]

@app.get("/api/predict-crop")
async def predict_crop(farmer_id: int, db: Session = Depends(get_db)):
    latest = db.query(models.SoilDataDB).filter(models.SoilDataDB.farmer_id == farmer_id).order_by(models.SoilDataDB.id.desc()).first()
    
    if not latest:
        return {"prediction": "Waiting for sensor data..."}
    
    predictions = predict_crop_suitability(
        nitrogen=latest.nitrogen,
        phosphorus=latest.phosphorus,
        potassium=latest.potassium,
        ph=latest.ph,
        temp=latest.temp,
        humidity=latest.humidity,
        rainfall=latest.rainfall
    )
    
    if not predictions:
        return {"prediction": "No suitable crops found."}
        
    return {"prediction": f"Top match: {predictions[0]['crop']} ({predictions[0]['suitability_score']}%)"}

@app.get("/api/fertilizer")
async def recommend_fertilizer(farmer_id: int, crop_name: str = "Tomato", db: Session = Depends(get_db)):
    latest = db.query(models.SoilDataDB).filter(models.SoilDataDB.farmer_id == farmer_id).order_by(models.SoilDataDB.id.desc()).first()
    if not latest:
        return {"recommendation": "Waiting for sensor data..."}
        
    fert_data = calculate_fertilizer_deficit(
        crop_name=crop_name,
        current_n=latest.nitrogen,
        current_p=latest.phosphorus,
        current_k=latest.potassium
    )
    
    if "error" in fert_data:
        return {"recommendation": fert_data["error"]}
        
    return {"recommendation": fert_data["recommendation"]}

@app.get("/api/dss-insight")
async def get_dss_insight(farmer_id: int, region: str = "Central", current_month: int = datetime.utcnow().month, db: Session = Depends(get_db)):
    latest = db.query(models.SoilDataDB).filter(models.SoilDataDB.farmer_id == farmer_id).order_by(models.SoilDataDB.id.desc()).first()
    
    if not latest:
        raise HTTPException(status_code=404, detail="No sensor data available to generate insights.")
        
    insight = generate_decision(
        farmer_soil_data=latest,
        region=region,
        current_month=current_month,
        gemini_model=gemini_model
    )
    
    return insight

@app.get("/api/dss-custom-crop-insight")
async def get_dss_custom_crop_insight(farmer_id: int, target_crop: str, db: Session = Depends(get_db)):
    latest = db.query(models.SoilDataDB).filter(models.SoilDataDB.farmer_id == farmer_id).order_by(models.SoilDataDB.id.desc()).first()
    
    if not latest:
        raise HTTPException(status_code=404, detail="No sensor data available to generate insights.")
        
    explanation = "Data synthesis complete. (No AI Model Provided)"
    if gemini_model:
        synthesis_prompt = f"""
        Act as an Expert Agronomist providing custom precision agriculture advice. 
        The farmer wants to know if their current soil and environment are optimal for **{target_crop}** (whether they are planning to plant it, or it is already growing).
        
        Here is the farmer's LIVE soil and environmental telemetry:
        - Soil Nitrogen: {latest.nitrogen} mg/kg
        - Soil Phosphorus: {latest.phosphorus} mg/kg
        - Soil Potassium: {latest.potassium} mg/kg
        - Soil pH: {latest.ph}
        - Soil Moisture: {latest.moisture}%
        - Soil Temp: {latest.soil_temp or latest.temp}°C
        - Ambient Temp: {latest.temp}°C
        - Ambient Humidity: {latest.humidity}%
        - Light Intensity: {latest.light_intensity or 'Unknown'} Lux
        
        Analyze these exact metrics against the ideal growing conditions for {target_crop}. 
        Provide a concise, 3-to-4 sentence response covering:
        1. A clear assessment of whether the current conditions are healthy for {target_crop}.
        2. The primary limiting factor(s) or stressors in their current soil/environment.
        3. A specific, actionable fertilizer, water, or cultivation modification plan to optimize the yield for {target_crop}.
        """
        
        try:
            explanation = gemini_model.generate_content(synthesis_prompt).text.strip()
        except Exception as e:
            explanation = f"AI Error evaluating custom crop decision: {str(e)}"
            
    return {
        "target_crop": target_crop,
        "explanation": explanation
    }

@app.get("/api/disaster-alerts")
async def get_disaster_alerts(farmer_id: int, db: Session = Depends(get_db)):
    latest = db.query(models.SoilDataDB).filter(models.SoilDataDB.farmer_id == farmer_id).order_by(models.SoilDataDB.id.desc()).first()
    if not latest:
        return {"alerts": []}
        
    alerts = []
    if latest.temp > 40:
        alerts.append({"type": "Heatwave", "severity": "HIGH", "message": "Extreme heat detected. Increase irrigation."})
    if latest.moisture > 90:
        alerts.append({"type": "Flood", "severity": "MEDIUM", "message": "Soil saturation approaching 100%. Check drainage."})
        
    return {"alerts": alerts}

@app.post("/api/farmer-register", status_code=201)
async def register_farmer(farmer: FarmerRegistration, db: Session = Depends(get_db)):
    # 1. Register the Farmer
    db_farmer = models.FarmerDB(**farmer.dict())
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer) # Retrieve the generated farmer.id
    
    # 2. Auto-Seed 15 historical telemetry records for the new dashboard
    seed_records = []
    now = datetime.utcnow()
    
    for i in range(15):
        # Go back in time: 1 hour apart for each reading
        past_time = now - timedelta(hours=(15 - i))
        
        # Generate realistic random variations, casting round() to float for pyre typings
        soil = models.SoilDataDB(
            farmer_id=db_farmer.id,
            moisture=float(round(random.uniform(35.0, 55.0), 1)),
            temp=float(round(random.uniform(22.0, 28.0), 1)),
            humidity=float(round(random.uniform(45.0, 65.0), 1)),
            ph=float(round(random.uniform(6.2, 7.1), 1)),
            nitrogen=float(round(random.uniform(80.0, 140.0), 1)),    # Mock N (mg/kg)
            phosphorus=float(round(random.uniform(30.0, 70.0), 1)),   # Mock P (mg/kg)
            potassium=float(round(random.uniform(40.0, 100.0), 1)),   # Mock K (mg/kg)
            rainfall=float(round(random.uniform(0.0, 15.0), 1)),      # Mock rain (mm)
            
            # New mock hardware sensors
            soil_temp=float(round(random.uniform(20.0, 26.0), 1)),    # Soil Temp (°C)
            soil_ec=float(round(random.uniform(1.2, 1.8), 2)),        # Soil EC (ms/cm)
            air_pressure=float(round(random.uniform(1010.0, 1015.0), 1)), # Air Pressure (hPa)
            light_intensity=float(round(random.uniform(40000.0, 60000.0), 0)), # Light (Lux)
            water_level=float(round(random.uniform(60.0, 95.0), 1)),  # Tank Level (%)
            flow_rate=float(round(random.uniform(0.0, 2.5), 2)),      # Water flow (L/min)
            battery_voltage=float(round(random.uniform(3.8, 4.2), 2)),# Battery (V)
            
            timestamp=past_time.isoformat() + "Z" # Append Z for UTC conformity
        )
        seed_records.append(soil)
        
    # Bulk insert all 15 records
    db.add_all(seed_records)
    db.commit()

    return {"status": "success", "message": f"Farmer {farmer.name} registered and dashboard auto-seeded with 15 records."}

@app.post("/api/login")
async def login_farmer(login: FarmerLogin, db: Session = Depends(get_db)):
    farmer = db.query(models.FarmerDB).filter(models.FarmerDB.phone == login.phone).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found with that phone number")
    return {"status": "success", "farmer_id": farmer.id, "name": farmer.name}

@app.get("/")
def health_check():
    return {"status": "AgriSphere DB API is running"}
