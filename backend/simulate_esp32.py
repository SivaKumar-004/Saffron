import time
import requests
import random

API_URL = "http://localhost:8000/api/soil-data"
FARMER_ID = 1  # Note: The database must have a farmer with ID=1. If not, this script will fail.

print("=========================================")
print(f" Starting ESP32 Hardware Simulator")
print(f" Targeting Backend: {API_URL}")
print(f" Simulating physical node for Farmer #{FARMER_ID}")
print("=========================================\n")

while True:
    try:
        # Simulate physical analog sensors wildly fluctuating based on weather
        moisture = round(random.uniform(35.0, 65.0), 1)
        temp = round(random.uniform(20.0, 30.0), 1)
        humidity = round(random.uniform(40.0, 80.0), 1)
        ph = round(random.uniform(6.0, 7.5), 1)

        payload = {
            "farmer_id": FARMER_ID,
            "moisture": moisture,
            "temp": temp,
            "humidity": humidity,
            "ph": ph,
            "timestamp": "2026-02-21T10:00:00Z" 
        }
        
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
