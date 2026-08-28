from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.auth import get_current_user, require_role
from app.core.database import get_db
from app.models.incident import Incident
from app.models.user import User
from app.schemas.correlation import AttackChainResponse
from app.services.correlation_service import CorrelationService

router = APIRouter(
    prefix="/api",
    tags=["Correlation"],
)

@router.get(
    "/attack-chains",
    response_model=List[AttackChainResponse],
)
def get_all_attack_chains(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return CorrelationService.get_all_attack_chains(db)

@router.get(
    "/incidents/{incident_id}/attack-chain",
    response_model=List[AttackChainResponse],
)
def get_attack_chain(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    return CorrelationService.get_attack_chains_for_incident(db, incident_id)

@router.post(
    "/incidents/{incident_id}/correlate",
    response_model=List[AttackChainResponse],
)
def correlate_events(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("ANALYST", "ADMIN")),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    return CorrelationService.correlate_events_for_incident(db, incident_id)
