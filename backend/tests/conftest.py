import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch


@pytest.fixture
def client():
    with patch("database.get_db") as mock_get_db:
        mock_get_db.return_value = MagicMock()
        from main import app
        yield TestClient(app)


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer fake-jwt-token"}


@pytest.fixture
def mock_profile():
    return {
        "id": "user-uuid-123",
        "name": "Test User",
        "target_exam": "TCF",
        "target_score": "B2",
        "current_level": "B1",
        "streak_days": 3,
        "last_active_date": "2026-05-21",
        "tier": "Pro",
        "created_at": "2026-05-01T00:00:00Z",
    }
