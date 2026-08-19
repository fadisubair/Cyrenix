from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    id: int
    finding_id: int | None
    response_action_id: int | None
    action: str
    actor: str
    details: str | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
