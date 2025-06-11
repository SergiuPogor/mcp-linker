from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi_cache.decorator import cache
from prisma.models import User

from app.core.auth import get_current_user, get_optional_user
from app.core.prisma_config import get_prisma
from app.schemas import ServerResponse
from app.schemas.common import CamelModel

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class RecommendationResponse(CamelModel):
    """Response for server recommendations"""

    servers: List[ServerResponse]
    reason: str
    total_found: int


@router.get("/based-on-favorites", response_model=RecommendationResponse)
@cache(expire=1800)  # Cache for 30 minutes
async def get_recommendations_based_on_favorites(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(default=10, le=50, ge=1),
    prisma=Depends(get_prisma),
):
    """Get server recommendations based on user's favorite servers"""

    # Get user's favorite servers
    user_favorites = await prisma.userfavoriteserver.find_many(
        where={"user_id": current_user["id"]},
        include={"server": True},
    )

    if not user_favorites:
        # If no favorites, recommend popular servers
        popular_servers = await prisma.server.find_many(
            where={"is_official": True},
            order=[
                {"rating": "desc"},
                {"downloads": "desc"},
            ],
            take=limit,
        )

        return RecommendationResponse(
            servers=[
                ServerResponse.model_validate(server) for server in popular_servers
            ],
            reason="Popular servers (you have no favorites yet)",
            total_found=len(popular_servers),
        )

    # Get developers of favorited servers
    favorite_developers = list(
        set(
            [
                fav.server.developer
                for fav in user_favorites
                if fav.server and fav.server.developer
            ]
        )
    )
    favorite_server_ids = [fav.server.id for fav in user_favorites]

    # Find similar servers by same developers or high ratings, excluding already favorited
    where_clause = {
        "OR": [
            {"rating": {"gte": 4.0}, "downloads": {"gte": 100}},
        ],
        "NOT": {"id": {"in": favorite_server_ids}},
    }

    if favorite_developers:
        where_clause["OR"].append({"developer": {"in": favorite_developers}})

    servers = await prisma.server.find_many(
        where=where_clause,
        order=[
            {"rating": "desc"},
            {"downloads": "desc"},
        ],
        take=limit,
    )

    reason = "Based on your favorite servers and developers"
    if not favorite_developers:
        reason = "Highly rated servers similar to your interests"

    return RecommendationResponse(
        servers=[ServerResponse.model_validate(server) for server in servers],
        reason=reason,
        total_found=len(servers),
    )


@router.get("/trending", response_model=RecommendationResponse)
@cache(expire=3600)  # Cache for 1 hour
async def get_trending_servers(
    limit: int = Query(default=10, le=50, ge=1),
    prisma=Depends(get_prisma),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Get trending servers (most favorited recently)"""

    # Get trending servers with favorite count
    trending_servers = await prisma.server.find_many(
        include={"favorited_by": {"select": {"user_id": True}}},
        order=[{"favorited_by": {"_count": "desc"}}],
        take=limit,
    )

    return RecommendationResponse(
        servers=[ServerResponse.model_validate(server) for server in trending_servers],
        reason="Most favorited servers recently",
        total_found=len(trending_servers),
    )


@router.get("/official", response_model=RecommendationResponse)
@cache(expire=10)  # Cache for 1 hour
async def get_official_recommendations(
    limit: int = Query(default=10, le=50, ge=1), prisma=Depends(get_prisma)
):
    """Get official server recommendations"""

    # Get official servers
    official_servers = await prisma.server.find_many(
        where={
            "is_official": True,
        },
        order=[
            {"rating": "desc"},
            {"downloads": "desc"},
        ],
        take=limit,
    )

    return RecommendationResponse(
        servers=[ServerResponse.model_validate(server) for server in official_servers],
        reason="Official recommended servers",
        total_found=len(official_servers),
    )


@router.get("/similar/{server_id}", response_model=RecommendationResponse)
@cache(expire=1800)  # Cache for 30 minutes
async def get_similar_servers(
    server_id: str,
    current_user: dict = Depends(get_current_user),
    limit: int = Query(default=10, le=50, ge=1),
    prisma=Depends(get_prisma),
):
    """Get servers similar to a specific server"""

    # Get the reference server
    reference_server = await prisma.server.find_first(where={"id": server_id})
    if not reference_server:
        return RecommendationResponse(
            servers=[], reason="Reference server not found", total_found=0
        )

    # Get user's favorites to exclude them
    user_favorites = await prisma.userfavoriteserver.find_many(
        where={"user_id": current_user["id"]},
        select={"server_id": True},
    )
    favorite_server_ids = [fav.server_id for fav in user_favorites]

    # Find similar servers (same developer or similar rating range)
    similar_servers = await prisma.server.find_many(
        where={
            "OR": [
                {"developer": reference_server.developer},
                {
                    "AND": [
                        {"rating": {"gte": reference_server.rating - 0.5}},
                        {"rating": {"lte": reference_server.rating + 0.5}},
                    ]
                },
            ],
            "NOT": {
                "OR": [
                    {"id": server_id},
                    {"id": {"in": favorite_server_ids}},
                ]
            },
        },
        order=[
            {"rating": "desc"},
            {"downloads": "desc"},
        ],
        take=limit,
    )

    return RecommendationResponse(
        servers=[ServerResponse.model_validate(server) for server in similar_servers],
        reason=f"Similar to {reference_server.name}",
        total_found=len(similar_servers),
    )
