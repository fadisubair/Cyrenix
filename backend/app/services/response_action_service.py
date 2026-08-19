from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.event import Event
from app.models.finding import Finding
from app.models.finding_evidence import finding_evidence
from app.models.response_action import ResponseAction


def create_response_action(
    db: Session,
    finding: Finding,
    action_type: str,
    target: str,
    title: str,
    description: str,
    rationale: str,
    risk_level: str,
    confidence: float,
) -> ResponseAction:

    action = ResponseAction(
        finding_id=finding.id,
        action_type=action_type,
        target=target,
        title=title,
        description=description,
        rationale=rationale,
        risk_level=risk_level,
        confidence=confidence,
        status="PENDING_APPROVAL",
    )

    db.add(action)
    db.commit()
    db.refresh(action)

    return action


def get_response_action(
    db: Session,
    action_id: int,
) -> ResponseAction | None:

    return db.get(
        ResponseAction,
        action_id,
    )


def get_finding_response_actions(
    db: Session,
    finding_id: int,
) -> list[ResponseAction]:

    statement = (
        select(ResponseAction)
        .where(
            ResponseAction.finding_id == finding_id
        )
        .order_by(
            ResponseAction.created_at.desc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


def recommend_response_for_finding(
    db: Session,
    finding: Finding,
) -> ResponseAction | None:
    """
    Generate an evidence-backed response recommendation.

    Currently supports BRUTE_FORCE findings.
    """

    if finding.finding_type != "BRUTE_FORCE":
        return None

    statement = (
        select(Event)
        .join(
            finding_evidence,
            finding_evidence.c.event_id == Event.id,
        )
        .where(
            finding_evidence.c.finding_id == finding.id
        )
        .order_by(Event.timestamp.asc())
    )

    evidence_events = list(
        db.scalars(statement).all()
    )

    if not evidence_events:
        return None

    source_ips = {
        event.source_ip
        for event in evidence_events
        if event.source_ip
    }

    if not source_ips:
        return None

    source_ip = sorted(source_ips)[0]

    action = create_response_action(
        db=db,
        finding=finding,
        action_type="BLOCK_SOURCE_IP",
        target=source_ip,
        title="Block Suspected Brute-Force Source",
        description=(
            f"Block network traffic from source IP "
            f"{source_ip} to reduce the risk of continued "
            f"brute-force authentication attempts."
        ),
        rationale=(
            f"The recommendation is based on finding "
            f"#{finding.id}, which identified repeated failed "
            f"authentication attempts from {source_ip}. "
            f"The source IP is directly supported by the "
            f"finding's evidence events."
        ),
        risk_level="HIGH",
        confidence=finding.confidence,
    )

    return action


def approve_response_action(
    db: Session,
    action: ResponseAction,
    approved_by: str,
) -> ResponseAction:

    if action.status != "PENDING_APPROVAL":
        raise ValueError(
            "Only pending actions can be approved"
        )

    action.status = "APPROVED"
    action.approved_by = approved_by
    action.approved_at = datetime.now(timezone.utc)

    db.add(
        AuditLog(
            action="ACTION_APPROVED",
            actor=approved_by,
            finding_id=action.finding_id,
            response_action_id=action.id,
            details=(
                f"Response action #{action.id} was approved. "
                f"Action type: {action.action_type}. "
                f"Target: {action.target}."
            ),
        )
    )

    db.commit()
    db.refresh(action)

    return action


def reject_response_action(
    db: Session,
    action: ResponseAction,
    rejected_by: str,
) -> ResponseAction:

    if action.status != "PENDING_APPROVAL":
        raise ValueError(
            "Only pending actions can be rejected"
        )

    action.status = "REJECTED"
    action.rejected_at = datetime.now(timezone.utc)

    db.add(
        AuditLog(
            action="ACTION_REJECTED",
            actor=rejected_by,
            finding_id=action.finding_id,
            response_action_id=action.id,
            details=(
                f"Response action #{action.id} was rejected. "
                f"Action type: {action.action_type}. "
                f"Target: {action.target}."
            ),
        )
    )

    db.commit()
    db.refresh(action)

    return action


def execute_response_action(
    db: Session,
    action: ResponseAction,
    mode: str,
    executed_by: str,
) -> ResponseAction:

    if action.status != "APPROVED":
        raise ValueError(
            "Only approved actions can be executed"
        )

    if action.execution_status != "NOT_EXECUTED":
        raise ValueError(
            "Response action has already been executed"
        )

    mode = mode.upper()

    if mode not in {"DRY_RUN", "SIMULATED"}:
        raise ValueError(
            "Unsupported execution mode"
        )

    if action.action_type == "BLOCK_SOURCE_IP":

        if mode == "DRY_RUN":
            message = (
                f"DRY RUN: Simulated blocking of source IP "
                f"{action.target}."
            )
        else:
            message = (
                f"SIMULATED: Source IP {action.target} "
                f"would be blocked."
            )

    else:
        raise ValueError(
            f"Unsupported response action type: "
            f"{action.action_type}"
        )

    action.execution_status = "SUCCESS"
    action.execution_mode = mode
    action.execution_message = message
    action.executed_at = datetime.now(timezone.utc)

    db.add(
        AuditLog(
            action="ACTION_EXECUTED",
            actor=executed_by,
            finding_id=action.finding_id,
            response_action_id=action.id,
            details=(
                f"Response action #{action.id} was executed "
                f"in {mode} mode. "
                f"Result: {message}"
            ),
        )
    )

    db.commit()
    db.refresh(action)

    return action
