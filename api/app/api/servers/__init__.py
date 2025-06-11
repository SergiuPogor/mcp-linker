from fastapi import APIRouter

from . import create, detail, list, my, recommendations, ud

router = APIRouter(prefix="/servers")

router.include_router(create.router, tags=["servers crud"])
router.include_router(my.router, tags=["servers crud"])
router.include_router(list.router, tags=["servers crud"])
router.include_router(detail.router, tags=["servers crud"])
router.include_router(ud.router, tags=["servers crud"])
router.include_router(recommendations.router, tags=["servers recommendations"])
