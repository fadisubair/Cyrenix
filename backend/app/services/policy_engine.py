from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Dict, Any

from app.models.response_action import ResponseAction
from app.models.policy import ResponsePolicy, ResponsePolicyEvaluation
from app.models.user import User

class PolicyEngineService:
    @staticmethod
    def evaluate_action(db: Session, action_id: int, current_username: str) -> ResponsePolicyEvaluation:
        action = db.get(ResponseAction, action_id)
        if not action:
            raise ValueError("Action not found")
            
        # Example hardcoded policies for MVP
        # Rule 1: High-risk actions require analyst approval
        # Rule 2: VIEWER cannot execute (handled by RBAC usually, but let's add it)
        # Rule 3: External destructive actions cannot run in DRY_RUN-disabled mode without authorization (simplified)
        
        result = "PASSED"
        reason = "Action complies with all policies"
        policy_id = None
        
        if action.risk_level == "HIGH":
            result = "APPROVAL_REQUIRED"
            reason = "High-risk actions require analyst approval."
            
        # Example logic for BLOCKED
        if action.action_type == "DELETE_USER" and current_username != "admin":
            result = "BLOCKED"
            reason = "Only admins can delete users."
            
        evaluation = ResponsePolicyEvaluation(
            action_id=action.id,
            policy_id=policy_id,
            result=result,
            reason=reason
        )
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)
        
        return evaluation
