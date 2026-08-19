from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role
from app.core.database import get_db
from app.models.incident import Incident
from app.models.investigation_step import InvestigationStep
from app.models.user import User
from app.schemas.finding import FindingResponse
from app.schemas.investigation import InvestigationStepResponse
from app.services.investigation_service import analyze_incident


router = APIRouter(
    prefix="/api/investigations",
    tags=["Investigation Engine"],
)


@router.get(
    "/findings/{finding_id}/reasoning",
    response_model=list[InvestigationStepResponse],
)
def get_finding_reasoning(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    statement = (
        select(InvestigationStep)
        .where(
            InvestigationStep.finding_id == finding_id
        )
        .order_by(
            InvestigationStep.step_order.asc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


@router.post(
    "/{incident_id}/analyze",
    response_model=FindingResponse,
    status_code=status.HTTP_201_CREATED,
)
def analyze_incident_endpoint(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
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

    finding = analyze_incident(
        db,
        incident_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No supported suspicious pattern detected",
        )

    return finding
