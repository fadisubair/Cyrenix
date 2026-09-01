from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Any

class CorrelationLinkBase(BaseModel):
    stage_id: int
    source_event_id: int
    target_event_id: Optional[int] = None
    reason: str
    confidence: float

class CorrelationLinkCreate(CorrelationLinkBase):
    pass

class CorrelationLinkResponse(CorrelationLinkBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AttackStageBase(BaseModel):
    chain_id: int
    name: str
    order: int = 0
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None

class AttackStageCreate(AttackStageBase):
    pass

class AttackStageResponse(AttackStageBase):
    id: int
    created_at: datetime
    links: List[CorrelationLinkResponse] = []

    class Config:
        from_attributes = True

class AttackChainBase(BaseModel):
    incident_id: int
    name: str
    description: Optional[str] = None

class AttackChainCreate(AttackChainBase):
    pass

class AttackChainResponse(AttackChainBase):
    id: int
    created_at: datetime
    updated_at: datetime
    stages: List[AttackStageResponse] = []

    class Config:
        from_attributes = True
