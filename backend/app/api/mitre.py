from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.mitre_service import MitreService

router = APIRouter(
    prefix="/api/mitre",
    tags=["MITRE ATT&CK"],
)

@router.get("/coverage")
def get_mitre_coverage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return MitreService.get_coverage(db)
