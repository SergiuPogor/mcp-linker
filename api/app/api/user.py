from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from ..core.auth import verify_token
from ..core.prisma_config import get_prisma
from ..schemas.user import UserResponse

router = APIRouter(tags=["authentication"])


class UserUpdate(BaseModel):
    username: str


@router.get("/me", response_model=UserResponse)
async def get_me(user_data=Depends(verify_token)):
    return user_data


@router.get("/by-email", response_model=UserResponse)
async def get_user_by_email(
    email: str = Query(..., description="Email of the user to find"),
    current_user=Depends(verify_token),
    client=Depends(get_prisma),
):
    """Get a user by their email address"""
    user = await client.user.find_first(where={"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    user_data=Depends(verify_token),
    client=Depends(get_prisma),
):
    """Update the current user's profile"""
    updated_user = await client.user.update(
        where={"id": user_data.id},
        data={"username": user_update.username},
    )
    return updated_user
