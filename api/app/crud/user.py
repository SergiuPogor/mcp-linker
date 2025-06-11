from typing import Optional

from app.core.prisma_config import get_prisma
from app.core.prisma_utils import PrismaCRUD


class UserCRUD(PrismaCRUD):
    """CRUD for User model"""

    def __init__(self):
        super().__init__("User")

    async def get_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        client = await get_prisma()
        return await client.user.find_first(where={"email": email})

    async def get_or_create(self, user_id: str, user_data: dict) -> dict:
        """Get or create user"""
        client = await get_prisma()
        user = await client.user.find_unique(where={"id": user_id})
        if not user:
            user = await client.user.create(
                data={
                    "id": user_id,
                    "email": user_data.get("email"),
                    "fullname": user_data.get("full_name"),
                    "username": user_data.get("user_name")
                    or user_data.get("email", "").split("@")[0],
                    "avatar_url": user_data.get("avatar_url", ""),
                    "role": "user",
                }
            )
        return user


user = UserCRUD()
