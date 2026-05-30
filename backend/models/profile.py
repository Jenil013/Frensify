from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    id: str
    name: Optional[str] = None
    target_exam: Optional[str] = None
    target_score: Optional[str] = None
    current_level: Optional[str] = None
    streak_days: int
    last_active_date: Optional[str] = None
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
