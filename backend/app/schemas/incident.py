from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class IncidentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str | None = None
    category: str = Field(min_length=2, max_length=50)
    severity: str = "LOW"


class IncidentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, min_length=2, max_length=50)
    severity: str | None = None
    priority: str | None = None
    status: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    risk_score: int | None = Field(default=None, ge=0, le=100)
    owner_id: int | None = None
    tags: list[str] | None = None


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str | None
    category: str
    severity: str
    priority: str
    status: str
    confidence: float
    risk_score: int
    created_at: datetime
    updated_at: datetime
    first_seen: datetime | None
    last_seen: datetime | None
    owner_id: int | None = None
    tags: list[str] | None = None

    model_config = ConfigDict(from_attributes=True)
