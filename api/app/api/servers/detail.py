from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi_cache.decorator import cache

from app.core.prisma_config import get_prisma
from app.crud.server import server_optimized
from app.schemas import ServerDetail

router = APIRouter()


@cache(expire=3600)
@router.get("/@{qualified_name:path}", response_model=ServerDetail)
async def get_server_with_qualified_name(
    qualified_name: str,
    background_tasks: BackgroundTasks,
    client=Depends(get_prisma),
):
    print("qualified_name", qualified_name)
    db_server = await client.server.find_first(
        where={"qualified_name": qualified_name}, include={"server_configs": True}
    )

    if not db_server:
        raise HTTPException(status_code=404, detail="Server not found")

    background_tasks.add_task(server_optimized.increment_view_count, db_server.id)
    return ServerDetail.model_validate(db_server)


@cache(expire=3600)
@router.get("/{server_id}", response_model=ServerDetail)
async def get_server(
    server_id: UUID, background_tasks: BackgroundTasks, client=Depends(get_prisma)
):
    print("server id", server_id)
    db_server = await client.server.find_unique(
        where={"id": str(server_id)}, include={"server_configs": True}
    )

    if not db_server:
        raise HTTPException(status_code=404, detail="Server not found")

    background_tasks.add_task(server_optimized.increment_view_count, server_id)
    return ServerDetail.model_validate(db_server)
