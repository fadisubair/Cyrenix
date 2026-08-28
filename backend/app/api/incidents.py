from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role
from app.core.database import get_db
from app.models.user import User
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
)
from app.services.incident_service import (
    create_incident,
    delete_incident,
    get_incident,
    get_incidents,
    update_incident,
)
from app.services.risk_service import RiskService
from app.services.blast_radius_service import BlastRadiusService
from app.schemas.analyst_note import AnalystNoteCreate, AnalystNoteResponse
from app.models.analyst_note import AnalystNote


router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"],
)


@router.post(
    "",
    response_model=IncidentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incident_endpoint(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    return create_incident(
        db,
        incident_data,
    )


@router.get(
    "",
    response_model=list[IncidentResponse],
)
def list_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_incidents(db)


@router.get(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def get_incident_endpoint(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = get_incident(
        db,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return incident


@router.patch(
    "/{incident_id}",
    response_model=IncidentResponse,
)
def update_incident_endpoint(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    incident = get_incident(
        db,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return update_incident(
        db,
        incident,
        incident_data,
    )


@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_incident_endpoint(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    incident = get_incident(
        db,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    delete_incident(
        db,
        incident,
    )

@router.get(
    "/{incident_id}/risk",
)
def get_incident_risk(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = get_incident(
        db,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return RiskService.calculate_incident_risk(db, incident_id)

@router.get(
    "/{incident_id}/blast-radius",
)
def get_incident_blast_radius(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = get_incident(
        db,
        incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return BlastRadiusService.calculate_blast_radius(db, incident_id)

@router.get(
    "/{incident_id}/notes",
    response_model=list[AnalystNoteResponse],
)
def get_incident_notes(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    stmt = select(AnalystNote).where(AnalystNote.incident_id == incident_id).order_by(AnalystNote.created_at.desc())
    notes = db.scalars(stmt).all()
    return notes

@router.post(
    "/{incident_id}/notes",
    response_model=AnalystNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_incident_note(
    incident_id: int,
    note_data: AnalystNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = AnalystNote(
        incident_id=incident_id,
        author_id=current_user.id,
        content=note_data.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
