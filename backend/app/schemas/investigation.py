from datetime import datetime

from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict


class InvestigationStepResponse(BaseModel):
    id: int
    finding_id: int
    step_order: int
    step_type: str
    title: str
    description: str
    conclusion: str
    confidence: float
    evidence_event_ids: list[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InvestigationRecommendationBase(BaseModel):
    finding_id: int
    priority: str = "MEDIUM"
    title: str
    description: str
    reason: str
    evidence_needed: Optional[Dict[str, Any]] = None
    status: str = "PENDING"

class InvestigationRecommendationCreate(InvestigationRecommendationBase):
    pass

class InvestigationRecommendationResponse(InvestigationRecommendationBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

