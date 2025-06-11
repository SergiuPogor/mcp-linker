from datetime import datetime
from typing import Any, List, Optional, Union
from uuid import UUID

from pydantic import field_validator

from .common import CamelModel
from .mcp_config import SSEConfig, StdioConfig


class ServerBase(CamelModel):
    name: str
    description: str
    source: str
    tags: list[str] | None = None


class ServerCreate(ServerBase):
    cat: str
    qualified_name: Optional[str] = None
    developer: Optional[str] = None
    configs: List[Any]  # Allow flexible config structure


class ServerResponse(CamelModel):
    id: UUID
    name: Optional[str] = ""
    qualified_name: Optional[str] = ""
    description: Optional[str] = ""
    source: str
    developer: str
    is_official: bool
    rating: float
    github_stars: int
    downloads: int
    views: int
    is_favorited: bool = False
    tags: Optional[list[str]] = None
    tools: Optional[list[str]] = None
    cat: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ServerListResponse(CamelModel):
    version: str
    servers: List[ServerResponse]  # type: ignore
    page: int
    page_size: int
    has_next: bool
    total: Optional[int] = None  # 需要时可计算总数


class ServerListResponseOptimized(CamelModel):
    """优化的响应模型"""

    version: str = "2025-05-22-ultra"
    page: int
    page_size: int
    has_next: bool
    has_prev: bool = False
    total: Optional[int] = None
    servers: List[ServerResponse]
    cache_hit: bool = False


class ServerConfig(CamelModel):
    """Schema matching the database ServerConfig model"""

    id: UUID
    config_items: Any  # JSON field containing the actual config data
    server_id: UUID

    @field_validator("config_items", mode="before")
    @classmethod
    def validate_config_items(cls, v):
        """Ensure config_items is properly formatted"""
        return v

    def get_typed_config(self) -> Union[StdioConfig, SSEConfig]:
        """Extract typed config from config_items"""
        if not self.config_items:
            raise ValueError("No config_items available")

        # Try to determine config type and validate accordingly
        if isinstance(self.config_items, dict):
            if "command" in self.config_items:
                return StdioConfig(**self.config_items)
            elif "url" in self.config_items and "type" in self.config_items:
                return SSEConfig(**self.config_items)

        raise ValueError(f"Unable to determine config type from: {self.config_items}")


class ServerDetail(ServerResponse):
    server_configs: List[ServerConfig]
