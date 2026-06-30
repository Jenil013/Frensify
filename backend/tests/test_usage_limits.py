from unittest.mock import MagicMock


def _setup_usage_mock(mock_db, writing_count: int = 0, mock_count: int = 0):
    usage_row = {
        "writing_eval_count": writing_count,
        "speaking_eval_count": 0,
        "vocab_explain_count": 0,
    }

    def table_side_effect(name):
        mock = MagicMock()
        if name == "weekly_usage":
            mock.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
                MagicMock(data=[usage_row])
            )
        elif name == "mock_test_scores":
            mock.select.return_value.eq.return_value.gte.return_value.execute.return_value = (
                MagicMock(count=mock_count)
            )
        return mock

    mock_db.table.side_effect = table_side_effect


def test_usage_limits_under_cap(client, auth_headers, mock_db):
    _setup_usage_mock(mock_db, writing_count=1, mock_count=0)
    response = client.get("/api/v1/usage/limits", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["tier"] == "Pro"
    assert body["weekly_usage"]["writing_eval"] == 1
    assert body["weekly_caps"]["writing_eval"] == 2
    assert body["can_start"]["writing_practice"] is True
    assert body["can_start"]["mock_exam"] is True


def test_usage_limits_writing_exhausted(client, auth_headers, mock_db):
    _setup_usage_mock(mock_db, writing_count=2)
    response = client.get("/api/v1/usage/limits", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["can_start"]["writing_practice"] is False


def test_usage_limits_free_tier(client, auth_headers, mock_db, mock_profile):
    mock_profile["tier"] = "Free"
    _setup_usage_mock(mock_db)
    response = client.get("/api/v1/usage/limits", headers=auth_headers)
    body = response.json()
    assert body["can_start"]["writing_practice"] is False
    assert body["can_start"]["speaking_practice"] is False
    assert body["can_start"]["mock_exam"] is False
    assert body["weekly_mock_cap"] == 0


def test_usage_limits_mock_exhausted(client, auth_headers, mock_db):
    _setup_usage_mock(mock_db, mock_count=1)
    response = client.get("/api/v1/usage/limits", headers=auth_headers)
    body = response.json()
    assert body["weekly_mock_cap"] == 1
    assert body["weekly_mock_usage"] == 1
    assert body["can_start"]["mock_exam"] is False
