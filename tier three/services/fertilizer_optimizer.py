from typing import Dict

# Dictionary defining exact target NPK requirements in kg/hectare
CROP_REQUIREMENTS = {
    "Tomato": {"N": 100, "P": 60, "K": 120},
    "Rice": {"N": 120, "P": 40, "K": 40},
    "Maize": {"N": 150, "P": 50, "K": 100},
    "Wheat": {"N": 120, "P": 60, "K": 40},
}

def calculate_fertilizer_deficit(crop_name: str, current_n: float, current_p: float, current_k: float) -> Dict:
    requirements = CROP_REQUIREMENTS.get(crop_name)
    if not requirements:
        return {"error": "Crop requirements unknown."}
        
    # Calculate Deficits (Target - Current)
    deficit_n = max(0, requirements["N"] - current_n)
    deficit_p = max(0, requirements["P"] - current_p)
    deficit_k = max(0, requirements["K"] - current_k)
    
    # Simple recommendation logic
    recommendation = ""
    if deficit_n > 50:
        recommendation += "High Nitrogen deficit: Apply Urea or organic compost heavily. "
    elif deficit_n > 0:
        recommendation += "Moderate Nitrogen deficit: Apply Urea moderately. "
    
    if deficit_k > 40:
        recommendation += "Potassium deficit: Consider Potash or wood ash. "
        
    if deficit_p > 20: 
        recommendation += "Phosphorus deficit: Consider superphosphate. "
        
    return {
        "crop": crop_name,
        "deficits": {"N": deficit_n, "P": deficit_p, "K": deficit_k},
        "recommendation": recommendation.strip() or "Soil nutrients are optimal."
    }
