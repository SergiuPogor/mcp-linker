import json

from fastapi import APIRouter, Body, Depends, HTTPException, status
from prisma.models import User

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas import ServerCreate, ServerResponse
from data import cats_en

router = APIRouter()


async def verify_category_exists(cat: str, prisma=Depends(get_prisma)):
    if cat not in cats_en:
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
                "config_items": json.dumps(config_data),
            }
        )


@router.post("/", response_model=ServerResponse, status_code=status.HTTP_201_CREATED)
async def create_server(
    server: ServerCreate = Body(...),
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    print("Received server data:", server)

    print(current_user)

    if current_user and not server.developer:
        server.developer = current_user.fullname

    await verify_category_exists(server.cat, prisma=client)
    server.qualified_name = f"{server.developer}/{server.name}"

    # Exclude configs, id, and cat from the main data
    server_data = server.model_dump(exclude={"configs", "id", "cat"})

    create_data = {**server_data, "cat": server.cat}

    if current_user:
        create_data["user"] = {"connect": {"id": current_user.id}}

    try:
        # Create the server with the category and user connections
        db_server = await client.server.create(data=create_data)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    if hasattr(server, "configs") and server.configs:
        config_data = [config.model_dump() for config in server.configs]
        await create_server_configs(db_server.id, config_data, prisma=client)

    # Fetch related data
    db_server = await client.server.find_unique(
        where={"id": db_server.id}, include={"server_configs": True}
    )

    return ServerResponse.model_validate(db_server)
