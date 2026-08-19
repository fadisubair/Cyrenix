from datetime import datetime

from pydantic import BaseModel


class TimelineEvent(BaseModel):
    timestamp: datetime
    event_type: str
    title: str
    description: str
    source_type: str
    source_id: int


class IncidentTimelineResponse(BaseModel):
    incident_id: int
    timeline: list[TimelineEvent]
