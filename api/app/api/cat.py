# routes/categories.py
import logging

from fastapi import APIRouter, Depends
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter

from app.core.prisma_config import get_prisma
from data import cats_en

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/categories", tags=["categories"])


@cache(expire=60 * 60)
@router.get(
    "/",
    dependencies=[Depends(RateLimiter(times=3, seconds=60))],
)
async def get_categories(client=Depends(get_prisma)):
    logger.info("Getting categories list")
    servers = await client.server.find_many(
        where={"cat": {"not": None}},
    )
    return list(set([server.cat for server in servers if server.cat is not None]))


@cache(expire=60 * 60)
@router.get(
    "/simple",
    dependencies=[Depends(RateLimiter(times=3, seconds=60))],
)
async def list_simple_categories():
    return cats_en
