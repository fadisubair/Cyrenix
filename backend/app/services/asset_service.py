from sqlalchemy import select, or_, and_
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Dict, Any

from app.models.event import Event

class AssetService:
    @staticmethod
    def get_discovered_assets(db: Session) -> List[Dict[str, Any]]:
        # A simple deduction of assets from events table
        stmt = select(
            Event.hostname, 
            Event.source_ip,
            Event.destination_ip,
            Event.timestamp
        ).order_by(Event.timestamp.desc())
        
        events = db.scalars(stmt).all()
        # Since we just selected the objects, wait we need to select specific columns properly.
        # Let's fix this by querying the Event objects and processing them.
        return AssetService._process_events_to_assets(db)

    @staticmethod
    def _process_events_to_assets(db: Session) -> List[Dict[str, Any]]:
        stmt = select(Event).order_by(Event.timestamp.desc())
        events = list(db.scalars(stmt).all())
        
        assets = {}
        for event in events:
            # Check hostnames
            if event.hostname:
                if event.hostname not in assets:
                    assets[event.hostname] = {
                        "id": f"host-{event.hostname}",
                        "name": event.hostname,
                        "asset_type": "Server" if "server" in event.hostname.lower() else "Workstation",
                        "ip_address": event.source_ip or event.destination_ip or "Unknown",
                        "os": "Unknown",
                        "risk_level": "LOW",
                        "last_seen": event.timestamp,
                        "events_count": 1
                    }
                else:
                    assets[event.hostname]["events_count"] += 1
                    if event.timestamp > assets[event.hostname]["last_seen"]:
                        assets[event.hostname]["last_seen"] = event.timestamp
            
            # Check source IPs if no hostname
            elif event.source_ip:
                ip = event.source_ip
                if ip not in assets:
                    assets[ip] = {
                        "id": f"ip-{ip}",
                        "name": ip,
                        "asset_type": "Endpoint",
                        "ip_address": ip,
                        "os": "Unknown",
                        "risk_level": "LOW",
                        "last_seen": event.timestamp,
                        "events_count": 1
                    }
                else:
                    assets[ip]["events_count"] += 1
                    if event.timestamp > assets[ip]["last_seen"]:
                        assets[ip]["last_seen"] = event.timestamp

        # Simple risk deduction based on event counts or types could be added here
        # For now, return the deduplicated list
        return list(assets.values())
