from typing import List, Optional

from app.core.prisma_config import get_prisma
from app.core.prisma_utils import PrismaCRUD


class ServerConfigCRUD(PrismaCRUD):
    """Optimized CRUD for ServerConfig model"""

    def __init__(self):
        super().__init__("ServerConfig")

    async def get_config_by_server_id(self, server_id: str) -> Optional[dict]:
        """Get config by server ID"""
        client = await get_prisma()
        return await client.serverconfig.find_first(where={"server_id": server_id})

    async def get_configs_by_server_ids(self, server_ids: List[str]) -> List[dict]:
        """Batch get configs for multiple servers - prevents N+1 queries"""
        client = await get_prisma()
        return await client.serverconfig.find_many(
            where={"server_id": {"in": server_ids}}
        )

    async def get_config_values_only(self, server_id: str) -> Optional[dict]:
        """Get only config_items field for better performance"""
        client = await get_prisma()
        result = await client.serverconfig.find_first(
            where={"server_id": server_id}, select={"config_items": True}
        )
        return result.config_items if result else None


server_config = ServerConfigCRUD()
