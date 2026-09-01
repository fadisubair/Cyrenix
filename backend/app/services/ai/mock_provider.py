from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.incident import Incident
from app.models.event import Event
from app.services.ai.base import AIProvider

class MockAIProvider(AIProvider):
    def get_name(self) -> str:
        return "Mock AI Provider"
        
    def analyze_incident(self, db: Session, incident: Incident) -> Dict[str, Any]:
        # Retrieve events
        stmt = select(Event).where(Event.incident_id == incident.id)
        events = list(db.scalars(stmt).all())
        
        has_failed = any("failed" in str(e.event_type).lower() for e in events)
        has_success = any("success" in str(e.event_type).lower() for e in events)
        
        if has_failed and has_success:
            return {
                "finding_type": "SUCCESSFUL_BRUTE_FORCE",
                "title": "Successful Brute Force Attack",
                "description": "Multiple failed logins followed by a successful login.",
                "rationale": "The pattern strongly indicates a credential guessing attack that eventually succeeded.",
                "confidence": 0.95,
                "mitre_techniques": ["T1110", "T1078"],
                "supporting_evidence": {"failed_events": 5, "success_events": 1},
                "contradicting_evidence": {}
            }
        elif has_failed:
            return {
                "finding_type": "FAILED_LOGIN_SPIKE",
                "title": "Authentication Failure Spike",
                "description": "Multiple failed logins observed without success.",
                "rationale": "High rate of failure indicates brute force or credential stuffing attempt.",
                "confidence": 0.8,
                "mitre_techniques": ["T1110"],
                "supporting_evidence": {"failed_events": len(events)},
                "contradicting_evidence": {}
            }
        
        # Default analysis
        return {
            "finding_type": "ANOMALOUS_ACTIVITY",
            "title": "Anomalous Activity Detected",
            "description": "Events observed that differ from baseline.",
            "rationale": "Machine learning model indicates a deviation from normal behavior.",
            "confidence": 0.6,
            "mitre_techniques": [],
            "supporting_evidence": {},
            "contradicting_evidence": {}
        }
