from typing import List, Dict, Any

class BaselineService:
    @staticmethod
    def calculate_moving_average(historical_data: List[float]) -> float:
        if not historical_data:
            return 0.0
        return sum(historical_data) / len(historical_data)
        
    @staticmethod
    def calculate_deviation(observed_value: float, baseline_value: float) -> float:
        if baseline_value == 0:
            return 100.0 if observed_value > 0 else 0.0
        return ((observed_value - baseline_value) / baseline_value) * 100
        
    @staticmethod
    def detect_anomaly(
        observed_value: float, 
        historical_data: List[float], 
        threshold_deviation_pct: float = 50.0
    ) -> Dict[str, Any]:
        """
        Calculates if the observed value is an anomaly compared to the baseline.
        """
        baseline = BaselineService.calculate_moving_average(historical_data)
        deviation = BaselineService.calculate_deviation(observed_value, baseline)
        
        is_anomalous = abs(deviation) > threshold_deviation_pct
        
        # A simple anomaly score based on how far it exceeds the threshold
        anomaly_score = min(100.0, (abs(deviation) / max(1.0, threshold_deviation_pct)) * 50) if is_anomalous else 0.0
        
        return {
            "baseline": baseline,
            "observed_value": observed_value,
            "deviation_pct": deviation,
            "is_anomalous": is_anomalous,
            "anomaly_score": anomaly_score
        }
