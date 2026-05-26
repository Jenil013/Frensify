from unittest.mock import MagicMock

_SCORE = {
    "id": "score-1",
    "user_id": "user-uuid-123",
    "exam_name": "TCF Mock Test 1",
    "score_pct": 72,
    "cefr": "B2",
    "module_breakdown": [],
    "taken_at": "2026-05-21T10:00:00Z",
}


def test_get_exam_scores(client, auth_headers, mock_db):
    mock_db.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = \
        MagicMock(data=[_SCORE])
    response = client.get("/api/v1/exams/scores", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()[0]["score_pct"] == 72


def test_post_exam_score(client, auth_headers, mock_db):
    payload = {
        "exam_name": "TCF Mock Test 1",
        "score_pct": 72,
        "cefr": "B2",
        "module_breakdown": [],
    }
    mock_db.table.return_value.insert.return_value.execute.return_value = \
        MagicMock(data=[{**_SCORE}])
    response = client.post("/api/v1/exams/scores", headers=auth_headers, json=payload)
    assert response.status_code == 201
