from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.incident import Incident
from app.models.event import Event
from typing import Dict, Any, List

class BlastRadiusService:
    @staticmethod
    def calculate_blast_radius(db: Session, incident_id: int) -> Dict[str, Any]:
        incident = db.get(Incident, incident_id)
        if not incident:
            return {}
            
        stmt = select(Event).where(Event.incident_id == incident_id)
        events = list(db.scalars(stmt).all())
        
        affected_users = set()
        affected_hosts = set()
        source_ips = set()
        destinations = set()
        
        for event in events:
            if event.username:
                affected_users.add(event.username)
            if event.hostname:
                affected_hosts.add(event.hostname)
            if event.source_ip:
                source_ips.add(event.source_ip)
            if event.destination_ip:
                destinations.add(event.destination_ip)
                
        # Simple graph structure for MVP
        relationships = []
        for user in affected_users:
            for host in affected_hosts:
                relationships.append({"source": user, "target": host, "type": "accessed_host"})
            for ip in source_ips:
                relationships.append({"source": user, "target": ip, "type": "authenticated_from"})
                
        return {
            "affected_users": list(affected_users),
            "affected_hosts": list(affected_hosts),
            "source_ips": list(source_ips),
            "destinations": list(destinations),
            "affected_applications": [], # Placeholder for MVP
            "relationships": relationships
        }
