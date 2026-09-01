from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, String, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class ResponsePolicy(Base):
    __tablename__ = "response_policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    rule_type: Mapped[str] = mapped_column(String(50), nullable=False)
    conditions: Mapped[list | dict | None] = mapped_column(JSON, nullable=False)
    action_effect: Mapped[str] = mapped_column(String(30), nullable=False) # e.g. BLOCK, REQUIRE_APPROVAL, ALLOW
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

class ResponsePolicyEvaluation(Base):
    __tablename__ = "response_policy_evaluations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    action_id: Mapped[int] = mapped_column(ForeignKey("response_actions.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_id: Mapped[int | None] = mapped_column(ForeignKey("response_policies.id", ondelete="SET NULL"), nullable=True)
    result: Mapped[str] = mapped_column(String(30), nullable=False) # e.g. PASSED, BLOCKED, APPROVAL_REQUIRED
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
