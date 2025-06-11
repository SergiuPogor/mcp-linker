import logging
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import PyJWTError
from prisma.models import User

from ..core.config import settings
from ..core.prisma_config import get_prisma

logger = logging.getLogger(__name__)

oauth2_scheme = HTTPBearer()


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> User:
    """
    Verify the JWT token and return the user
    """
    try:
        # Verify the token using Supabase's JWT secret
        payload = jwt.decode(
            credentials.credentials,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_signature": True},
        )

        # Extract user_id from the token
        user_id = payload.get("sub")
        print("ge user_id", user_id)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_metadata = payload.get("user_metadata", {})

        # Get Prisma client
        client = await get_prisma()

        # Try to get existing user or create a new one
        user = await client.user.upsert(
            where={"id": user_id},
            data={
                "create": {
                    "id": user_id,
                    "email": payload.get("email"),
                    "role": payload.get("role", "authenticated"),
                    "username": user_metadata.get("user_name"),
                    "fullname": user_metadata.get("full_name"),
                    "avatar_url": user_metadata.get("avatar_url", ""),
                },
                "update": {
                    "email": payload.get("email"),
                    "username": user_metadata.get("user_name"),
                    "fullname": user_metadata.get("full_name"),
                    "avatar_url": user_metadata.get("avatar_url", ""),
                },
            },
        )

        print("verify_token: Authenticated user:", user.email)
        return user

    except PyJWTError as e:
        print("verify_token: JWT decoding failed:", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(user: User = Depends(verify_token)) -> User:
    """Return the authenticated user"""
    return user


async def get_optional_user(request: Request) -> Optional[User]:
    """Get the current user if authenticated, otherwise return None"""
    if "authorization" not in request.headers:
        return None

    try:
        auth = request.headers["authorization"]
        if not auth.startswith("Bearer "):
            return None

        token = auth.split(" ")[1]
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        user = await verify_token(credentials)
        return user
    except (HTTPException, PyJWTError, IndexError):
        return None


async def admin_required(current_user: User = Depends(get_current_user)) -> User:
    """
    Check if the current user is an admin

    This dependency can be used to protect admin-only routes
    """
    if current_user.role != "admin":
        logger.warning(f"User {current_user.id} attempted to access admin route")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
