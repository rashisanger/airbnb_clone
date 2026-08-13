from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from .database import get_db
from .models import User


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# Schemas
# ============================================================

class LoginRequest(BaseModel):
    email: EmailStr


# ============================================================
# POST /auth/login
# ============================================================

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Mock login.

    There is intentionally no password or JWT authentication.
    If the email exists, return that user.
    Otherwise create a new guest user.
    """

    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    # Existing user
    if user:
        return user

    # Create a new user when email doesn't exist.
    # Since real authentication is mocked, we use the
    # email as the basis for a simple display name.
    name = data.email.split("@")[0].replace(".", " ").title()

    user = User(
        name=name,
        email=data.email,
        role="guest",
        avatar_url="https://i.pravatar.cc/150?img=12",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ============================================================
# GET /auth/me
# ============================================================

@router.get("/me")
def get_current_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Return the profile of the mocked logged-in user.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


# ============================================================
# POST /auth/become-host
# ============================================================

@router.post("/become-host")
def become_host(
    user_id: int,
    db: Session = Depends(get_db),
):
    """
    Convert a guest into a host.

    In the mocked authentication system, this simply
    changes the user's role from guest to host.
    """

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.role = "host"

    db.commit()
    db.refresh(user)

    return {
        "message": "User is now a host",
        "user": user,
    }