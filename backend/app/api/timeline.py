from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.incident import Incident
from app.models.user import User
from app.schemas.timeline import IncidentTimelineResponse
from app.services.timeline_service import get_incident_timeline


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incident Timeline"],
)


@router.get(
    "/{incident_id}/timeline",
    response_model=IncidentTimelineResponse,
)
def get_incident_timeline_endpoint(
    incident_id: int,
    event_type: str | None = Query(
        default=None,
        description="Filter by timeline event type",
    ),
    source_type: str | None = Query(
        default=None,
        description="Filter by timeline source type",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.get(
        Incident,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return get_incident_timeline(
        db=db,
        incident_id=incident_id,
        event_type=event_type,
        source_type=source_type,
    )
