from typing import Dict

from prisma.models import Server

from app.core.prisma_utils import PrismaCRUD
from app.schemas import ServerCreate


class ServerCRUDBase(PrismaCRUD[Server, ServerCreate, ServerCreate]):
    """Base server CRUD class with common utilities"""

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

    def _add_favorites_to_include(self, include_clause: Dict, user_id: str) -> Dict:
        """Add favorites check to include clause"""
        if user_id:
            include_clause["favorited_by"] = {"where": {"user_id": user_id}}
        return include_clause

    def _process_server_results(self, results):
        """Process server results to add is_favorited field"""
        for result in results:
            if hasattr(result, "model_dump"):
                result_dict = result.model_dump()
                result_dict["is_favorited"] = bool(result_dict.get("favorited_by", []))
        return results
