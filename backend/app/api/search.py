from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.search_service import SearchService

router = APIRouter(
    prefix="/api",
    tags=["Search"],
)

@router.get("/search")
def global_search(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return SearchService.search_all(db, q)
