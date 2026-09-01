from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_role
from app.core.database import get_db
from app.models.finding import Finding
from app.models.user import User
from app.schemas.response_action import (
    ResponseActionExecution,
    ResponseActionResponse,
)
from app.services.response_action_service import (
    approve_response_action,
    execute_response_action,
    get_finding_response_actions,
    get_all_response_actions,
    get_response_action,
    recommend_response_for_finding,
    reject_response_action,
)
from app.services.policy_engine import PolicyEngineService


router = APIRouter(
    prefix="/api/response-actions",
    tags=["Response Actions"],
)


# ---------------------------------------------------------
# Recommendation
# ---------------------------------------------------------

@router.post(
    "/finding/{finding_id}/recommend",
    response_model=ResponseActionResponse,
    status_code=status.HTTP_201_CREATED,
)
def recommend_response(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    finding = db.get(
        Finding,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    action = recommend_response_for_finding(
        db,
        finding,
    )

    if action is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No supported response recommendation available",
        )

    return action


# ---------------------------------------------------------
# List actions for a finding
# ---------------------------------------------------------

@router.get(
    "",
    response_model=list[ResponseActionResponse],
)
def list_all_response_actions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_response_actions(db)

@router.get(
    "/finding/{finding_id}",
    response_model=list[ResponseActionResponse],
)
def list_finding_response_actions(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    finding = db.get(
        Finding,
        finding_id,
    )

    if finding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finding not found",
        )

    return get_finding_response_actions(
        db,
        finding_id,
    )


# ---------------------------------------------------------
# Get a single response action
# ---------------------------------------------------------

@router.get(
    "/{action_id}",
    response_model=ResponseActionResponse,
)
def get_response_action_endpoint(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = get_response_action(
        db,
        action_id,
    )

    if action is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response action not found",
        )

    return action


# ---------------------------------------------------------
# Approve
# ---------------------------------------------------------

@router.patch(
    "/{action_id}/approve",
    response_model=ResponseActionResponse,
)
def approve_response_action_endpoint(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    action = get_response_action(
        db,
        action_id,
    )

    if action is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response action not found",
        )

    try:
        return approve_response_action(
            db,
            action,
            current_user.username,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ---------------------------------------------------------
# Reject
# ---------------------------------------------------------

@router.patch(
    "/{action_id}/reject",
    response_model=ResponseActionResponse,
)
def reject_response_action_endpoint(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    action = get_response_action(
        db,
        action_id,
    )

    if action is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response action not found",
        )

    try:
        return reject_response_action(
            db,
            action,
            current_user.username,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ---------------------------------------------------------
# Execute
# ---------------------------------------------------------

@router.post(
    "/{action_id}/execute",
    response_model=ResponseActionResponse,
)
def execute_response_action_endpoint(
    action_id: int,
    execution: ResponseActionExecution,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("ANALYST", "ADMIN")
    ),
):
    action = get_response_action(
        db,
        action_id,
    )

    if action is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response action not found",
        )

    # Policy Check
    evaluation = PolicyEngineService.evaluate_action(db, action_id, current_user.username)
    if evaluation.result == "BLOCKED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Action blocked by policy: {evaluation.reason}"
        )

    try:
        return execute_response_action(
            db,
            action,
            execution.mode,
            current_user.username,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

@router.get(
    "/{action_id}/policy",
)
def check_response_policy(
    action_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action = get_response_action(
        db,
        action_id,
    )

    if action is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response action not found",
        )

    eval = PolicyEngineService.evaluate_action(db, action_id, current_user.username)
    return {
        "result": eval.result,
        "reason": eval.reason
    }

