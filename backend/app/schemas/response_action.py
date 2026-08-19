from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResponseActionCreate(BaseModel):
    action_type: str = Field(
        min_length=2,
        max_length=100,
    )

    target: str = Field(
        min_length=1,
        max_length=255,
    )

    title: str = Field(
        min_length=3,
        max_length=255,
    )

    description: str = Field(
        min_length=3,
    )

    rationale: str = Field(
        min_length=3,
    )

    risk_level: str = Field(
        default="MEDIUM",
        max_length=20,
    )

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
    )


class ResponseActionResponse(BaseModel):
    id: int
    finding_id: int
    action_type: str
    target: str
    title: str
    description: str
    rationale: str
    risk_level: str
    confidence: float
    status: str
    approved_by: str | None
    approved_at: datetime | None
    rejected_at: datetime | None

    execution_status: str
    execution_mode: str | None
    execution_message: str | None
    executed_at: datetime | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

class ResponseActionExecution(BaseModel):
    mode: str = Field(
        default="DRY_RUN",
        min_length=1,
        max_length=20,
    )
