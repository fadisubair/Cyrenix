from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentUpdate


def create_incident(
    db: Session,
    incident_data: IncidentCreate,
) -> Incident:
    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        category=incident_data.category,
        severity=incident_data.severity,
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    return incident


def get_incidents(db: Session) -> list[Incident]:
    statement = select(Incident).order_by(Incident.created_at.desc())

    return list(db.scalars(statement).all())


def get_incident(
    db: Session,
    incident_id: int,
) -> Incident | None:
    return db.get(Incident, incident_id)


def update_incident(
    db: Session,
    incident: Incident,
    incident_data: IncidentUpdate,
) -> Incident:
    update_data = incident_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)

    return incident


def delete_incident(
    db: Session,
    incident: Incident,
) -> None:
    db.delete(incident)
    db.commit()
