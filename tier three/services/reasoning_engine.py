from .crop_prediction import predict_crop_suitability
from .fertilizer_optimizer import calculate_fertilizer_deficit
from .market_api import MarketAnalyzer

def generate_decision(farmer_soil_data, region: str, current_month: int, gemini_model):
    # 1. Get Top Crops from ML proxy
    top_crops = predict_crop_suitability(
        nitrogen=farmer_soil_data.nitrogen, 
        phosphorus=farmer_soil_data.phosphorus, 
        potassium=farmer_soil_data.potassium,
        ph=farmer_soil_data.ph, 
        temp=farmer_soil_data.temp, 
        humidity=farmer_soil_data.humidity, 
        rainfall=farmer_soil_data.rainfall
    )
    
    if not top_crops:
        return {"error": "Could not predict suitable crops."}
        
    best_candidate = top_crops[0]["crop"]
    # 2. Get Fertilization Cost/Deficit for ALL candidates
    for crop in top_crops:
        crop_name = crop["crop"]
        f_data = calculate_fertilizer_deficit(
            crop_name, 
            current_n=farmer_soil_data.nitrogen,
            current_p=farmer_soil_data.phosphorus,
            current_k=farmer_soil_data.potassium
        )
        crop["fertilizer_plan"] = f_data.get("recommendation", "Unknown")
        crop["deficits"] = f_data.get("deficits", {})
        
        # Add specific cultivation solution text based on deficits
        cultivation_solution = f"To cultivate {crop_name} successfully, match the target NPK. "
        defs = f_data.get("deficits", {})
        if defs.get("N", 0) > 0 or defs.get("P", 0) > 0 or defs.get("K", 0) > 0:
            cultivation_solution += f"Required soil changes: Add {defs.get('N', 0):.1f}kg/ha Nitrogen, {defs.get('P', 0):.1f}kg/ha Phosphorus, and {defs.get('K', 0):.1f}kg/ha Potassium."
        else:
            cultivation_solution += "Current soil NPK is already optimal."
        crop["cultivation_solution"] = cultivation_solution
        
    # Variables for backwards compatibility with the top choice logic below
    best_candidate = top_crops[0]["crop"]
    fert_data = {
        "recommendation": top_crops[0]["fertilizer_plan"],
        "deficits": top_crops[0]["deficits"]
    }
    
    # 3. Get Market Viability for the best candidate
    market_data = MarketAnalyzer().check_viability(best_candidate, region, current_month)
    
    # 4. Synthesize the "Why" using LLM for natural language generation
    explanation = "Data synthesis complete. (No AI Model Provided)"
    if gemini_model:
        synthesis_prompt = f"""
        Act as an Expert Agronomist providing advice to a farmer in decision support. 
        Recommend they plant {best_candidate}.
        
        Reason 1 (Agronomic): Agronomic soil suitability based on ML analysis is {top_crops[0]['suitability_score']}%.
        Reason 2 (Fertilization): The precise fertilizer deficit is: N={fert_data.get('deficits', {}).get('N')} kg/ha, P={fert_data.get('deficits', {}).get('P')} kg/ha, K={fert_data.get('deficits', {}).get('K')} kg/ha. 
        Reason 3 (Market): Market saturation is currently {market_data['details']['market_saturation']}, making it a good time to plant.
        
        Explain clearly and concisely in 2 or 3 sentences why {best_candidate} is the most profitable and viable choice right now based on their exact soil {fert_data.get('recommendation')} and market trends.
        """
        
        try:
            explanation = gemini_model.generate_content(synthesis_prompt).text.strip()
        except Exception as e:
            explanation = f"AI Error evaluating decision: {str(e)}"
    
    return {
        "recommended_crop": best_candidate,
        "region": region,
        "metrics": {
            "suitability": top_crops[0]['suitability_score'],
            "market_viability": market_data['viability_score']
        },
        "crop_scores": top_crops,
        "fertilizer_plan": fert_data.get('recommendation', 'Unknown'),
        "explanation": explanation
    }
