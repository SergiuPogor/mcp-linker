from fastapi import APIRouter

from .member import router as team_member_router
from .team_config_routes import router as team_config_router
from .team_routes import router as team_router

router = APIRouter()
router.include_router(team_router, prefix="/teams", tags=["Teams"])
router.include_router(team_member_router, prefix="/teams", tags=["Team Members"])
router.include_router(team_config_router, prefix="/teams", tags=["Team Configurations"])
