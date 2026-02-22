class MarketAnalyzer:
    def check_viability(self, crop_name: str, region: str, current_month: int) -> dict:
        """
        API Endpoint Example: GET https://api.agrimarket.io/v1/crops/{crop_name}/forecast?region={region}
        """
        # Mock API Response Structure for the requested crops
        mock_api_record = {
            "Tomato": {
                "in_season": True if 4 <= current_month <= 8 else False,
                "market_saturation": "LOW", # HIGH, MEDIUM, LOW
                "expected_price_trend": "UPWARD" 
            },
            "Rice": {
                "in_season": True if 5 <= current_month <= 10 else False,
                "market_saturation": "MEDIUM",
                "expected_price_trend": "STABLE"
            },
            "Maize": {
                "in_season": True if 3 <= current_month <= 9 else False,
                "market_saturation": "HIGH",
                "expected_price_trend": "DOWNWARD"
            },
            "Wheat": {
                "in_season": True if 9 <= current_month <= 12 or 1 <= current_month <= 2 else False,
                "market_saturation": "LOW",
                "expected_price_trend": "UPWARD"
            }
        }
        
        data = mock_api_record.get(crop_name, {"in_season": False, "market_saturation": "HIGH", "expected_price_trend": "UNKNOWN"})
        
        # Calculate a 0-100% viability score based on economics
        viability_score = 100
        if not data["in_season"]: viability_score -= 50
        if data["market_saturation"] == "HIGH": viability_score -= 30
        elif data["market_saturation"] == "MEDIUM": viability_score -= 10
        
        return {"viability_score": max(0, viability_score), "details": data}
