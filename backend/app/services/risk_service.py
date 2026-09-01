from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.services.identity_service import IdentityService
from typing import Dict, Any

class RiskService:
    @staticmethod
    def calculate_incident_risk(db: Session, incident_id: int) -> Dict[str, Any]:
        incident = db.get(Incident, incident_id)
        if not incident:
            return {}
            
        # Get Identity Risk
        identity_profile = IdentityService.get_identity_risk_for_incident(db, incident_id)
        identity_risk_level = identity_profile.risk_score if identity_profile else "LOW"
        
        # Calculate a new priority based on factors
        priority = "LOW"
        risk_score = 10
        
        if incident.severity == "CRITICAL" or identity_risk_level == "HIGH" or incident.asset_criticality == "HIGH":
            priority = "HIGH"
            risk_score = 80
            if incident.severity == "CRITICAL" and identity_risk_level == "HIGH":
                priority = "CRITICAL"
                risk_score = 95
        elif incident.severity == "HIGH" or incident.progression_level in ["EXECUTION", "EXFILTRATION"]:
            priority = "HIGH"
            risk_score = 70
        elif incident.severity == "MEDIUM":
            priority = "MEDIUM"
            risk_score = 40
            
        # Update incident
        incident.priority = priority
        incident.risk_score = risk_score
        incident.identity_risk = identity_risk_level
        db.commit()
        db.refresh(incident)
        
        return {
            "severity": incident.severity,
            "confidence": incident.confidence,
            "asset_criticality": incident.asset_criticality,
            "identity_risk": incident.identity_risk,
            "progression_level": incident.progression_level,
            "priority": incident.priority,
            "risk_score": incident.risk_score
        }
