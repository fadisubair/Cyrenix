from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class AnalystNoteBase(BaseModel):
    content: str

class AnalystNoteCreate(AnalystNoteBase):
    pass

class AnalystNoteResponse(AnalystNoteBase):
    id: int
    incident_id: int
    author_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
