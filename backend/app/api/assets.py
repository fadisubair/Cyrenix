from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.asset_service import AssetService

router = APIRouter(
    prefix="/api/assets",
    tags=["Assets"],
)

@router.get("")
def list_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AssetService.get_discovered_assets(db)
