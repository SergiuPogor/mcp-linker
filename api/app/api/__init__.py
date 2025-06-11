from fastapi import APIRouter

from . import _favs, cat, favorites, health, server_configs, servers, team, user
from .servers import metrics

# Create main router
router = APIRouter(prefix="/api/v1")

# Include health check router at API root
health_router = APIRouter()
health_router.include_router(health.router)

# Auth routes at root level (no version prefix needed as they're standard)
router.include_router(user.router, prefix="/users")

# Versioned API routes
router.include_router(cat.router)
router.include_router(favorites.router)
router.include_router(metrics.router)
router.include_router(servers.router)
router.include_router(server_configs.router)
router.include_router(_favs.router)
router.include_router(team.router)
