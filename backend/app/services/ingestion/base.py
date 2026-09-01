from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.event import Event

class NormalizedEvent(BaseModel):
    timestamp: datetime
    event_type: str
    source: str
    username: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    hostname: Optional[str] = None
    raw_data: Optional[str] = None

class EventNormalizer(ABC):
    @abstractmethod
    def can_handle(self, source_type: str) -> bool:
        pass
        
    @abstractmethod
    def normalize(self, raw_event: Dict[str, Any]) -> NormalizedEvent:
        pass

class SecurityEventSource(BaseModel):
    source_type: str
    event_data: Dict[str, Any]

class EventIngestionService:
    def __init__(self):
        self.normalizers: List[EventNormalizer] = []
        
    def register_normalizer(self, normalizer: EventNormalizer):
        self.normalizers.append(normalizer)
        
    def ingest_event(self, db: Session, payload: SecurityEventSource, incident_id: Optional[int] = None) -> Event:
        # Find normalizer
        normalizer = next((n for n in self.normalizers if n.can_handle(payload.source_type)), None)
        
        if not normalizer:
            raise ValueError(f"No normalizer found for source type: {payload.source_type}")
            
        # Normalize
        normalized = normalizer.normalize(payload.event_data)
        
        # Save Event
        event = Event(
            incident_id=incident_id,
            timestamp=normalized.timestamp,
            event_type=normalized.event_type,
            source=normalized.source,
            username=normalized.username,
            source_ip=normalized.source_ip,
            destination_ip=normalized.destination_ip,
            hostname=normalized.hostname,
            raw_data=normalized.raw_data
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        
        # In a real app, this might trigger async correlation here
        
        return event

# Global instance for MVP
ingestion_service = EventIngestionService()
