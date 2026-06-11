import json
from unittest.mock import MagicMock

_CARD = {
    "id": "card-1",
    "user_id": None,
    "word": "néanmoins",
    "translation": "nevertheless",
    "category": "Argument connectors",
    "difficulty": "B2",
    "exam_type": "both",
    "example_sentence": "Néanmoins, il faut continuer.",
    "created_at": "2026-05-01T00:00:00Z",
}

_PROGRESS = {
    "user_id": "user-uuid-123",
    "card_id": "card-1",
    "mastered": False,
    "review_count": 1,
    "last_reviewed_at": None,
    "ease": 0,
}


def _mock_vocab_tables(mock_db, *, cards=None, progress=None, card_lookup=None):
    cards = cards if cards is not None else [_CARD]
    progress = progress if progress is not None else []

    def table_side_effect(name):
        mock = MagicMock()
        if name == "vocabulary_cards":
            mock.select.return_value.or_.return_value.execute.return_value = MagicMock(
                data=cards
            )
            mock.select.return_value.eq.return_value.execute.return_value = MagicMock(
                data=card_lookup if card_lookup is not None else [{"id": "card-1", "user_id": None}]
            )
            mock.insert.return_value.execute.return_value = MagicMock(
                data=[{**_CARD, "id": "new-card", "user_id": "user-uuid-123"}]
            )
            mock.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[_CARD]
            )
        elif name == "user_vocabulary_progress":
            mock.select.return_value.eq.return_value.execute.return_value = MagicMock(
                data=progress
            )
            mock.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
                data=progress[:1] if progress else []
            )
            mock.insert.return_value.execute.return_value = MagicMock(data=[_PROGRESS])
            mock.update.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
                data=[_PROGRESS]
            )
        elif name in ("writing_submissions", "speaking_sessions"):
            mock.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
                data=[]
            )
        return mock

    mock_db.table.side_effect = table_side_effect


def test_get_vocabulary(client, auth_headers, mock_db):
    _mock_vocab_tables(mock_db)
    response = client.get("/api/v1/vocabulary", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body[0]["word"] == "néanmoins"
    assert body[0]["mastered"] is False


def test_post_vocabulary(client, auth_headers, mock_db):
    _mock_vocab_tables(mock_db)
    response = client.post(
        "/api/v1/vocabulary",
        headers=auth_headers,
        json={
            "word": "cependant",
            "translation": "however",
            "category": "Argument connectors",
            "difficulty": "B1",
        },
    )
    assert response.status_code == 201
    assert response.json()["word"] == "néanmoins"


def test_patch_vocabulary_mastered(client, auth_headers, mock_db):
    _mock_vocab_tables(mock_db)
    response = client.patch(
        "/api/v1/vocabulary/card-1",
        headers=auth_headers,
        json={"mastered": True},
    )
    assert response.status_code == 200


def test_patch_vocabulary_review_got_it(client, auth_headers, mock_db):
    _mock_vocab_tables(mock_db, progress=[_PROGRESS])
    response = client.patch(
        "/api/v1/vocabulary/card-1",
        headers=auth_headers,
        json={"review_result": "got_it"},
    )
    assert response.status_code == 200


def test_vocabulary_review(client, auth_headers, mock_db):
    _mock_vocab_tables(mock_db)
    response = client.get(
        "/api/v1/vocabulary/review?limit=5&exam_type=TCF",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_vocabulary_stats(client, auth_headers, mock_db):
    _mock_vocab_tables(mock_db, progress=[_PROGRESS])
    response = client.get("/api/v1/vocabulary/stats", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert "reviewed_today" in body
    assert body["daily_goal"] == 5


def test_vocabulary_suggestions_empty(client, auth_headers, mock_db):
    _mock_vocab_tables(mock_db)
    response = client.get("/api/v1/vocabulary/suggestions", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["hasSuggestion"] is False
