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


def get_events(
    db: Session,
    limit: int = 100,
    offset: int = 0,
    event_type: str | None = None,
    username: str | None = None,
    source_ip: str | None = None,
    hostname: str | None = None,
) -> list[Event]:
    statement = select(Event)

    if event_type:
        statement = statement.where(Event.event_type.ilike(f"%{event_type}%"))
    if username:
        statement = statement.where(Event.username.ilike(f"%{username}%"))
    if source_ip:
        statement = statement.where(Event.source_ip.ilike(f"%{source_ip}%"))
    if hostname:
        statement = statement.where(Event.hostname.ilike(f"%{hostname}%"))

    statement = statement.order_by(Event.timestamp.desc()).limit(limit).offset(offset)

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
