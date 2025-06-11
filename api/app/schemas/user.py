from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None


class UserCreate(UserBase):
    user_id: str  # supabase user id
    avatar_url: Optional[str] = None
    role: Optional[str] = "user"


class UserResponse(UserBase):
    id: str
    fullname: Optional[str]

    class Config:
        from_attributes = True


class UserAuth(BaseModel):
    access_token: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
