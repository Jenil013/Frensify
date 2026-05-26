from unittest.mock import MagicMock


def test_get_profile(client, auth_headers, mock_profile):
    response = client.get("/api/v1/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == mock_profile["id"]
    assert data["tier"] == "Pro"


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
