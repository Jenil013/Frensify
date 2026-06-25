import re

from fastapi import HTTPException

from config import settings

PROFILE_PICTURE_BUCKET = "profile-pictures"
ALLOWED_EXTENSIONS = frozenset({"jpg", "jpeg", "png", "webp"})
CONTENT_TYPE_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
SIGNED_URL_EXPIRES = 3600


def extension_from_content_type(content_type: str) -> str:
    ext = CONTENT_TYPE_TO_EXT.get(content_type)
    if not ext:
        raise HTTPException(status_code=422, detail="Unsupported image type.")
    return ext


def storage_path_for_user(profile_id: str, ext: str) -> str:
    return f"{profile_id}/avatar.{ext}"


def assert_profile_picture_owned(profile_id: str, path: str) -> None:
    if not path:
        return
    allowed = "|".join(re.escape(ext) for ext in ALLOWED_EXTENSIONS)
    pattern = rf"^{re.escape(profile_id)}/avatar\.({allowed})$"
    if not re.fullmatch(pattern, path):
        raise HTTPException(status_code=403, detail="Invalid profile picture path.")


def _storage_client():
    from supabase import create_client

    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def sign_profile_picture_url(path: str | None) -> str | None:
    if not path:
        return None
    client = _storage_client()
    signed = client.storage.from_(PROFILE_PICTURE_BUCKET).create_signed_url(
        path, SIGNED_URL_EXPIRES
    )
    return signed.get("signedURL") or signed.get("signed_url")


def delete_profile_picture(path: str | None) -> None:
    if not path:
        return
    client = _storage_client()
    try:
        client.storage.from_(PROFILE_PICTURE_BUCKET).remove([path])
    except Exception:
        pass


def create_upload_url(profile_id: str, content_type: str) -> tuple[str, str]:
    ext = extension_from_content_type(content_type)
    path = storage_path_for_user(profile_id, ext)
    client = _storage_client()
    try:
        client.storage.from_(PROFILE_PICTURE_BUCKET).remove([path])
    except Exception:
        pass
    signed = client.storage.from_(PROFILE_PICTURE_BUCKET).create_signed_upload_url(path)
    upload_url = signed.get("signed_url") or signed.get("signedURL")
    if not upload_url:
        raise HTTPException(
            status_code=500,
            detail="Storage API did not return a signed upload URL.",
        )
    return upload_url, path


def enrich_profile(profile: dict) -> dict:
    picture_path = profile.get("profile_picture")
    return {
        **profile,
        "profile_picture_url": sign_profile_picture_url(picture_path),
    }
