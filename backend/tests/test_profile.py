from unittest.mock import MagicMock, patch

import pytest


def test_get_profile(client, auth_headers, mock_profile):
    response = client.get("/api/v1/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == mock_profile["id"]
    assert data["tier"] == "Pro"


def test_get_profile_includes_picture_url(client, auth_headers, mock_profile):
    mock_profile["profile_picture"] = "user-uuid-123/avatar.jpg"
    with patch(
        "services.profile_picture_service.sign_profile_picture_url",
        return_value="https://example.com/signed.jpg",
    ):
        response = client.get("/api/v1/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["profile_picture"] == "user-uuid-123/avatar.jpg"
    assert data["profile_picture_url"] == "https://example.com/signed.jpg"


def test_patch_profile(client, auth_headers, mock_profile, mock_db):
    updated = {**mock_profile, "name": "Updated Name"}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = \
        MagicMock(data=[updated])
    response = client.patch(
        "/api/v1/profile",
        headers=auth_headers,
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


def test_patch_profile_exam_date(client, auth_headers, mock_profile, mock_db):
    updated = {**mock_profile, "exam_date": "2026-09-15"}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = \
        MagicMock(data=[updated])
    response = client.patch(
        "/api/v1/profile",
        headers=auth_headers,
        json={"exam_date": "2026-09-15"},
    )
    assert response.status_code == 200
    assert response.json()["exam_date"] == "2026-09-15"


def test_patch_profile_picture_owned_path(client, auth_headers, mock_profile, mock_db):
    path = "user-uuid-123/avatar.png"
    updated = {**mock_profile, "profile_picture": path}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = \
        MagicMock(data=[updated])
    with patch(
        "services.profile_picture_service.sign_profile_picture_url",
        return_value="https://example.com/signed.png",
    ):
        response = client.patch(
            "/api/v1/profile",
            headers=auth_headers,
            json={"profile_picture": path},
        )
    assert response.status_code == 200
    assert response.json()["profile_picture"] == path
    assert response.json()["profile_picture_url"] == "https://example.com/signed.png"


def test_patch_profile_picture_foreign_path_rejected(client, auth_headers):
    response = client.patch(
        "/api/v1/profile",
        headers=auth_headers,
        json={"profile_picture": "other-user/avatar.jpg"},
    )
    assert response.status_code == 403


def test_patch_profile_picture_remove(client, auth_headers, mock_profile, mock_db):
    mock_profile["profile_picture"] = "user-uuid-123/avatar.jpg"
    updated = {**mock_profile, "profile_picture": None}
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = \
        MagicMock(data=[updated])
    with patch("routers.profile.delete_profile_picture") as delete_mock:
        with patch(
            "services.profile_picture_service.sign_profile_picture_url",
            return_value=None,
        ):
            response = client.patch(
                "/api/v1/profile",
                headers=auth_headers,
                json={"profile_picture": None},
            )
    assert response.status_code == 200
    delete_mock.assert_called_once_with("user-uuid-123/avatar.jpg")
    assert response.json()["profile_picture"] is None


def test_profile_picture_upload_url(client, auth_headers):
    with patch(
        "routers.profile.create_upload_url",
        return_value=("https://example.com/upload", "user-uuid-123/avatar.jpg"),
    ):
        response = client.post(
            "/api/v1/profile/picture/upload-url",
            headers=auth_headers,
            json={"content_type": "image/jpeg"},
        )
    assert response.status_code == 200
    data = response.json()
    assert data["upload_url"] == "https://example.com/upload"
    assert data["storage_path"] == "user-uuid-123/avatar.jpg"
