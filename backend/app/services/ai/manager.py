from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.ai_audit import AIAuditLog
from app.services.ai.base import AIProvider
from app.services.ai.mock_provider import MockAIProvider
from typing import Dict, Any

class AIManager:
    def __init__(self):
        self.active_provider: AIProvider = MockAIProvider()
        
    def analyze_incident(self, db: Session, incident_id: int) -> Dict[str, Any]:
        incident = db.get(Incident, incident_id)
        if not incident:
            raise ValueError("Incident not found")
            
        # Get AI analysis
        result = self.active_provider.analyze_incident(db, incident)
        
        # Log the AI decision for audit
        audit_log = AIAuditLog(
            incident_id=incident_id,
            actor="system",
            purpose="incident_analysis",
            model_provider=self.active_provider.get_name(),
            evidence_references={"event_count": 0}, # Would be real context stats
            recommendation=str(result),
            confidence=result.get("confidence", 0.0)
        )
        db.add(audit_log)
        db.commit()
        
        return result

ai_manager = AIManager()
