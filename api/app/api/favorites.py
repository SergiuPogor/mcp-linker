from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_cache.decorator import cache
from prisma.models import User

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas import ServerResponse
from app.schemas.common import CamelModel

router = APIRouter(prefix="/servers/favorites", tags=["servers favorites"])


class FavoriteToggleResponse(CamelModel):
    """Response for favorite toggle operation"""

    is_favorited: bool
    message: str


@router.post("/{server_id}", response_model=FavoriteToggleResponse)
async def add_favorite(
    server_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Add server to favorites"""

    try:
        async with client.tx() as tx:
            server = await tx.server.find_unique(where={"id": server_id})
            if not server:
                raise HTTPException(status_code=404, detail="Server not found")

            favorite = await tx.userfavoriteserver.upsert(
                where={
                    "user_id_server_id": {
                        "user_id": current_user.id,
                        "server_id": server_id,
                    }
                },
                data={
                    "create": {"user_id": current_user.id, "server_id": server_id},
                    "update": {},  # Do nothing if already exists
                },
            )

        return FavoriteToggleResponse(is_favorited=True, message="Added to favorites")

    except Exception as e:
        raise HTTPException(status_code=500, detail="Error toggling favorite")


@router.delete("/{server_id}", response_model=FavoriteToggleResponse)
async def remove_favorite(
    server_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Remove server from favorites"""

    # Check if server exists
    server = await client.server.find_unique(where={"id": server_id})
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    # Try to delete favorite
    try:
        await client.userfavoriteserver.delete(
            where={
                "user_id_server_id": {
                    "user_id": current_user.id,
                    "server_id": server_id,
                }
            }
        )
        return FavoriteToggleResponse(
            is_favorited=False, message="Removed from favorites"
        )
    except:
        return FavoriteToggleResponse(is_favorited=False, message="Not in favorites")


@router.get("/", response_model=List[ServerResponse])
@cache(expire=300)  # Cache for 5 minutes
async def get_user_favorites(
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Get user's favorite servers"""

    # Fetch user's favorite servers
    favorites = await client.userfavoriteserver.find_many(
        where={"user_id": current_user.id},
        include={"server": True},
    )

    return [ServerResponse.model_validate(favorite.server) for favorite in favorites]
