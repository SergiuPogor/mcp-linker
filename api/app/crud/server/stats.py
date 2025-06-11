import logging
from typing import List

from app.core.prisma_config import get_prisma

from .base import ServerCRUDBase

logger = logging.getLogger(__name__)


class ServerStats(ServerCRUDBase):
    """Server statistics operations"""

    async def bulk_increment_counts(
        self, server_ids: List[str], count_type: str = "views"
    ) -> None:
        """Batch update counts, improve concurrency performance"""
        if not server_ids:
            return

        if count_type not in ["views", "downloads"]:
            raise ValueError("count_type must be 'views' or 'downloads'")

        client = await get_prisma()

        # Batch atomic update using Prisma's update_many
        await client.server.update_many(
            where={"id": {"in": server_ids}}, data={count_type: {"increment": 1}}
        )

    async def increment_view_count(self, server_id: str) -> None:
        """Single view count update"""
        # Convert UUID to string if it's a UUID object
        server_id_str = str(server_id) if hasattr(server_id, "hex") else server_id
        await self.bulk_increment_counts([server_id_str], "views")

    async def increment_download_count(self, server_id: str) -> None:
        """Single download count update"""
        # Convert UUID to string if it's a UUID object
        server_id_str = str(server_id) if hasattr(server_id, "hex") else server_id
        await self.bulk_increment_counts([server_id_str], "downloads")
