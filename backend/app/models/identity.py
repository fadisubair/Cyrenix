from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, Float, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class IdentityProfile(Base):
    __tablename__ = "identity_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False, index=True, unique=True)
    risk_score: Mapped[str] = mapped_column(String(20), nullable=False, default="LOW")
    baseline_data: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class IdentitySignal(Base):
    __tablename__ = "identity_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("identity_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    signal_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="LOW")
    evidence: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
