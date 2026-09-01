from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.models.investigation import InvestigationRecommendation
from app.models.finding import Finding

class NextInvestigationService:
    @staticmethod
    def get_recommendations_for_finding(db: Session, finding_id: int) -> List[InvestigationRecommendation]:
        stmt = select(InvestigationRecommendation).where(InvestigationRecommendation.finding_id == finding_id)
        return list(db.scalars(stmt).all())
        
    @staticmethod
    def generate_recommendations(db: Session, finding_id: int) -> List[InvestigationRecommendation]:
        finding = db.get(Finding, finding_id)
        if not finding:
            return []
            
        # Clean up existing PENDING recommendations for simplicity in this MVP
        db.query(InvestigationRecommendation).where(
            InvestigationRecommendation.finding_id == finding_id,
            InvestigationRecommendation.status == "PENDING"
        ).delete()
        db.commit()
        
        # Hardcoded logic for generating next steps based on finding type for MVP
        recommendations = []
        
        if "Brute" in finding.title or "failed" in finding.title.lower() or finding.finding_type == "FAILED_LOGIN_SPIKE":
            recommendations = [
                InvestigationRecommendation(
                    finding_id=finding_id,
                    priority="HIGH",
                    title="Check for successful authentication",
                    description="Determine if the account eventually successfully authenticated after the failures.",
                    reason="A successful login after brute force indicates a likely compromise.",
                    evidence_needed={"event_type": "SUCCESSFUL_LOGIN", "username": "same"}
                ),
                InvestigationRecommendation(
                    finding_id=finding_id,
                    priority="MEDIUM",
                    title="Check endpoint process activity",
                    description="Look for unusual processes executed by this user after the authentication.",
                    reason="If the account is compromised, the attacker may have run discovery or execution tools.",
                    evidence_needed={"event_type": "NEW_PROCESS", "username": "same"}
                )
            ]
        else:
            recommendations = [
                InvestigationRecommendation(
                    finding_id=finding_id,
                    priority="MEDIUM",
                    title="Review identity risk profile",
                    description="Check if this user has other anomalous signals.",
                    reason="Correlating with identity context helps confirm suspicious behavior.",
                    evidence_needed={"signal_type": "any"}
                )
            ]
            
        db.add_all(recommendations)
        db.commit()
        
        return NextInvestigationService.get_recommendations_for_finding(db, finding_id)
