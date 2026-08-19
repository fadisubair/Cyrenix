from datetime import datetime

from pydantic import BaseModel, ConfigDict


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
