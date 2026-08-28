from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class AttackChain(Base):
    __tablename__ = "attack_chains"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AttackStage(Base):
    __tablename__ = "attack_stages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    chain_id: Mapped[int] = mapped_column(ForeignKey("attack_chains.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    mitre_tactic: Mapped[str | None] = mapped_column(String(100), nullable=True)
    mitre_technique: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

class CorrelationLink(Base):
    __tablename__ = "correlation_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    stage_id: Mapped[int] = mapped_column(ForeignKey("attack_stages.id", ondelete="CASCADE"), nullable=False, index=True)
    source_event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False, index=True)
    target_event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id"), nullable=True, index=True)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
