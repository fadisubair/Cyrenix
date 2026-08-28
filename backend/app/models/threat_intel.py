from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class ThreatIntel(Base):
    __tablename__ = "threat_intel"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ioc_value: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    ioc_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    reputation: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    context_data: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    first_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    retrieved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
