from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Dict

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.threat_intel.manager import ti_manager

router = APIRouter(
    prefix="/api",
    tags=["Threat Intelligence"],
)

@router.get("/iocs")
def list_all_iocs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select
    from app.models.threat_intel import ThreatIntel
    stmt = select(ThreatIntel).order_by(ThreatIntel.retrieved_at.desc())
    return list(db.scalars(stmt).all())

@router.get(
    "/findings/{finding_id}/threat-intelligence",
)
def get_finding_threat_intel(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    intel_records = ti_manager.analyze_finding(db, finding_id)
    return intel_records
    
@router.get(
    "/iocs/search",
)
def search_iocs(
    value: str,
    type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    intel = ti_manager.lookup_ioc(db, value, type)
    return intel
