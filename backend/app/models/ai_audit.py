from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, ForeignKey, JSON, Text, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class AIAuditLog(Base):
    __tablename__ = "ai_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    incident_id: Mapped[int | None] = mapped_column(ForeignKey("incidents.id", ondelete="CASCADE"), nullable=True, index=True)
    actor: Mapped[str] = mapped_column(String(100), nullable=False)
    purpose: Mapped[str] = mapped_column(String(255), nullable=False)
    evidence_references: Mapped[list | dict | None] = mapped_column(JSON, nullable=True)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_provider: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
