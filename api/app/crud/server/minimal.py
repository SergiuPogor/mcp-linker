from typing import Dict, Optional

from app.core.prisma_config import get_prisma

from .base import ServerCRUDBase


class ServerMinimalOperations(ServerCRUDBase):
    """Minimal server operations for high-performance queries"""

    async def get_servers_minimal(
        self,
        *,
        page: int = 1,
        page_size: int = 30,
        cat: Optional[str] = None,
        order_by: str = "github_stars",
        order_direction: str = "desc",
    ) -> Dict:
        """Ultra-fast API, returns only basic fields"""
        page = max(1, page)
        page_size = min(page_size, 100)
        offset = (page - 1) * page_size

        client = await get_prisma()

        # Build where clause
        where_clause = {}
        if cat:
            where_clause["cat"] = cat

        # Build order clause
        order_clause = self._build_order_clause(order_by, order_direction)

        # Query minimal fields directly
        results = await client.server.find_many(
            where=where_clause, order=order_clause, skip=offset, take=page_size + 1
        )

        has_next = len(results) > page_size
        if has_next:
            results = results[:page_size]

        return {
            "servers": results,
            "page": page,
            "page_size": page_size,
            "has_next": has_next,
            "has_prev": page > 1,
        }
