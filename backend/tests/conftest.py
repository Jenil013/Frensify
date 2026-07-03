import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def _reset_ai_rate_limits():
    from services.ai_rate_limit import reset_ai_rate_limits

    reset_ai_rate_limits()
    yield
    reset_ai_rate_limits()


@pytest.fixture
def mock_profile():
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    return {
        "id": "user-uuid-123",
        "name": "Test User",
        "target_exam": "TCF",
        "target_score": "B2",
        "current_level": "B1",
        "streak_days": 3,
        "last_active_date": yesterday,
        "exam_date": "2026-07-28",
        "tier": "Pro",
        "created_at": "2026-05-01T00:00:00Z",
    }


@pytest.fixture
def mock_db():
    return MagicMock()


@pytest.fixture
def client(mock_profile, mock_db):
    from main import app
    from dependencies import get_profile
    from database import get_db

    async def _get_profile():
        return mock_profile

    def _get_db():
        return mock_db

    app.dependency_overrides[get_profile] = _get_profile
    app.dependency_overrides[get_db] = _get_db

    yield TestClient(app)

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers():
    """Return headers with a fake Bearer token for routes that require auth."""
    return {"Authorization": "Bearer fake-jwt-token"}
