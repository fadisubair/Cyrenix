from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role
from app.core.database import get_db
from app.models.event import Event
from app.models.incident import Incident
from app.models.user import User
from app.schemas.event import EventResponse
from app.schemas.finding import (
    FindingCreate,
    FindingResponse,
    FindingUpdate,
)
from app.schemas.investigation import InvestigationRecommendationResponse
from app.services.finding_service import (
    create_finding,
    delete_finding,
    get_finding,
    get_finding_events,
    get_findings,
    get_incident_findings,
    link_event_to_finding,
    update_finding,
)
from app.services.next_investigation_service import NextInvestigationService
from app.services.mitre_service import MitreService


router = APIRouter(
    prefix="/api/findings",
    tags=["Findings / Investigation"],
)


@router.post(
    "",
    response_model=FindingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_finding_endpoint(
    finding_data: FindingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    incident = db.get(
        Incident,
        finding_data.incident_id,
    )

    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return create_finding(
        db,
        finding_data,
    )


@router.get(
    "",
    response_model=list[FindingResponse],
)
def list_findings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_findings(db)


@router.get(
    "/{finding_id}",
    response_model=FindingResponse,
)
def get_finding_endpoint(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finding = get_finding(
        db,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    return finding


@router.get(
    "/incident/{incident_id}",
    response_model=list[FindingResponse],
)
def list_incident_findings(
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

    return get_incident_findings(
        db,
        incident_id,
    )


@router.patch(
    "/{finding_id}",
    response_model=FindingResponse,
)
def update_finding_endpoint(
    finding_id: int,
    finding_data: FindingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    finding = get_finding(
        db,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    return update_finding(
        db,
        finding,
        finding_data,
    )


@router.delete(
    "/{finding_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_finding_endpoint(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    finding = get_finding(
        db,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    delete_finding(
        db,
        finding,
    )


@router.post(
    "/{finding_id}/evidence/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def link_evidence(
    finding_id: int,
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    finding = get_finding(
        db,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    event = db.get(
        Event,
        event_id,
    )

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    try:
        link_event_to_finding(
            db,
            finding,
            event,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/{finding_id}/evidence",
    response_model=list[EventResponse],
)
def get_finding_evidence(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finding = get_finding(
        db,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    return get_finding_events(
        db,
        finding_id,
    )

@router.get(
    "/{finding_id}/confidence",
)
def get_finding_confidence(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finding = get_finding(
        db,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    return {
        "confidence": finding.confidence,
        "supporting_evidence": finding.supporting_evidence or {},
        "contradicting_evidence": finding.contradicting_evidence or {},
    }

@router.get(
    "/{finding_id}/next-steps",
    response_model=list[InvestigationRecommendationResponse],
)
def get_finding_next_steps(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finding = get_finding(db, finding_id)
    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )
    return NextInvestigationService.get_recommendations_for_finding(db, finding_id)

@router.post(
    "/{finding_id}/next-steps/generate",
    response_model=list[InvestigationRecommendationResponse],
)
def generate_finding_next_steps(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ANALYST", "ADMIN")),
):
    finding = get_finding(db, finding_id)
    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )
    return NextInvestigationService.generate_recommendations(db, finding_id)


@router.get(
    "/{finding_id}/mitre",
)
def get_finding_mitre(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finding = get_finding(db, finding_id)
    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )
    return MitreService.get_mitre_mapping_for_finding(db, finding_id)



