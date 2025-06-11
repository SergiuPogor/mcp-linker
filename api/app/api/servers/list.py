import hashlib
from typing import Any, Dict, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter
from prisma.models import User

from app.core.auth import get_optional_user
from app.crud.server import server_optimized
from app.schemas import ServerListResponseOptimized
from data import cats_en

router = APIRouter()


def ultra_cache_key_builder(
    func, namespace, *, request=None, response=None, args=(), kwargs=None
) -> str:
    """Simplified cache key builder"""
    kwargs = kwargs or {}

    # Create parameter signature
    params = {
        "page": kwargs.get("page", 1),
        "size": kwargs.get("page_size", 20),
        "cat": kwargs.get("cat", ""),
        "category_id": kwargs.get("category_id", ""),
        "dev": kwargs.get("developer", ""),
        "sort": kwargs.get("sort", "github_stars"),
        "dir": kwargs.get("direction", "desc"),
        "search": kwargs.get("search", ""),
        "relations": kwargs.get("include_relations", True),
    }

    # Create compact hash key
    param_str = "&".join(f"{k}={v}" for k, v in sorted(params.items()) if v)
    hash_key = hashlib.md5(param_str.encode()).hexdigest()[:12]

    return f"{namespace}:v2:{hash_key}"


@cache(
    expire=2700,  # Cache for 45 minutes, relatively stable data
    key_builder=ultra_cache_key_builder,
)
@router.get(
    "/",
    response_model=ServerListResponseOptimized,
    dependencies=[Depends(RateLimiter(times=30, seconds=60))],
)
async def get_servers_ultra(
    background_tasks: BackgroundTasks,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=20, description="Items per page"),
    cat: Optional[str] = Query(None, description="Category"),
    category_id: Optional[int] = Query(None, description="category_id"),
    sort: Optional[str] = Query("github_stars", description="Sort field"),
    direction: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    search: Optional[str] = Query(None, min_length=2, max_length=100),
    developer: Optional[str] = Query(None, max_length=100),
    include_relations: bool = Query(True, description="Include category/user data"),
    need_total: bool = Query(False, description="Return total count (slower)"),
    current_user: Optional[User] = Depends(get_optional_user),
) -> ServerListResponseOptimized:
    """Ultra-optimized server list API"""

    # Get user_id for favorites if user is logged in
    user_id = current_user.id if current_user else None
    if category_id:
        try:
            cat = cats_en[category_id - 1]
        except Exception as e:
            raise HTTPException(400, detail=str(e))

    # Asynchronously fetch data
    result = await server_optimized.get_servers_optimized(
        page=page,
        page_size=page_size,
        cat=cat,
        search=search,
        developer=developer,
        order_by=sort,
        order_direction=direction,
        include_relations=include_relations,
        need_total=need_total,
        user_id=user_id,
    )

    return ServerListResponseOptimized(
        page=result.page,
        page_size=result.page_size,
        has_next=result.has_next,
        has_prev=result.has_prev,
        total=result.total,
        servers=result.items,
    )


@cache(expire=3600, key_builder=lambda f, ns, **kw: f"{ns}:minimal:{hash(str(kw))}")
@router.get(
    "/minimal",
    dependencies=[Depends(RateLimiter(times=60, seconds=60))],
)
async def get_servers_minimal(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    cat: Optional[str] = Query(None, description="Category"),
    sort: Optional[str] = Query("github_stars"),
    direction: Optional[str] = Query("desc", regex="^(asc|desc)$"),
) -> Dict[str, Any]:
    """Ultra-fast API, returns only basic fields"""

    result = await server_optimized.get_servers_minimal(
        page=page,
        page_size=page_size,
        cat=cat,
        order_by=sort,
        order_direction=direction,
    )

    return {"version": "2025-05-22-minimal", **result}


@cache(expire=1800)  # 30 minutes cache
@router.get(
    "/recommended",
    response_model=ServerListResponseOptimized,
    dependencies=[Depends(RateLimiter(times=50, seconds=60))],
)
async def get_recommended_servers(
    current_user: Optional[User] = Depends(get_optional_user),
) -> ServerListResponseOptimized:
    """Get recommended servers (blender and context7)"""

    user_id = current_user.id if current_user else None

    # Get the recommended servers by name
    recommended_servers = await server_optimized.get_recommended_servers(
        server_names=["blender", "context7"],
        user_id=user_id,
    )

    return ServerListResponseOptimized(
        page=1,
        page_size=len(recommended_servers),
        has_next=False,
        has_prev=False,
        total=len(recommended_servers),
        servers=recommended_servers,
    )
