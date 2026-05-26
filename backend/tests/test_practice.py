from unittest.mock import MagicMock


_EXERCISE = {
    "id": "ex-uuid-1",
    "exam_type": "TCF",
    "skill": "writing",
    "title": "TCF Writing Task 1",
    "prompt": "Write a short message.",
    "difficulty": "B1",
    "duration_minutes": 15,
    "question_type": "essay",
    "tier_required": "Free",
}


def test_get_exercises_returns_list(client, auth_headers, mock_db):
    # Router applies .eq() filter when exam_type is passed
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        MagicMock(data=[_EXERCISE])
    response = client.get("/api/v1/exercises?exam_type=TCF", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["id"] == "ex-uuid-1"


def test_complete_exercise(client, auth_headers, mock_db):
    mock_db.table.return_value.insert.return_value.execute.return_value = \
        MagicMock(data=[{"id": "comp-1"}])
    response = client.post(
        "/api/v1/exercises/ex-uuid-1/complete",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Exercise marked complete."
