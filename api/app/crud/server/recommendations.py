from typing import List, Optional

from prisma.models import Server

from app.core.prisma_config import get_prisma

from .base import ServerCRUDBase


class ServerRecommendationOperations(ServerCRUDBase):
    """Server recommendation operations"""

    async def get_recommended_servers(
        self, server_names: List[str], user_id: Optional[str] = None
    ) -> List[Server]:
        """Get specific servers by names for recommendations"""
        client = await get_prisma()

        # Build include clause for relations
        include_clause = self._build_include_relations(True)
        if user_id:
            include_clause = self._add_favorites_to_include(include_clause, user_id)

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

        # Process results
        return self._process_server_results(servers)
