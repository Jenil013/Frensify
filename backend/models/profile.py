from pydantic import BaseModel
from typing import Literal, Optional


class UserProfile(BaseModel):
    id: str
    name: Optional[str] = None
    target_exam: Optional[str] = None
    target_score: Optional[str] = None
    current_level: Optional[str] = None
    streak_days: int
    last_active_date: Optional[str] = None
    exam_date: Optional[str] = None
    profile_picture: Optional[str] = None
    profile_picture_url: Optional[str] = None
    tier: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
    created_at: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    target_exam: Optional[str] = None
    target_score: Optional[str] = None
    current_level: Optional[str] = None
    last_active_date: Optional[str] = None
    exam_date: Optional[str] = None
    profile_picture: Optional[str] = None


class ProfilePictureUploadRequest(BaseModel):
    content_type: Literal["image/jpeg", "image/png", "image/webp"]


class ProfilePictureUploadUrlResponse(BaseModel):
    upload_url: str
    storage_path: str
