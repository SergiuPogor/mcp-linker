from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from prisma.models import User

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas import ServerCreate, ServerResponse

from .common import create_server_configs, verify_category_exists

router = APIRouter()


@router.put("/{server_id}", response_model=ServerResponse)
async def update_server(
    server_id: UUID,
    server: ServerCreate,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    await verify_category_exists(server.category_id, prisma=client)

    db_server = await client.server.find_unique(where={"id": str(server_id)})
    if not db_server:
        raise HTTPException(status_code=404, detail="Server not found")

    server_data = server.model_dump(exclude={"configs"})

    # Update server
    db_server = await client.server.update(
        where={"id": str(server_id)}, data=server_data
    )

    if hasattr(server, "configs") and server.configs:
        # Delete existing configs
        await client.serverconfig.delete_many(where={"server_id": str(server_id)})
        # Create new configs
        await create_server_configs(db_server.id, server.configs, prisma=client)

    # Fetch updated data with relations
    db_server = await client.server.find_unique(
        where={"id": str(server_id)}, include={"server_configs": True}
    )

    return ServerResponse.model_validate(db_server)


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_server(
    server_id: UUID,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    db_server = await client.server.find_unique(where={"id": str(server_id)})

    if not db_server:
        raise HTTPException(status_code=404, detail="Server not found")

    if db_server.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this server"
        )

    # Delete server configs first due to foreign key constraint
    await client.serverconfig.delete_many(where={"server_id": str(server_id)})
    # Delete the server
    await client.server.delete(where={"id": str(server_id)})
