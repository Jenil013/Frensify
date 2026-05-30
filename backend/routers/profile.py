from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from dependencies import get_profile
from models.profile import UserProfile, ProfileUpdate

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=UserProfile)
async def read_profile(profile: dict = Depends(get_profile)):
    return profile


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
        .select("*")
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return result.data[0]
