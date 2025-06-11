from fastapi import APIRouter, Depends
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter
from prisma.models import User

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas import ServerListResponseOptimized

router = APIRouter()


@cache(expire=900)  # 15 minutes cache
@router.get(
    "/my",
    response_model=ServerListResponseOptimized,
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def get_my_servers_optimized(
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> ServerListResponseOptimized:
    """Get current user's servers"""
    print(current_user)

    result = await client.server.find_many(
        where={"user_id": current_user.id},
    )
    print(result)

    return ServerListResponseOptimized(
        page=1,
        page_size=len(result),
        has_next=False,
        has_prev=False,
        servers=result,
    )
