from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any


class FindingCreate(BaseModel):
    incident_id: int
    title: str = Field(min_length=3, max_length=255)
    finding_type: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=3)
    rationale: str = Field(min_length=3)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    status: str = "PROPOSED"
    mitre_techniques: Optional[List[str]] = None
    supporting_evidence: Optional[Dict[str, Any]] = None
    contradicting_evidence: Optional[Dict[str, Any]] = None


class FindingUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=3,
        max_length=255,
    )
    description: str | None = Field(
        default=None,
        min_length=3,
    )
    rationale: str | None = Field(
        default=None,
        min_length=3,
    )
    confidence: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )
    status: str | None = None


class FindingResponse(BaseModel):
    id: int
    incident_id: int
    title: str
    finding_type: str
    description: str
    rationale: str
    confidence: float
    status: str
    mitre_techniques: Optional[Any] = None
    supporting_evidence: Optional[Any] = None
    contradicting_evidence: Optional[Any] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
