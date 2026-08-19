from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.event import Event
from app.models.finding import Finding
from app.models.investigation_step import InvestigationStep
from app.models.response_action import ResponseAction
from app.schemas.timeline import (
    IncidentTimelineResponse,
    TimelineEvent,
)


def get_incident_timeline(
    db: Session,
    incident_id: int,
    event_type: str | None = None,
    source_type: str | None = None,
) -> IncidentTimelineResponse:

    timeline: list[TimelineEvent] = []

    # ---------------------------------------------------------
    # Events
    # ---------------------------------------------------------

    event_statement = (
        select(Event)
        .where(Event.incident_id == incident_id)
        .order_by(Event.timestamp.asc())
    )

    events = list(
        db.scalars(event_statement).all()
    )

    for event in events:
        timeline.append(
            TimelineEvent(
                timestamp=event.timestamp,
                event_type="EVENT",
                title=event.event_type,
                description=(
                    f"Event {event.id}: "
                    f"{event.event_type} observed."
                ),
                source_type="EVENT",
                source_id=event.id,
            )
        )

    # ---------------------------------------------------------
    # Findings
    # ---------------------------------------------------------

    finding_statement = (
        select(Finding)
        .where(
            Finding.incident_id == incident_id
        )
        .order_by(Finding.created_at.asc())
    )

    findings = list(
        db.scalars(finding_statement).all()
    )

    for finding in findings:

        timeline.append(
            TimelineEvent(
                timestamp=finding.created_at,
                event_type="FINDING",
                title=finding.title,
                description=(
                    f"{finding.description} "
                    f"Confidence: {finding.confidence:.2f}. "
                    f"Status: {finding.status}."
                ),
                source_type="FINDING",
                source_id=finding.id,
            )
        )

        # -----------------------------------------------------
        # Investigation reasoning
        # -----------------------------------------------------

        step_statement = (
            select(InvestigationStep)
            .where(
                InvestigationStep.finding_id == finding.id
            )
            .order_by(
                InvestigationStep.step_order.asc()
            )
        )

        steps = list(
            db.scalars(step_statement).all()
        )

        for step in steps:
            timeline.append(
                TimelineEvent(
                    timestamp=step.created_at,
                    event_type="REASONING",
                    title=step.title,
                    description=(
                        f"{step.description} "
                        f"Conclusion: {step.conclusion} "
                        f"Confidence: {step.confidence:.2f}."
                    ),
                    source_type="INVESTIGATION_STEP",
                    source_id=step.id,
                )
            )

        # -----------------------------------------------------
        # Response recommendations
        # -----------------------------------------------------

        action_statement = (
            select(ResponseAction)
            .where(
                ResponseAction.finding_id == finding.id
            )
            .order_by(
                ResponseAction.created_at.asc()
            )
        )

        actions = list(
            db.scalars(action_statement).all()
        )

        for action in actions:

            timeline.append(
                TimelineEvent(
                    timestamp=action.created_at,
                    event_type="RESPONSE_RECOMMENDATION",
                    title=action.title,
                    description=(
                        f"{action.description} "
                        f"Status: {action.status}. "
                        f"Risk: {action.risk_level}. "
                        f"Confidence: {action.confidence:.2f}."
                    ),
                    source_type="RESPONSE_ACTION",
                    source_id=action.id,
                )
            )

            # -------------------------------------------------
            # Audit logs
            # -------------------------------------------------

            audit_statement = (
                select(AuditLog)
                .where(
                    AuditLog.response_action_id == action.id
                )
                .order_by(
                    AuditLog.created_at.asc()
                )
            )

            audit_logs = list(
                db.scalars(audit_statement).all()
            )

            for audit in audit_logs:

                timeline.append(
                    TimelineEvent(
                        timestamp=audit.created_at,
                        event_type=audit.action,
                        title=audit.action,
                        description=(
                            f"{audit.details or ''} "
                            f"Actor: {audit.actor}."
                        ),
                        source_type="AUDIT_LOG",
                        source_id=audit.id,
                    )
                )

    # ---------------------------------------------------------
    # Normalize filters
    # ---------------------------------------------------------

    normalized_event_type = (
        event_type.upper()
        if event_type
        else None
    )

    normalized_source_type = (
        source_type.upper()
        if source_type
        else None
    )

    # ---------------------------------------------------------
    # Apply filters
    # ---------------------------------------------------------

    if normalized_event_type is not None:
        timeline = [
            item
            for item in timeline
            if item.event_type.upper()
            == normalized_event_type
        ]

    if normalized_source_type is not None:
        timeline = [
            item
            for item in timeline
            if item.source_type.upper()
            == normalized_source_type
        ]

    # ---------------------------------------------------------
    # Final chronological ordering
    # ---------------------------------------------------------

    timeline.sort(
        key=lambda item: item.timestamp
    )

    return IncidentTimelineResponse(
        incident_id=incident_id,
        timeline=timeline,
    )
