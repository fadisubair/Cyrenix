from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import UserRegister


def get_user_by_username(
    db: Session,
    username: str,
) -> User | None:
    statement = (
        select(User)
        .where(User.username == username)
    )

    return db.scalars(statement).first()


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    statement = (
        select(User)
        .where(User.email == email)
    )

    return db.scalars(statement).first()


def register_user(
    db: Session,
    user_data: UserRegister,
) -> User:
    existing_username = get_user_by_username(
        db,
        user_data.username,
    )

    if existing_username is not None:
        raise ValueError(
            "Username already exists"
        )

    existing_email = get_user_by_email(
        db,
        user_data.email,
    )

    if existing_email is not None:
        raise ValueError(
            "Email already exists"
        )

    # Never store the plain-text password.
    password_hash = hash_password(
        user_data.password
    )

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=password_hash,
        role=user_data.role.upper(),
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    username: str,
    password: str,
) -> User | None:
    user = get_user_by_username(
        db,
        username,
    )

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def create_user_token(
    user: User,
) -> str:
    return create_access_token(
        username=user.username,
        user_id=user.id,
        role=user.role,
    )
