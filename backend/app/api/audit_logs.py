from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse
from app.services.audit_log_service import (
    get_all_audit_logs,
    get_audit_log,
    get_finding_audit_logs,
    get_response_action_audit_logs,
)


router = APIRouter(
    prefix="/api/audit-logs",
    tags=["Audit Logs"],
)


@router.get(
    "",
    response_model=list[AuditLogResponse],
)
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_audit_logs(db)


@router.get(
    "/{audit_log_id}",
    response_model=AuditLogResponse,
)
def get_audit_log_endpoint(
    audit_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audit_log = get_audit_log(
        db,
        audit_log_id,
    )

    if audit_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit log not found",
        )

    return audit_log


@router.get(
    "/finding/{finding_id}",
    response_model=list[AuditLogResponse],
)
def get_finding_audit_logs_endpoint(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_finding_audit_logs(
        db,
        finding_id,
    )


@router.get(
    "/response-action/{response_action_id}",
    response_model=list[AuditLogResponse],
)
def get_response_action_audit_logs_endpoint(
    response_action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_response_action_audit_logs(
        db,
        response_action_id,
    )
