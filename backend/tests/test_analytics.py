from unittest.mock import MagicMock


def test_analytics_summary(client, auth_headers, mock_profile, mock_db):
    # mock_test_scores query (limit)
    mock_db.table.return_value.select.return_value.eq.return_value \
        .order.return_value.limit.return_value.execute.return_value = \
        MagicMock(data=[{"score_pct": 72, "cefr": "B2", "taken_at": "2026-05-21T10:00:00Z", "exam_name": "TCF Mock 1"}])

    # module_scores query (no limit)
    mock_db.table.return_value.select.return_value.eq.return_value \
        .order.return_value.execute.return_value = MagicMock(data=[])

    # weekly_usage query
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value \
        .single.return_value.execute.return_value = MagicMock(
            data={"writing_eval_count": 1, "speaking_eval_count": 0,
                  "vocab_explain_count": 2}
        )

    response = client.get("/api/v1/analytics/summary", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "recentMockScores" in data
    assert "weeklyUsage" in data
    assert "streakDays" in data
    assert data["streakDays"] == mock_profile["streak_days"]
    assert data["tier"] == mock_profile["tier"]


def test_recent_tests(client, auth_headers, mock_db, monkeypatch):
    monkeypatch.setattr(
        "routers.analytics.build_recent_tests",
        lambda db, user_id, limit=10: [
            {
                "id": "mock:1",
                "kind": "full_mock",
                "examName": "Full Mock",
                "subtitle": "TCF Simulation",
                "takenAt": "2026-06-10T10:00:00Z",
                "scoreLabel": "80%",
                "scorePct": 80,
            }
        ],
    )
    response = client.get("/api/v1/analytics/recent-tests", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["items"][0]["examName"] == "Full Mock"
