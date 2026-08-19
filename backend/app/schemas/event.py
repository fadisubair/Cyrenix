from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class EventCreate(BaseModel):
    incident_id: int | None = None

    timestamp: datetime

    event_type: str = Field(
        min_length=2,
        max_length=100,
    )

    source: str | None = Field(
        default=None,
        max_length=100,
    )

    username: str | None = Field(
        default=None,
        max_length=255,
    )

    source_ip: str | None = Field(
        default=None,
        max_length=45,
    )

    destination_ip: str | None = Field(
        default=None,
        max_length=45,
    )

    hostname: str | None = Field(
        default=None,
        max_length=255,
    )

    raw_data: str | None = None


class EventResponse(BaseModel):
    id: int
    incident_id: int | None
    timestamp: datetime
    event_type: str
    source: str | None
    username: str | None
    source_ip: str | None
    destination_ip: str | None
    hostname: str | None
    raw_data: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
