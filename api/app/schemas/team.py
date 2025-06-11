from datetime import datetime
from enum import Enum
from typing import List, Optional

from prisma.models import Team, TeamConfig, TeamMember
from pydantic import BaseModel

from .common import CamelModel
from .user import UserResponse  # Import UserResponse schema


class TeamCreateRequest(CamelModel):
    name: str
    description: Optional[str] = None


class TeamRoleEnum(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


# Basic Team schema for responses
class TeamResponse(CamelModel):
    id: str
    name: str
    description: Optional[str]
    owner_id: str
    created_at: datetime  # Datetime will be stringified
    updated_at: datetime  # Datetime will be stringified

    class Config:
        arbitrary_types_allowed = True  # Allow Prisma models to be used if needed


# Schema for listing multiple teams
class TeamListResponse(CamelModel):
    teams: List[TeamResponse]  # Renamed from 'servers' to 'teams'
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            Team: lambda t: TeamResponse.model_validate(t),  # Encoder for Team model
        }


# Schema for TeamMember (basic)
class TeamMemberResponse(CamelModel):
    id: str
    team_id: str
    user_id: str
    role: TeamRoleEnum
    invited_by: Optional[str]
    joined_at: datetime
    user: UserResponse  # Add the related user information

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            TeamMember: lambda tm: TeamMemberResponse.from_orm(tm).dict(),
        }


# Schema for TeamConfig (basic)
class TeamConfigResponse(BaseModel):
    id: str
    team_id: str
    name: str
    description: Optional[str]
    config_data: dict  # JSON field
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            TeamConfig: lambda tc: TeamConfigResponse.from_orm(tc).dict(),
        }


# Schema for creating a new TeamConfig
class TeamConfigCreateRequest(BaseModel):
    config_name: str
    config_description: Optional[str] = None
    config_data: dict


# Schema for updating an existing TeamConfig
class TeamConfigUpdateRequest(BaseModel):
    config_name: Optional[str] = None
    config_description: Optional[str] = None
    config_data: Optional[dict] = None
