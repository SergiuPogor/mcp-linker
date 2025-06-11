from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter
from prisma.models import User  # Import Team and User models

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas.team import TeamCreateRequest, TeamListResponse, TeamResponse

router = APIRouter()


# Get all teams owned by the current user
@cache(expire=900)  # 15 minutes cache
@router.get(
    "/my_teams",
    response_model=TeamListResponse,
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def get_my_teams(
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamListResponse:
    """Get current user's owned teams"""
    print(f"Fetching teams for user: {current_user.id}")

    # Query teams where the current user is the owner
    result = await client.team.find_many(
        where={"owner_id": current_user.id},
    )

    # Convert Prisma Team models to TeamResponse models
    team_responses = [TeamResponse.from_orm(team) for team in result]

    return TeamListResponse(
        page=1,
        page_size=len(result),
        has_next=False,
        has_prev=False,
        teams=team_responses,
    )


# Get a specific team by ID (accessible by owner or member)
@cache(expire=900)  # 15 minutes cache
@router.get(
    "/{team_id}",
    response_model=TeamResponse,
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def get_team_by_id(
    team_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamResponse:
    """Get a specific team by ID. Accessible by team owner or member."""
    # Check if the current user is the owner or a member of the team
    team = await client.team.find_first(
        where={
            "id": team_id,
            "OR": [
                {"owner_id": current_user.id},
                {"members": {"some": {"user_id": current_user.id}}},
            ],
        },
    )

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found or you don't have access",
        )

    # Convert Prisma Team model to TeamResponse model
    return TeamResponse.from_orm(team)


# Create a new team
@router.post(
    "/",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))],
)
async def create_team(
    body: TeamCreateRequest,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamResponse:
    """Create a new team. The current user will be set as the owner."""
    try:
        new_team = await client.team.create(
            data={
                "name": body.name,
                "description": body.description,
                "owner_id": current_user.id,
                "members": {
                    "create": [
                        {
                            "user_id": current_user.id,
                            "role": "OWNER",  # Set the creator as owner
                        },
                    ]
                },
            }
        )
        # Convert Prisma Team model to TeamResponse model
        return TeamResponse.from_orm(new_team)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating team: {e}",
        )


# Update an existing team
@router.put(
    "/{team_id}",
    response_model=TeamResponse,
    dependencies=[Depends(RateLimiter(times=10, seconds=60))],
)
async def update_team(
    team_id: str,
    name: Optional[str] = Query(None, description="New name for the team"),
    description: Optional[str] = Query(
        None, description="New description for the team"
    ),
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamResponse:
    """Update an existing team. Only the team owner can update."""
    # Verify that the current user is the owner of the team
    existing_team = await client.team.find_first(
        where={
            "id": team_id,
            "owner_id": current_user.id,
        }
    )
    if not existing_team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this team or team not found",
        )

    update_data = {}
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided"
        )

    try:
        updated_team = await client.team.update(where={"id": team_id}, data=update_data)
        return updated_team
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating team: {e}",
        )


@router.delete(
    "/{team_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))],
)
async def delete_team(
    team_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Delete a team. Only the team owner can delete."""
    # Verify that the current user is the owner of the team
    existing_team = await client.team.find_first(
        where={
            "id": team_id,
            "owner_id": current_user.id,
        }
    )
    if not existing_team:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the owner of this team or team not found",
        )

    try:
        await client.team.delete(where={"id": team_id})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting team: {e}",
        )
