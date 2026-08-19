from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.finding import Finding
from app.models.finding_evidence import finding_evidence
from app.schemas.finding import FindingCreate, FindingUpdate


def create_finding(
    db: Session,
    finding_data: FindingCreate,
) -> Finding:
    finding = Finding(
        incident_id=finding_data.incident_id,
        title=finding_data.title,
        finding_type=finding_data.finding_type,
        description=finding_data.description,
        rationale=finding_data.rationale,
        confidence=finding_data.confidence,
        status=finding_data.status,
    )

    db.add(finding)
    db.commit()
    db.refresh(finding)

    return finding


def get_findings(db: Session) -> list[Finding]:
    statement = select(Finding).order_by(
        Finding.created_at.desc()
    )

    return list(db.scalars(statement).all())


def get_finding(
    db: Session,
    finding_id: int,
) -> Finding | None:
    return db.get(Finding, finding_id)


def get_incident_findings(
    db: Session,
    incident_id: int,
) -> list[Finding]:
    statement = (
        select(Finding)
        .where(Finding.incident_id == incident_id)
        .order_by(Finding.created_at.desc())
    )

    return list(db.scalars(statement).all())


def update_finding(
    db: Session,
    finding: Finding,
    finding_data: FindingUpdate,
) -> Finding:
    update_data = finding_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(finding, field, value)

    db.commit()
    db.refresh(finding)

    return finding


def delete_finding(
    db: Session,
    finding: Finding,
) -> None:
    db.delete(finding)
    db.commit()


def link_event_to_finding(
    db: Session,
    finding: Finding,
    event: Event,
) -> None:
    # Make sure evidence belongs to the same incident.
    if event.incident_id != finding.incident_id:
        raise ValueError(
            "Event does not belong to the finding's incident"
        )

    statement = select(finding_evidence).where(
        finding_evidence.c.finding_id == finding.id,
        finding_evidence.c.event_id == event.id,
    )

    existing_link = db.execute(statement).first()

    if existing_link is None:
        db.execute(
            finding_evidence.insert().values(
                finding_id=finding.id,
                event_id=event.id,
            )
        )

        db.commit()


def get_finding_events(
    db: Session,
    finding_id: int,
) -> list[Event]:
    statement = (
        select(Event)
        .join(
            finding_evidence,
            finding_evidence.c.event_id == Event.id,
        )
        .where(
            finding_evidence.c.finding_id == finding_id
        )
        .order_by(Event.timestamp.asc())
    )

    return list(db.scalars(statement).all())
