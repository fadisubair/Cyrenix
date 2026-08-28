from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timezone

from app.models.threat_intel import ThreatIntel
from app.models.finding import Finding
from app.models.event import Event
from app.services.threat_intel.base import ThreatIntelProvider
from app.services.threat_intel.local_provider import LocalThreatIntelProvider

class ThreatIntelManager:
    def __init__(self):
        # In a real app, this would be loaded from config
        self.providers: List[ThreatIntelProvider] = [LocalThreatIntelProvider()]

    def lookup_ioc(self, db: Session, ioc_value: str, ioc_type: str) -> ThreatIntel:
        # Check DB first
        stmt = select(ThreatIntel).where(ThreatIntel.ioc_value == ioc_value, ThreatIntel.ioc_type == ioc_type)
        existing = db.scalars(stmt).first()
        if existing:
            return existing
            
        # Try providers
        best_result = None
        for provider in self.providers:
            result = provider.lookup(ioc_value, ioc_type)
            if result:
                best_result = result
                break
                
        if not best_result:
            # Create a placeholder
            intel = ThreatIntel(
                ioc_value=ioc_value,
                ioc_type=ioc_type,
                provider="None",
                reputation="UNKNOWN",
                confidence=0.0
            )
        else:
            intel = ThreatIntel(
                ioc_value=best_result.ioc_value,
                ioc_type=best_result.ioc_type,
                provider=best_result.provider,
                reputation=best_result.reputation,
                confidence=best_result.confidence,
                context_data=best_result.context_data
            )
            
        db.add(intel)
        db.commit()
        db.refresh(intel)
        return intel
        
    def analyze_finding(self, db: Session, finding_id: int) -> List[ThreatIntel]:
        finding = db.get(Finding, finding_id)
        if not finding:
            return []
            
        # Get events linked to finding
        from app.services.finding_service import get_finding_events
        events = get_finding_events(db, finding_id)
        
        results = []
        for event in events:
            if event.source_ip:
                results.append(self.lookup_ioc(db, event.source_ip, "IP"))
            if event.destination_ip:
                results.append(self.lookup_ioc(db, event.destination_ip, "IP"))
            # Could add domain extraction, etc.
            
        return results

# Singleton instance
ti_manager = ThreatIntelManager()
