from fastapi import HTTPException, status
from prisma.enums import TeamRole
from prisma.models import TeamMember, User

from prisma import Prisma


class TeamService:
    def __init__(self, client: Prisma):
        self.client = client

    async def get_team_members(
        self, team_id: str, current_user: User
    ) -> list[TeamMember]:
        """
        Get members of a specific team, accessible by team members.
        """
        team_membership = await self.client.teammember.find_first(
            where={
                "team_id": team_id,
                "user_id": current_user.id,
            }
        )

        if not team_membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this team",
            )

        members = await self.client.teammember.find_many(
            where={
                "team_id": team_id,
            },
            include={"user": True},
        )
        return members

    async def get_my_team_memberships(self, current_user: User) -> list[TeamMember]:
        """
        Get all teams the current user is a member of.
        """
        memberships = await self.client.teammember.find_many(
            where={
                "user_id": current_user.id,
            },
            include={"user": True},
        )
        return memberships

    async def add_team_member(
        self, team_id: str, user_id_to_add: str, role: TeamRole, current_user: User
    ) -> TeamMember:
        """
        Add a new member to a team. Only team owners or admins can add members.
        """
        team_admin_or_owner = await self.client.teammember.find_first(
            where={
                "team_id": team_id,
                "user_id": current_user.id,
                "OR": [
                    {"role": TeamRole.ADMIN},
                    {"role": TeamRole.OWNER},
                ],
            }
        )

        if not team_admin_or_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team owners or admins can add members",
            )

        user_exists = await self.client.user.find_unique(where={"id": user_id_to_add})
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User to be added not found",
            )

        existing_member = await self.client.teammember.find_first(
            where={
                "team_id": team_id,
                "user_id": user_id_to_add,
            }
        )
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already a member of this team",
            )

        try:
            new_member = await self.client.teammember.create(
                data={
                    "team_id": team_id,
                    "user_id": user_id_to_add,
                    "role": role,
                    "invited_by": current_user.id,
                },
                include={"user": True},
            )
            return new_member
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error adding team member: {e}",
            )

    async def update_team_member_role(
        self, team_id: str, member_id: str, new_role: TeamRole, current_user: User
    ) -> TeamMember:
        """
        Update a team member's role. Only team owners or admins can update roles.
        """
        team_admin_or_owner = await self.client.teammember.find_first(
            where={
                "team_id": team_id,
                "user_id": current_user.id,
                "OR": [
                    {"role": TeamRole.ADMIN},
                    {"role": TeamRole.OWNER},
                ],
            }
        )

        if not team_admin_or_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team owners or admins can update member roles",
            )

        target_member = await self.client.teammember.find_first(
            where={
                "id": member_id,
                "team_id": team_id,
            }
        )
        if not target_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found in this team",
            )

        if target_member.role == TeamRole.OWNER and new_role != TeamRole.OWNER:
            owner_count = await self.client.teammember.count(
                where={"team_id": team_id, "role": TeamRole.OWNER}
            )
            if owner_count == 1 and target_member.id == team_admin_or_owner.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot demote the sole owner of the team.",
                )
            elif owner_count == 1 and target_member.id != team_admin_or_owner.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot demote the sole owner of the team.",
                )

        try:
            updated_member = await self.client.teammember.update(
                where={
                    "id": member_id,
                },
                data={
                    "role": new_role,
                },
                include={"user": True},
            )
            return updated_member
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating team member role: {e}",
            )

    async def remove_team_member(
        self, team_id: str, member_id: str, current_user: User
    ):
        """
        Remove a member from a team. Only team owners or admins can remove members.
        """
        team_admin_or_owner = await self.client.teammember.find_first(
            where={
                "team_id": team_id,
                "user_id": current_user.id,
                "OR": [
                    {"role": TeamRole.ADMIN},
                    {"role": TeamRole.OWNER},
                ],
            }
        )

        if not team_admin_or_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only team owners or admins can remove members",
            )

        target_member = await self.client.teammember.find_first(
            where={
                "id": member_id,
                "team_id": team_id,
            }
        )
        if not target_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Team member not found in this team",
            )

        if target_member.role == TeamRole.OWNER:
            owner_count = await self.client.teammember.count(
                where={"team_id": team_id, "role": TeamRole.OWNER}
            )
            if owner_count == 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove the sole owner of the team.",
                )

        try:
            await self.client.teammember.delete(
                where={
                    "id": member_id,
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error removing team member: {e}",
            )
