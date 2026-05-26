from unittest.mock import MagicMock

_CARD = {
    "id": "card-1",
    "user_id": None,
    "word": "bonjour",
    "translation": "hello",
    "category": "greetings",
    "difficulty": "A1",
    "mastered": False,
    "created_at": "2026-05-01T00:00:00Z",
}


def test_get_vocabulary(client, auth_headers, mock_db):
    mock_db.table.return_value.select.return_value.or_.return_value.execute.return_value = \
        MagicMock(data=[_CARD])
    response = client.get("/api/v1/vocabulary", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()[0]["word"] == "bonjour"


def test_patch_vocabulary_mastered(client, auth_headers, mock_db):
    updated = {**_CARD, "mastered": True}
    mock_db.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = \
        MagicMock(data=[updated])
    response = client.patch(
        "/api/v1/vocabulary/card-1",
        headers=auth_headers,
        json={"mastered": True},
    )
    assert response.status_code == 200
    assert response.json()["mastered"] is True
