import asyncio
import pytest
from unittest.mock import patch
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials


@patch("dependencies.jwt.decode")
def test_get_current_user_valid_token(mock_decode):
    from dependencies import get_current_user

    mock_decode.return_value = {"sub": "user-uuid-123", "role": "authenticated"}
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid-token")

    result = asyncio.run(get_current_user(creds))
    assert result["sub"] == "user-uuid-123"


@patch("dependencies.jwt.decode")
def test_get_current_user_expired_token(mock_decode):
    from dependencies import get_current_user
    from jose import ExpiredSignatureError

    mock_decode.side_effect = ExpiredSignatureError("expired")
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="expired-token")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(get_current_user(creds))
    assert exc_info.value.status_code == 401


@patch("dependencies.jwt.decode")
def test_get_current_user_invalid_token(mock_decode):
    from dependencies import get_current_user
    from jose import JWTError

    mock_decode.side_effect = JWTError("invalid")
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="garbage")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(get_current_user(creds))
    assert exc_info.value.status_code == 401
