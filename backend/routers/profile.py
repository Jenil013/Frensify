from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from dependencies import get_profile
from models.profile import UserProfile, ProfileUpdate
from services.streak_service import get_display_streak

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=UserProfile)
async def read_profile(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    return {**profile, "streak_days": get_display_streak(db, profile)}


@router.patch("/profile", response_model=UserProfile)
async def update_profile(
    update: ProfileUpdate,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    patch_data = update.model_dump(exclude_none=True)
    result = (
        db.table("profiles")
        .update(patch_data)
        .eq("id", profile["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")
    updated = result.data[0]
    return {**updated, "streak_days": get_display_streak(db, updated)}
