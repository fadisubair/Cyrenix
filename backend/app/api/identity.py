from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.incident import Incident
from app.models.user import User
from app.schemas.identity import IdentityProfileResponse
from app.services.identity_service import IdentityService

router = APIRouter(
    prefix="/api",
    tags=["Identity"],
)

@router.get(
    "/identities",
    response_model=list[IdentityProfileResponse],
)
def list_identities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return IdentityService.get_all_identity_profiles(db)

@router.get(
    "/incidents/{incident_id}/identity-risk",
    response_model=IdentityProfileResponse,
)
def get_identity_risk(
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
    
    profile = IdentityService.get_identity_risk_for_incident(db, incident_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No identity profiles found for this incident",
        )
        
    return profile
