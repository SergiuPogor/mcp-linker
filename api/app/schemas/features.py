from typing import List
from uuid import UUID

from .common import CamelModel


class ServerItem(CamelModel):
    id: UUID
    name: str
    description: str
    icon_url: str
    banner_url: str | None = None
    category: str
    rating: float
    downloads: int
    views: int


class DiscoverResponse(CamelModel):
    hero_servers: List[ServerItem]
    recommended_servers: List[ServerItem]
    sections: dict[str, List[ServerItem]]  # e.g., {"Productivity": [...], "AI": [...]}
