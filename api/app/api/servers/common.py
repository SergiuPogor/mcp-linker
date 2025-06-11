from fastapi import Depends, HTTPException

from app.core.prisma_config import get_prisma


async def verify_category_exists(category_id: int, prisma=Depends(get_prisma)):
    if not await prisma.category.find_unique(where={"id": category_id}):
        raise HTTPException(status_code=404, detail="Category not found")


async def create_server_configs(
    server_id: str, configs: list, prisma=Depends(get_prisma)
):
    for config in configs:
        config_data = (
            config.model_dump() if hasattr(config, "model_dump") else dict(config)
        )
        await prisma.serverconfig.create(
            data={
                "server_id": server_id,
                "config_items": config_data,
            }
        )
