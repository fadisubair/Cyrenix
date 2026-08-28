from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role
from app.core.database import get_db
from app.models.incident import Incident
from app.models.user import User
from app.schemas.event import EventCreate, EventResponse
from app.services.event_service import (
    create_event,
    get_event,
    get_events,
    get_incident_events,
)


router = APIRouter(
    prefix="/api/events",
    tags=["Events / Evidence"],
)


@router.post(
    "",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event_endpoint(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    if event_data.incident_id is not None:
        incident = db.get(
            Incident,
            event_data.incident_id,
        )

        if incident is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Incident not found",
            )

    return create_event(
        db,
        event_data,
    )


@router.get(
    "",
    response_model=list[EventResponse],
)
def list_events(
    event_type: str | None = None,
    username: str | None = None,
    source_ip: str | None = None,
    hostname: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_events(
        db,
        limit=limit,
        offset=offset,
        event_type=event_type,
        username=username,
        source_ip=source_ip,
        hostname=hostname,
    )


@router.get(
    "/{event_id}",
    response_model=EventResponse,
)
def get_event_endpoint(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = get_event(
        db,
        event_id,
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return event


@router.get(
    "/incident/{incident_id}",
    response_model=list[EventResponse],
)
def list_incident_events(
    incident_id: int,
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

    return get_incident_events(
        db,
        incident_id,
    )
