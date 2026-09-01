from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class InvestigationRecommendation(Base):
    __tablename__ = "investigation_recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_needed: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
