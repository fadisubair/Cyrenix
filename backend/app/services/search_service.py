from sqlalchemy.orm import Session
from sqlalchemy import select, or_, cast, String
from typing import Dict, Any, List

from app.models.incident import Incident
from app.models.event import Event
from app.models.finding import Finding
from app.models.threat_intel import ThreatIntel
from app.models.user import User
from app.models.response_action import ResponseAction

class SearchService:
    @staticmethod
    def search_all(db: Session, query: str) -> Dict[str, List[Dict[str, Any]]]:
        results = {
            "incidents": [],
            "events": [],
            "findings": [],
            "iocs": [],
            "users": [],
            "response_actions": []
        }
        
        if not query or len(query) < 2:
            return results
            
        search_pattern = f"%{query}%"
        
        # Search Incidents
        incident_stmt = select(Incident).where(
            or_(
                Incident.title.ilike(search_pattern),
                Incident.description.ilike(search_pattern),
                cast(Incident.id, String).ilike(search_pattern)
            )
        ).limit(10)
        for i in db.scalars(incident_stmt).all():
            results["incidents"].append({"id": i.id, "title": i.title, "type": "incident"})
            
        # Search Events
        event_stmt = select(Event).where(
            or_(
                Event.username.ilike(search_pattern),
                Event.source_ip.ilike(search_pattern),
                Event.destination_ip.ilike(search_pattern),
                Event.hostname.ilike(search_pattern),
                cast(Event.id, String).ilike(search_pattern)
            )
        ).limit(10)
        for e in db.scalars(event_stmt).all():
            results["events"].append({"id": e.id, "title": f"Event {e.event_type} - {e.source_ip}", "type": "event"})
            
        # Search Findings
        finding_stmt = select(Finding).where(
            or_(
                Finding.title.ilike(search_pattern),
                Finding.description.ilike(search_pattern),
                cast(Finding.id, String).ilike(search_pattern)
            )
        ).limit(10)
        for f in db.scalars(finding_stmt).all():
            results["findings"].append({"id": f.id, "title": f.title, "type": "finding"})
            
        # Search IOCs
        ioc_stmt = select(ThreatIntel).where(
            or_(
                ThreatIntel.ioc_value.ilike(search_pattern)
            )
        ).limit(10)
        for ioc in db.scalars(ioc_stmt).all():
            results["iocs"].append({"id": ioc.id, "title": ioc.ioc_value, "type": "ioc"})
            
        # Search Users
        user_stmt = select(User).where(
            or_(
                User.username.ilike(search_pattern),
                User.email.ilike(search_pattern)
            )
        ).limit(10)
        for u in db.scalars(user_stmt).all():
            results["users"].append({"id": u.id, "title": u.username, "type": "user"})
            
        # Search Response Actions
        action_stmt = select(ResponseAction).where(
            or_(
                ResponseAction.title.ilike(search_pattern),
                ResponseAction.target.ilike(search_pattern)
            )
        ).limit(10)
        for a in db.scalars(action_stmt).all():
            results["response_actions"].append({"id": a.id, "title": a.title, "type": "response_action"})
            
        return results
