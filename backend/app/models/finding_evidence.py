from sqlalchemy import ForeignKey, Integer, Table, Column

from app.core.database import Base


finding_evidence = Table(
    "finding_evidence",
    Base.metadata,
    Column(
        "finding_id",
        Integer,
        ForeignKey("findings.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "event_id",
        Integer,
        ForeignKey("events.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
