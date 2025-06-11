import asyncio
import logging
from typing import Optional

from app.core.prisma_config import get_prisma

from .base import ServerCRUDBase
from .models import PaginationResult

logger = logging.getLogger(__name__)


class ServerOperations(ServerCRUDBase):
    """Server operations including pagination, search, and recommendations"""

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
        if user_id and include_relations:
            include_clause = self._add_favorites_to_include(include_clause, user_id)

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

            # Process results
            results = self._process_server_results(results)

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
        if user_id and include_relations:
            include_clause = self._add_favorites_to_include(include_clause, user_id)

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

        # Process results
        results = self._process_server_results(results)

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
