"""
Health check endpoints and utilities.
"""

from datetime import datetime

from fastapi import APIRouter

from ..core.config import settings

# Create a router for health-related endpoints
router = APIRouter(tags=["health"])


@router.get("/health")
@router.head("/health")
def health_check():
    """Basic health check endpoint returning service status and version."""
    return {
        "status": "ok",
        "version": settings.API_VERSION,
        "timestamp": datetime.now().isoformat(),
    }
