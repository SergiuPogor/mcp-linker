from typing import Dict, List, Literal

from pydantic import BaseModel, Field

from .common import CamelModel


class BaseTypedConfig(CamelModel):
    class Config:
        extra = "allow"
        from_attributes = True


class StdioConfig(BaseTypedConfig):
    command: str
    args: List[str] = Field(default_factory=list)
    env: Dict[str, str] = Field(default_factory=dict)


class SSEConfig(BaseTypedConfig):
    type: Literal["sse", "http"]
    url: str


class McpConfigsResponse(BaseModel):
    server_configs: list
