from typing import List

from prisma.models import Server

from app.core.prisma_config import get_prisma

from .base import ServerCRUDBase


class ServerCategoryOperations(ServerCRUDBase):
    """Server category-specific operations"""

    async def get_servers_by_category_optimized(
        self, cat: str, limit: int = 20, include_relations: bool = True
    ) -> List[Server]:
        """Optimized category query"""
        client = await get_prisma()
        include_clause = self._build_include_relations(include_relations)

        return await client.server.find_many(
            where={"cat": cat},
            include=include_clause,
            order=[{"github_stars": "desc"}, {"created_at": "desc"}],
            take=limit,
        )
