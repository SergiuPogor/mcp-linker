from typing import Dict
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi_limiter.depends import RateLimiter

from app.core.prisma_config import get_prisma
from app.crud.server import server_optimized

router = APIRouter(
    prefix="/servers",
    tags=["servers metrics"],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)


@router.post("/{server_id}/views")
@router.post("/{server_id}/view-count")
async def increment_server_view(
    server_id: UUID,
    background_tasks: BackgroundTasks,
) -> Dict[str, str]:
    """增加服务器查看次数 - 异步处理"""

    # 后台任务处理，不阻塞响应
    background_tasks.add_task(server_optimized.increment_view_count, server_id)

    return {"status": "queued"}


@router.post("/{server_id}/downloads")
@router.post("/{server_id}/download-count")
async def increment_server_download(
    server_id: UUID,
    background_tasks: BackgroundTasks,
) -> Dict[str, str]:
    """增加服务器下载次数 - 异步处理"""

    background_tasks.add_task(server_optimized.increment_download_count, server_id)

    return {"status": "queued"}


@router.get("/count", summary="get server total")
async def get_server_count(client=Depends(get_prisma)) -> Dict[str, int]:
    """get server total"""

    count = await client.server.count()
    return {"total": count}
