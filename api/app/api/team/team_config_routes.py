from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_cache.decorator import cache
from fastapi_limiter.depends import RateLimiter
from prisma.models import User

from app.core.auth import get_current_user
from app.core.prisma_config import get_prisma
from app.schemas.team import (  # Import TeamConfigResponse schema
    TeamConfigCreateRequest,
    TeamConfigResponse,
    TeamConfigUpdateRequest,
)

router = APIRouter()


@cache(expire=900)  # 15 minutes cache
@router.get(
    "/{team_id}/configs",
    response_model=list[TeamConfigResponse],
    dependencies=[Depends(RateLimiter(times=20, seconds=60))],
)
async def get_team_configs(
    team_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> list[TeamConfigResponse]:
    """Get configurations for a specific team, accessible by team members"""
    # First, check if the current user is a member of the team
    team_membership = await client.teammember.find_first(
        where={
            "team_id": team_id,
            "user_id": current_user.id,
        }
    )

    if not team_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this team or team does not exist",
        )

    # Fetch all configurations for the team
    configs = await client.teamconfig.find_many(
        where={
            "team_id": team_id,
        }
    )
    return configs


@router.post(
    "/{team_id}/configs",
    response_model=TeamConfigResponse,
    dependencies=[Depends(RateLimiter(times=10, seconds=60))],
)
async def create_team_config(
    team_id: str,
    config_data: TeamConfigCreateRequest,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamConfigResponse:
    """Create a new configuration for a team"""
    # Check if the user is an admin or owner of the team to create configs
    team_membership = await client.teammember.find_first(
        where={
            "team_id": team_id,
            "user_id": current_user.id,
            "OR": [
                {"role": "ADMIN"},
                {"role": "OWNER"},
            ],
        }
    )

    if not team_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners or admins can create configurations",
        )

    try:
        new_config = await client.teamconfig.create(
            data={
                "team_id": team_id,
                "name": config_data.config_name,
                "description": config_data.config_description,
                "config_data": config_data.config_data,
                "created_by": current_user.id,
            }
        )
        return new_config
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating config: {e}",
        )


@router.put(
    "/{team_id}/configs/{config_id}",
    response_model=TeamConfigResponse,
    dependencies=[Depends(RateLimiter(times=10, seconds=60))],
)
async def update_team_config(
    team_id: str,
    config_id: str,
    update_data_request: TeamConfigUpdateRequest,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
) -> TeamConfigResponse:
    """Update an existing team configuration"""
    # Check if the user is an admin or owner of the team to update configs
    team_membership = await client.teammember.find_first(
        where={
            "team_id": team_id,
            "user_id": current_user.id,
            "OR": [
                {"role": "ADMIN"},
                {"role": "OWNER"},
            ],
        }
    )

    if not team_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners or admins can update configurations",
        )

    # Prepare data for update, only include fields that are provided
    update_data = {}
    if update_data_request.config_name is not None:
        update_data["name"] = update_data_request.config_name
    if update_data_request.config_description is not None:
        update_data["description"] = update_data_request.config_description
    if update_data_request.config_data is not None:
        update_data["config_data"] = update_data_request.config_data

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided"
        )

    try:
        updated_config = await client.teamconfig.update(
            where={
                "id": config_id,
                "team_id": team_id,  # Ensure the config belongs to the specified team
            },
            data=update_data,
        )
        if not updated_config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found or does not belong to this team",
            )
        return updated_config
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating config: {e}",
        )


@router.delete(
    "/{team_id}/configs/{config_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(RateLimiter(times=5, seconds=60))],
)
async def delete_team_config(
    team_id: str,
    config_id: str,
    current_user: User = Depends(get_current_user),
    client=Depends(get_prisma),
):
    """Delete a team configuration"""
    # Check if the user is an admin or owner of the team to delete configs
    team_membership = await client.teammember.find_first(
        where={
            "team_id": team_id,
            "user_id": current_user.id,
            "OR": [
                {"role": "ADMIN"},
                {"role": "OWNER"},
            ],
        }
    )

    if not team_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owners or admins can delete configurations",
        )

    try:
        # Verify that the config belongs to the specified team before deleting
        config_to_delete = await client.teamconfig.find_first(
            where={"id": config_id, "team_id": team_id}
        )
        if not config_to_delete:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found or does not belong to this team",
            )

        await client.teamconfig.delete(where={"id": config_id})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting config: {e}",
        )
