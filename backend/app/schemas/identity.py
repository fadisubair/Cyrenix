from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class IdentitySignalBase(BaseModel):
    signal_type: str
    severity: str
    evidence: Optional[Any] = None
    confidence: float

class IdentitySignalResponse(IdentitySignalBase):
    id: int
    profile_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class IdentityProfileBase(BaseModel):
    username: str
    risk_score: str
    baseline_data: Optional[Any] = None

class IdentityProfileResponse(IdentityProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime
    signals: List[IdentitySignalResponse] = []

    class Config:
        from_attributes = True
