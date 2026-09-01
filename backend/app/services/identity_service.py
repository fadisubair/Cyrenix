from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.models.identity import IdentityProfile, IdentitySignal
from app.models.incident import Incident
from app.models.event import Event

class IdentityService:
    @staticmethod
    def get_identity_risk_for_incident(db: Session, incident_id: int) -> Optional[IdentityProfile]:
        incident = db.get(Incident, incident_id)
        if not incident:
            return None
            
        # Get users associated with the incident from events
        stmt = select(Event.username).where(Event.incident_id == incident_id, Event.username.isnot(None)).distinct()
        usernames = db.scalars(stmt).all()
        
        if not usernames:
            return None
            
        # For MVP, we return the profile of the first user involved
        username = usernames[0]
        
        # Analyze and get profile
        IdentityService.analyze_identity_risk(db, username)
        
        profile = IdentityService.get_or_create_profile(db, username)
        
        # Hydrate signals
        signals_stmt = select(IdentitySignal).where(IdentitySignal.profile_id == profile.id)
        profile.signals = list(db.scalars(signals_stmt).all())
        
        return profile
        
    @staticmethod
    def get_all_identity_profiles(db: Session) -> List[IdentityProfile]:
        stmt = select(IdentityProfile)
        profiles = list(db.scalars(stmt).all())
        # Hydrate signals for each
        for profile in profiles:
            signals_stmt = select(IdentitySignal).where(IdentitySignal.profile_id == profile.id)
            profile.signals = list(db.scalars(signals_stmt).all())
        return profiles
    @staticmethod
    def get_or_create_profile(db: Session, username: str) -> IdentityProfile:
        stmt = select(IdentityProfile).where(IdentityProfile.username == username)
        profile = db.scalars(stmt).first()
        
        if not profile:
            profile = IdentityProfile(
                username=username,
                risk_score="LOW",
                baseline_data={}
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
            
        return profile
        
    @staticmethod
    def analyze_identity_risk(db: Session, username: str):
        profile = IdentityService.get_or_create_profile(db, username)
        
        # In a real implementation, this would look at all events for this user
        # and create signals (e.g. repeated auth failures, new IP, etc).
        # We will add a placeholder signal for MVP if none exist.
        
        stmt = select(IdentitySignal).where(IdentitySignal.profile_id == profile.id)
        existing_signals = list(db.scalars(stmt).all())
        
        if not existing_signals:
            signal = IdentitySignal(
                profile_id=profile.id,
                signal_type="Repeated authentication failures",
                severity="HIGH",
                evidence={"failed_count": 18, "time_window": "3m", "source_ip": "10.10.10.50"},
                confidence=0.91
            )
            db.add(signal)
            profile.risk_score = "HIGH"
            db.commit()
