import pytest
from fastapi import HTTPException

from services.speaking_recording_service import assert_speaking_recording_owned

USER_ID = "user-uuid-123"
VALID_PATH = f"{USER_ID}/a1b2c3d4-e5f6-7890-abcd-ef1234567890.webm"


def test_assert_speaking_recording_owned_accepts_valid_path():
    assert_speaking_recording_owned(USER_ID, VALID_PATH)


def test_assert_speaking_recording_owned_rejects_other_user():
    with pytest.raises(HTTPException) as exc:
        assert_speaking_recording_owned(USER_ID, "other-user/a1b2c3d4-e5f6-7890-abcd-ef1234567890.webm")
    assert exc.value.status_code == 403


def test_assert_speaking_recording_owned_rejects_bad_extension():
    with pytest.raises(HTTPException) as exc:
        assert_speaking_recording_owned(USER_ID, f"{USER_ID}/a1b2c3d4-e5f6-7890-abcd-ef1234567890.exe")
    assert exc.value.status_code == 403


def test_assert_speaking_recording_owned_rejects_missing_path():
    with pytest.raises(HTTPException) as exc:
        assert_speaking_recording_owned(USER_ID, "")
    assert exc.value.status_code == 422
