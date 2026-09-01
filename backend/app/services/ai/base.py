from abc import ABC, abstractmethod
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.incident import Incident

class AIProvider(ABC):
    @abstractmethod
    def get_name(self) -> str:
        pass
        
    @abstractmethod
    def analyze_incident(self, db: Session, incident: Incident) -> Dict[str, Any]:
        """
        Analyzes an incident and returns structured data for finding generation.
        Expected format:
        {
            "finding_type": str,
            "title": str,
            "description": str,
            "rationale": str,
            "confidence": float,
            "mitre_techniques": List[str],
            "supporting_evidence": Dict,
            "contradicting_evidence": Dict
        }
        """
        pass
