from typing import List, Dict

def predict_crop_suitability(nitrogen: float, phosphorus: float, potassium: float, ph: float, temp: float, humidity: float, rainfall: float) -> List[Dict]:
    """
    Mock ML Model inference based on ideal ranges for Crops in different conditions.
    """
    available_crops = [
        {"name": "Rice", "ideal_ph": (6.0, 7.0), "ideal_temp": (20, 27), "base_score": 85},
        {"name": "Tomato", "ideal_ph": (6.0, 6.8), "ideal_temp": (20, 24), "base_score": 92},
        {"name": "Maize", "ideal_ph": (5.8, 7.0), "ideal_temp": (18, 27), "base_score": 88},
        {"name": "Wheat", "ideal_ph": (6.0, 7.5), "ideal_temp": (15, 25), "base_score": 80},
    ]
    
    predictions = []
    for crop in available_crops:
        # Calculate penalties for deviations from ideal ranges
        ph_penalty = 0 if crop["ideal_ph"][0] <= ph <= crop["ideal_ph"][1] else 15
        temp_penalty = 0 if crop["ideal_temp"][0] <= temp <= crop["ideal_temp"][1] else 10
        
        # Calculate final ML probability proxy (0-100%)
        suitability_score = max(0, crop["base_score"] - ph_penalty - temp_penalty)
        predictions.append({"crop": crop["name"], "suitability_score": suitability_score})
        
    # Sort by highest suitability
    return sorted(predictions, key=lambda x: x["suitability_score"], reverse=True)
