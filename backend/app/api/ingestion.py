from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.services.ingestion.base import SecurityEventSource, ingestion_service
from app.services.ingestion.wazuh_adapter import WazuhNormalizer

ingestion_service.register_normalizer(WazuhNormalizer())

router = APIRouter(
    prefix="/api/ingestion",
    tags=["Ingestion"],
)

@router.post(
    "/events",
    status_code=status.HTTP_201_CREATED,
)
def ingest_event(
    payload: SecurityEventSource,
    incident_id: int = None,
    db: Session = Depends(get_db),
    # Might use API keys instead of user tokens in real life, but requiring ADMIN for now
    current_user: User = Depends(require_role("ANALYST", "ADMIN")),
):
    try:
        event = ingestion_service.ingest_event(db, payload, incident_id)
        return {"status": "success", "event_id": event.id}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
