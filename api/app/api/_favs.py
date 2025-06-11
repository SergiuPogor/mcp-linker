from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_cache.decorator import cache
from prisma.models import User

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas.common import CamelModel

from .favorites import FavoriteToggleResponse

router = APIRouter(prefix="/servers/favorites", tags=["servers favorites"])


class FavoriteStats(CamelModel):
    """Favorite statistics for a server"""

    server_id: str
    favorite_count: int
    is_favorited: bool = False


@router.post("/{server_id}/toggle", response_model=FavoriteToggleResponse)
async def toggle_favorite(
    server_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Toggle favorite status for a server"""

    # Check if server exists
    server = await client.server.find_unique(where={"id": server_id})
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    # Check if already favorited
    favorite = await client.userfavoriteserver.find_unique(
        where={
            "user_id_server_id": {
                "user_id": current_user.id,
                "server_id": server_id,
            }
        }
    )

    if favorite:
        # Remove from favorites
        await client.userfavoriteserver.delete(
            where={
                "user_id_server_id": {
                    "user_id": current_user.id,
                    "server_id": server_id,
                }
            }
        )
        return FavoriteToggleResponse(
            is_favorited=False, message="Server removed from favorites"
        )
    else:
        # Add to favorites
        await client.userfavoriteserver.create(
            data={"user_id": current_user.id, "server_id": server_id}
        )
        return FavoriteToggleResponse(
            is_favorited=True, message="Server added to favorites"
        )


@router.get("/stats/{server_id}", response_model=FavoriteStats)
@cache(expire=3600)  # Cache for 1 hour
async def get_favorite_stats(
    server_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> FavoriteStats:
    """Get favorite statistics for a server"""

    # Get favorite count
    favorite_count = await client.userfavoriteserver.count(
        where={"server_id": server_id}
    )

    # Check if user has favorited
    is_favorited = (
        await client.userfavoriteserver.count(
            where={
                "server_id": server_id,
                "user_id": current_user.id,
            }
        )
        > 0
    )

    return FavoriteStats(
        server_id=server_id,
        favorite_count=favorite_count,
        is_favorited=is_favorited,
    )


@router.get("/check/{server_id}")
async def check_favorite_status(
    server_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Check if a server is favorited by current user"""

    # Check if server exists
    server = await client.server.find_unique(where={"id": server_id})
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")

    # Check if already favorited
    favorite = await client.userfavoriteserver.find_unique(
        where={
            "user_id_server_id": {
                "user_id": current_user.id,
                "server_id": server_id,
            }
        }
    )

    is_favorited = favorite is not None

    return {"isFavorited": is_favorited}


@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
async def clear_all_favorites(
    current_user: User = Depends(get_current_user),
):
    """Clear all user's favorites"""
    client = await get_prisma()

    # Clear all favorites for the user
    await client.userfavoriteserver.delete_many(where={"user_id": current_user.id})
