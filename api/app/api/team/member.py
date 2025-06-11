from fastapi import APIRouter, Depends, Query, status
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter
from prisma.enums import TeamRole  # Import TeamRole enum
from prisma.models import User  # Import necessary models

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas.team import TeamMemberResponse  # Import TeamMemberResponse schema
from app.services.team_service import TeamService  # Import TeamService

router = APIRouter()


@cache(expire=900)  # 15 minutes cache
@router.get(
    "/{team_id}/members",
    response_model=list[TeamMemberResponse],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def get_team_members(
    team_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> list[TeamMemberResponse]:
    """Get members of a specific team, accessible by team members"""
    team_service = TeamService(client)  # Initialize TeamService
    return await team_service.get_team_members(team_id, current_user)


@cache(expire=900)  # 15 minutes cache
@router.get(
    "/my_memberships",
    response_model=list[TeamMemberResponse],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def get_my_team_memberships(
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> list[TeamMemberResponse]:
    """Get all teams the current user is a member of"""
    team_service = TeamService(client)  # Initialize TeamService
    return await team_service.get_my_team_memberships(current_user)


@router.post(
    "/{team_id}/members",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))],
)
async def add_team_member(
    team_id: str,
    user_id_to_add: str = Query(..., description="ID of the user to add to the team"),
    role: TeamRole = Query(TeamRole.MEMBER, description="Role of the new member"),
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamMemberResponse:
    """Add a new member to a team. Only team owners or admins can add members."""
    team_service = TeamService(client)  # Initialize TeamService
    return await team_service.add_team_member(
        team_id, user_id_to_add, role, current_user
    )


@router.put(
    "/{team_id}/members/{member_id}",
    response_model=TeamMemberResponse,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))],
)
async def update_team_member_role(
    team_id: str,
    member_id: str,
    new_role: TeamRole = Query(..., description="New role for the team member"),
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamMemberResponse:
    """Update a team member's role. Only team owners or admins can update roles."""
    team_service = TeamService(client)  # Initialize TeamService
    return await team_service.update_team_member_role(
        team_id, member_id, new_role, current_user
    )


@router.delete(
    "/{team_id}/members/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))],
)
async def remove_team_member(
    team_id: str,
    member_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Remove a member from a team. Only team owners or admins can remove members."""
    team_service = TeamService(client)  # Initialize TeamService
    await team_service.remove_team_member(team_id, member_id, current_user)
