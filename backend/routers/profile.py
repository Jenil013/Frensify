from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from dependencies import get_profile
from models.profile import (
    UserProfile,
    ProfileUpdate,
    ProfilePictureUploadRequest,
    ProfilePictureUploadUrlResponse,
)
from services.streak_service import get_display_streak
from services.profile_picture_service import (
    assert_profile_picture_owned,
    create_upload_url,
    delete_profile_picture,
    enrich_profile,
)

router = APIRouter(tags=["profile"])


def _build_profile_response(db, profile: dict) -> dict:
    streak = get_display_streak(db, profile)
    return enrich_profile({**profile, "streak_days": streak})


@router.get("/profile", response_model=UserProfile)
async def read_profile(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    return _build_profile_response(db, profile)


@router.patch("/profile", response_model=UserProfile)
async def update_profile(
    update: ProfileUpdate,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    patch_data = update.model_dump(exclude_none=True)
    if "profile_picture" in update.model_fields_set:
        new_path = update.profile_picture
        if new_path is not None:
            assert_profile_picture_owned(profile["id"], new_path)
        elif profile.get("profile_picture"):
            delete_profile_picture(profile["profile_picture"])
        patch_data["profile_picture"] = new_path

    if not patch_data:
        return _build_profile_response(db, profile)

    result = (
        db.table("profiles")
        .update(patch_data)
        .eq("id", profile["id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")
    updated = result.data[0]
    return _build_profile_response(db, updated)


@router.post("/profile/picture/upload-url", response_model=ProfilePictureUploadUrlResponse)
async def profile_picture_upload_url(
    body: ProfilePictureUploadRequest,
    profile: dict = Depends(get_profile),
):
    upload_url, storage_path = create_upload_url(profile["id"], body.content_type)
    return ProfilePictureUploadUrlResponse(
        upload_url=upload_url,
        storage_path=storage_path,
    )
