import time
import requests
import random
from datetime import datetime

API_URL = "http://localhost:8000/api/soil-data"
FARMER_ID = 1  # Note: The database must have a farmer with ID=1. If not, this script will fail.

print("=========================================")
print(f" Simulating physical node for Farmer #{FARMER_ID}")
print("=========================================\n")

def generate_telemetry(farmer_id, base_temp=25.0, base_hum=60.0):
    # Simulate realistic fluctuations
    temp = base_temp + random.uniform(-2.0, 2.0)
    humidity = base_hum + random.uniform(-5.0, 5.0)
    moisture = 50.0 + random.uniform(-10.0, 10.0)
    # Simulate DSS parameters
    ph = 6.5 + random.uniform(-0.5, 0.5)
    nitrogen = 100.0 + random.uniform(-20.0, 20.0)
    phosphorus = 50.0 + random.uniform(-10.0, 10.0)
    potassium = 80.0 + random.uniform(-15.0, 15.0)
    rainfall = max(0.0, random.uniform(-5.0, 10.0)) # Sometimes no rain

    payload = {
        "farmer_id": farmer_id,
        "moisture": float(round(moisture, 2)),
        "temp": float(round(temp, 2)),
        "humidity": float(round(humidity, 2)),
        "ph": float(round(ph, 2)),
        "nitrogen": float(round(nitrogen, 2)),
        "phosphorus": float(round(phosphorus, 2)),
        "potassium": float(round(potassium, 2)),
        "rainfall": float(round(rainfall, 2)),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    return payload, moisture, temp, ph # Return individual values for printing

while True:
    try:
        # Simulate physical analog sensors wildly fluctuating based on weather
        payload, moisture, temp, ph = generate_telemetry(FARMER_ID)
        
        # Throw the JSON packet over the network, exactly like the C++ http.POST()
        response = requests.post(API_URL, json=payload)
        
        if response.status_code == 201:
            print(f"[WIFI TX SUCCESS] --> Moisture: {moisture}% | Temp: {temp}°C | pH: {ph}")
        else:
            print(f"[HTTP {response.status_code} ERROR] Backend refused packet: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("[WIFI TX FAILED] Cannot reach backend server. Is Docker running?")
    except Exception as e:
        print(f"[CRASH] Loop iteration failed: {e}")
        
    # Sleep for 10 seconds before the loop repeats, mimicking delay(10000);
    time.sleep(10)
