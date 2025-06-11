import asyncio
import logging
from dataclasses import dataclass
from typing import Dict, List, Optional

from prisma.models import Server

from app.core.prisma_config import get_prisma
from app.core.prisma_utils import PrismaCRUD
from app.schemas import ServerCreate

logger = logging.getLogger(__name__)


@dataclass
class PaginationResult:
    """Pagination result data class"""

    items: List[Server]
    has_next: bool
    has_prev: bool
    page: int
    page_size: int
    total: Optional[int] = None


class ServerCRUDUltraOptimized(PrismaCRUD[Server, ServerCreate, ServerCreate]):
    """Ultra optimized server CRUD class"""

    def __init__(self):
        super().__init__("server")
        # Pre-compile common sort field mappings
        self._sort_fields = {
            "id": "id",
            "created_at": "created_at",
            "github_stars": "github_stars",
            "views": "views",
            "downloads": "downloads",
            "name": "name",
        }

    def _build_order_clause(self, order_by: str, order_direction: str) -> Dict:
        """Build order clause, optimized version"""
        field = self._sort_fields.get(order_by, "github_stars")
        direction = "desc" if order_direction == "desc" else "asc"

        return {field: direction}

    def _build_include_relations(self, include_relations: bool = True) -> Dict:
        """Build include clause for relations"""
        if not include_relations:
            return {}

        return {"user": True}

    async def get_servers_optimized(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        cat: Optional[str] = None,
        search: Optional[str] = None,
        developer: Optional[str] = None,
        order_by: str = "github_stars",
        order_direction: str = "desc",
        include_relations: bool = True,
        need_total: bool = False,
        user_id: Optional[str] = None,
    ) -> PaginationResult:
        """Optimized pagination query"""
        page = max(1, page)
        page_size = min(page_size, 100)

        # Search mode uses different processing logic
        if search:
            return await self._search_servers_paginated(
                search=search,
                page=page,
                page_size=page_size,
                include_relations=include_relations,
                user_id=user_id,
            )

        # Normal pagination query
        offset = (page - 1) * page_size
        client = await get_prisma()

        # Build where clause
        where_clause = {}
        if cat:
            where_clause["cat"] = cat
        if developer:
            where_clause["developer"] = developer

        # Build include clause
        include_clause = self._build_include_relations(include_relations)

        # Add favorites check if user_id provided
        if user_id and include_relations:
            include_clause["favorited_by"] = {"where": {"user_id": user_id}}

        # Build order clause - Prisma syntax
        order_field = self._sort_fields.get(order_by, "github_stars")
        order_clause = {order_field: order_direction.lower()}

        # Parallel execution of count and data queries
        tasks = []

        # Data query task
        data_query = client.server.find_many(
            where=where_clause,
            include=include_clause,
            order=order_clause,
            skip=offset,
            take=page_size + 1,
        )
        tasks.append(data_query)

        # Count task (only when needed)
        if need_total:
            count_query = client.server.count(where=where_clause)
            tasks.append(count_query)

        try:
            # Parallel execution
            if need_total:
                results, total_count = await asyncio.gather(*tasks)
            else:
                results = await tasks[0]
                total_count = None

            # Convert servers to response models with is_favorited
            for result in results:
                result_dict = result.model_dump()
                result_dict["is_favorited"] = bool(result_dict.get("favorited_by", []))

            # Check if has next page
            has_next = len(results) > page_size
            if has_next:
                results = results[:page_size]

            return PaginationResult(
                items=results,
                has_next=has_next,
                has_prev=page > 1,
                page=page,
                page_size=page_size,
                total=total_count,
            )
        except Exception as e:
            logger.error(f"Failed to fetch servers: {e}")
            raise

    async def _search_servers_paginated(
        self,
        search: str,
        page: int,
        page_size: int,
        include_relations: bool = True,
        user_id: Optional[str] = None,
    ) -> PaginationResult:
        """Optimized search pagination"""
        search_lower = search.lower().strip()
        if not search_lower:
            return PaginationResult(
                items=[], has_next=False, has_prev=False, page=page, page_size=page_size
            )

        offset = (page - 1) * page_size
        client = await get_prisma()

        # Build search conditions using Prisma's OR syntax
        search_conditions = {
            "OR": [
                {"name": {"contains": search_lower, "mode": "insensitive"}},
                {"description": {"contains": search_lower, "mode": "insensitive"}},
                {"developer": {"contains": search_lower, "mode": "insensitive"}},
            ]
        }

        # Build include clause
        include_clause = self._build_include_relations(include_relations)

        # Add favorites check if user_id provided
        if user_id and include_relations:
            include_clause["favorited_by"] = {"where": {"user_id": user_id}}

        try:
            # For search, prioritize by github_stars and views
            results = await client.server.find_many(
                where=search_conditions,
                include=include_clause,
                order=[
                    {"github_stars": "desc"},
                    {"views": "desc"},
                    {"created_at": "desc"},
                ],
                skip=offset,
                take=page_size + 1,
            )
        except Exception as e:
            logger.warning(f"Search query failed: {e}")
            # Fallback to simple search
            results = await client.server.find_many(
                where=search_conditions,
                include=include_clause,
                order={"github_stars": "desc"},
                skip=offset,
                take=page_size + 1,
            )

        # Convert servers to response models with is_favorited
        for result in results:
            result_dict = result.model_dump()
            result_dict["is_favorited"] = bool(result_dict.get("favorited_by", []))

        has_next = len(results) > page_size
        if has_next:
            results = results[:page_size]

        return PaginationResult(
            items=results,
            has_next=has_next,
            has_prev=page > 1,
            page=page,
            page_size=page_size,
        )

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

    async def get_recommended_servers(
        self, server_names: List[str], user_id: Optional[str] = None
    ) -> List[Server]:
        """Get specific servers by names for recommendations"""
        client = await get_prisma()

        # Build include clause for relations
        include_clause = self._build_include_relations(True)

        # Add favorites check if user_id provided
        if user_id:
            include_clause["favorited_by"] = {"where": {"user_id": user_id}}

        # Query servers by name (case insensitive)
        servers = await client.server.find_many(
            where={
                "OR": [
                    {"name": {"contains": name, "mode": "insensitive"}}
                    for name in server_names
                ]
            },
            include=include_clause,
            order={"github_stars": "desc"},
        )

        # Convert servers to response models with is_favorited
        for server in servers:
            server_dict = server.model_dump()
            server_dict["is_favorited"] = bool(server_dict.get("favorited_by", []))

        return servers


# Global instance
server_optimized = ServerCRUDUltraOptimized()
