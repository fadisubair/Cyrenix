from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.schemas.event import EventCreate


def create_event(
    db: Session,
    event_data: EventCreate,
) -> Event:

    event = Event(
        incident_id=event_data.incident_id,
        timestamp=event_data.timestamp,
        event_type=event_data.event_type,
        source=event_data.source,
        username=event_data.username,
        source_ip=event_data.source_ip,
        destination_ip=event_data.destination_ip,
        hostname=event_data.hostname,
        raw_data=event_data.raw_data,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def get_events(db: Session) -> list[Event]:

    statement = select(Event).order_by(
        Event.timestamp.desc()
    )

    return list(db.scalars(statement).all())


def get_event(
    db: Session,
    event_id: int,
) -> Event | None:

    return db.get(Event, event_id)


def get_incident_events(
    db: Session,
    incident_id: int,
) -> list[Event]:

    statement = (
        select(Event)
        .where(Event.incident_id == incident_id)
        .order_by(Event.timestamp.desc())
    )

    return list(db.scalars(statement).all())
