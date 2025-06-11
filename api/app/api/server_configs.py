from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_cache.decorator import cache

from app.core.prisma_config import get_prisma

router = APIRouter(prefix="/server_configs", tags=["server_configs"])


@cache(expire=60 * 10)  # Increased cache time to 10 minutes
@router.get("/")
async def get_configs_by_server_id(
    server_id: str = Query(..., description="Server ID to get configs for"),
    client=Depends(get_prisma),
):
    """Get server configuration by server ID - optimized version"""

    config = await client.serverconfig.find_first(where={"server_id": server_id})

    if not config:
        raise HTTPException(status_code=404, detail="Server config not found")

    return config.config_items
