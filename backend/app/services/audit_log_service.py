from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    action: str,
    actor: str,
    finding_id: int | None = None,
    response_action_id: int | None = None,
    details: str | None = None,
) -> AuditLog:
    """
    Create an audit log entry describing an important
    investigation or response action.
    """

    audit_log = AuditLog(
        action=action,
        actor=actor,
        finding_id=finding_id,
        response_action_id=response_action_id,
        details=details,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log


def get_audit_log(
    db: Session,
    audit_log_id: int,
) -> AuditLog | None:
    return db.get(
        AuditLog,
        audit_log_id,
    )


def get_finding_audit_logs(
    db: Session,
    finding_id: int,
) -> list[AuditLog]:
    statement = (
        select(AuditLog)
        .where(
            AuditLog.finding_id == finding_id
        )
        .order_by(
            AuditLog.created_at.asc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


def get_response_action_audit_logs(
    db: Session,
    response_action_id: int,
) -> list[AuditLog]:
    statement = (
        select(AuditLog)
        .where(
            AuditLog.response_action_id == response_action_id
        )
        .order_by(
            AuditLog.created_at.asc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


def get_all_audit_logs(
    db: Session,
) -> list[AuditLog]:
    statement = (
        select(AuditLog)
        .order_by(
            AuditLog.created_at.desc()
        )
    )

    return list(
        db.scalars(statement).all()
    )
