import requests
import json
from datetime import datetime

url = "http://localhost:8000/api/soil-data"

payload = {
  "moisture": 45.2,
  "temp": 28.5,
  "humidity": 60.1,
  "ph": 6.8,
  "timestamp": datetime.utcnow().isoformat() + "Z"
}

headers = {
  'Content-Type': 'application/json'
}

print(f"Sending dummy data: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
