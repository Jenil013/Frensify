import re

from fastapi import HTTPException

ALLOWED_EXTENSIONS = frozenset({"webm", "mp3", "wav", "m4a"})


def assert_speaking_recording_owned(profile_id: str, path: str) -> None:
    """Ensure storage_path belongs to the caller (prevents cross-tenant IDOR)."""
    if not path:
        raise HTTPException(status_code=422, detail="Missing recording path.")
    allowed = "|".join(re.escape(ext) for ext in ALLOWED_EXTENSIONS)
    pattern = (
        rf"^{re.escape(profile_id)}/"
        rf"[0-9a-f]{{8}}-[0-9a-f]{{4}}-[0-9a-f]{{4}}-[0-9a-f]{{4}}-[0-9a-f]{{12}}"
        rf"\.({allowed})$"
    )
    if not re.fullmatch(pattern, path, re.IGNORECASE):
        raise HTTPException(status_code=403, detail="Invalid recording path.")
