from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.finding import Finding
from app.models.finding_evidence import finding_evidence
from app.models.investigation_step import InvestigationStep
from app.services.correlation_service import CorrelationService
from app.services.mitre_service import MitreService
from app.services.next_investigation_service import NextInvestigationService

FAILED_LOGIN_TYPES = {
    "FAILED_LOGIN",
    "LOGIN_FAILED",
    "AUTH_FAILURE",
}

MIN_FAILED_LOGINS = 3
WINDOW_MINUTES = 10


def analyze_incident(
    db: Session,
    incident_id: int,
) -> Finding | None:
    """
    Analyze all events belonging to an incident.

    Currently detects:
    - Multiple failed login attempts
    - Same source IP
    - Same username
    - Within a 10-minute window

    Returns a proposed Finding when a pattern is detected.
    Returns None when no supported pattern is detected.
    """
    
    # Clear existing proposed findings to prevent duplicates on multiple clicks
    db.query(Finding).filter(
        Finding.incident_id == incident_id,
        Finding.status == "PROPOSED"
    ).delete(synchronize_session=False)
    db.commit()

    statement = (
        select(Event)
        .where(Event.incident_id == incident_id)
        .order_by(Event.timestamp.asc())
    )

    events = list(db.scalars(statement).all())

    if not events:
        return None

    failed_logins = [
        event
        for event in events
        if event.event_type.upper() in FAILED_LOGIN_TYPES
        and event.source_ip
        and event.username
    ]

    if len(failed_logins) < MIN_FAILED_LOGINS:
        return None

    # Group failed login events by source IP + username.
    groups: dict[tuple[str, str], list[Event]] = {}

    for event in failed_logins:
        key = (
            event.source_ip,
            event.username,
        )

        groups.setdefault(key, []).append(event)

    # Find the strongest matching group.
    best_group: list[Event] | None = None

    for group_events in groups.values():
        if len(group_events) < MIN_FAILED_LOGINS:
            continue

        # Events are already sorted by timestamp.
        for start_index in range(len(group_events)):
            window_start = group_events[start_index].timestamp

            matching_events = [
                event
                for event in group_events[start_index:]
                if event.timestamp - window_start
                <= timedelta(minutes=WINDOW_MINUTES)
            ]

            if len(matching_events) >= MIN_FAILED_LOGINS:
                if (
                    best_group is None
                    or len(matching_events) > len(best_group)
                ):
                    best_group = matching_events

                break

    if not best_group:
        # Fallback to AI Manager
        from app.services.ai.manager import ai_manager
        ai_result = ai_manager.analyze_incident(db, incident_id)
        if ai_result:
            finding = Finding(
                incident_id=incident_id,
                title=ai_result["title"],
                finding_type=ai_result["finding_type"],
                description=ai_result["description"],
                rationale=ai_result["rationale"],
                confidence=ai_result["confidence"],
                mitre_techniques=ai_result.get("mitre_techniques"),
                supporting_evidence=ai_result.get("supporting_evidence"),
                contradicting_evidence=ai_result.get("contradicting_evidence"),
                status="PROPOSED",
            )
            db.add(finding)
            db.flush()
            
            # Simple assessment step for AI
            assessment_step = InvestigationStep(
                finding_id=finding.id,
                step_order=1,
                step_type="ASSESSMENT",
                title="AI Model Assessment",
                description="The AI model evaluated the incident.",
                conclusion="AI model provided a finding based on patterns.",
                confidence=ai_result["confidence"],
                evidence_event_ids=[],
            )
            db.add(assessment_step)
            db.commit()
            db.refresh(finding)
            
            # Trigger expansion services
            CorrelationService.correlate_events_for_incident(db, incident_id)
            MitreService.get_mitre_mapping_for_finding(db, finding.id)
            NextInvestigationService.generate_recommendations(db, finding.id)
            
            return finding
            
        return None

    source_ip = best_group[0].source_ip
    username = best_group[0].username

    count = len(best_group)

    # Calculate deterministic confidence.
    if count >= 5:
        confidence = 0.95
    elif count == 4:
        confidence = 0.85
    else:
        confidence = 0.75

    first_event = best_group[0]
    last_event = best_group[-1]

    rationale = (
        f"{count} failed login attempts were detected against "
        f"the account '{username}' from source IP {source_ip} "
        f"within {WINDOW_MINUTES} minutes. "
        f"The events are consistent with a possible brute-force "
        f"authentication attack."
    )

    description = (
        f"Multiple failed login attempts were observed for "
        f"'{username}' from {source_ip}."
    )
    finding = Finding(
        incident_id=incident_id,
        title="Possible Brute-Force Attack",
        finding_type="BRUTE_FORCE",
        description=description,
        rationale=rationale,
        confidence=confidence,
        status="PROPOSED",
    )

    db.add(finding)
    db.flush()

    event_ids = [
        event.id
        for event in best_group
    ]

    # ---------------------------------------------------------
    # Investigation Step 1 — Observation
    # ---------------------------------------------------------

    observation_step = InvestigationStep(
        finding_id=finding.id,
        step_order=1,
        step_type="OBSERVATION",
        title="Multiple failed authentication attempts observed",
        description=(
            f"{count} failed login events were observed "
            f"for account '{username}' from source IP "
            f"{source_ip}."
        ),
        conclusion=(
            "The incident contains repeated authentication "
            "failures involving the same account and source."
        ),
        confidence=1.0,
        evidence_event_ids=event_ids,
    )

    db.add(observation_step)

    # ---------------------------------------------------------
    # Investigation Step 2 — Correlation
    # ---------------------------------------------------------

    correlation_step = InvestigationStep(
        finding_id=finding.id,
        step_order=2,
        step_type="CORRELATION",
        title="Failed login events correlated",
        description=(
            f"The failed login events were grouped using "
            f"source IP '{source_ip}' and username '{username}'. "
            f"All {count} matching events occurred within "
            f"{WINDOW_MINUTES} minutes."
        ),
        conclusion=(
            "The events form a temporally and contextually "
            "consistent authentication-failure pattern."
        ),
        confidence=0.90,
        evidence_event_ids=event_ids,
    )

    db.add(correlation_step)

    # ---------------------------------------------------------
    # Investigation Step 3 — Assessment
    # ---------------------------------------------------------

    assessment_step = InvestigationStep(
        finding_id=finding.id,
        step_order=3,
        step_type="ASSESSMENT",
        title="Possible brute-force attack assessed",
        description=(
            f"The repeated authentication failures are "
            f"consistent with a brute-force authentication "
            f"pattern."
        ),
        conclusion=(
            "A possible brute-force attack is proposed. "
            "The conclusion requires analyst validation "
            "before being treated as confirmed."
        ),
        confidence=confidence,
        evidence_event_ids=event_ids,
    )

    db.add(assessment_step)

    # ---------------------------------------------------------
    # Existing evidence links
    # ---------------------------------------------------------

    for event in best_group:
        db.execute(
            finding_evidence.insert().values(
                finding_id=finding.id,
                event_id=event.id,
            )
        )

    db.commit()
    db.refresh(finding)
    
    # Trigger expansion services
    CorrelationService.correlate_events_for_incident(db, incident_id)
    MitreService.get_mitre_mapping_for_finding(db, finding.id)
    NextInvestigationService.generate_recommendations(db, finding.id)

    return finding
