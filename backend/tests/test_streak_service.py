from datetime import date, timedelta
import pytest

from services.streak_service import (
    effective_streak_days,
    record_practice_day,
    streak_from_dates,
    get_display_streak,
)


def test_effective_streak_days_allows_today_and_yesterday():
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    assert effective_streak_days(5, today) == 5
    assert effective_streak_days(5, yesterday) == 5
    assert effective_streak_days(5, (date.today() - timedelta(days=2)).isoformat()) == 0


def test_streak_from_dates_counts_consecutive_days():
    today = date(2026, 6, 16)
    active = {
        today,
        today - timedelta(days=1),
        today - timedelta(days=2),
        today - timedelta(days=10),
    }
    streak, anchor = streak_from_dates(active, today=today)
    assert streak == 3
    assert anchor == today


def test_streak_from_dates_uses_yesterday_when_no_today_activity():
    today = date(2026, 6, 16)
    yesterday = today - timedelta(days=1)
    active = {yesterday, yesterday - timedelta(days=1)}
    streak, anchor = streak_from_dates(active, today=today)
    assert streak == 2
    assert anchor == yesterday


def test_record_practice_day_increments_from_yesterday(mock_db):
    profile = {
        "id": "user-1",
        "streak_days": 4,
        "last_active_date": (date.today() - timedelta(days=1)).isoformat(),
    }
    streak = record_practice_day(mock_db, profile)
    assert streak == 5
    mock_db.table.assert_called_with("profiles")


def test_get_display_streak_backfills_from_activity(mock_db):
    today = date.today()
    profile = {"id": "user-1", "streak_days": 0, "last_active_date": None}

    def table_side_effect(name):
        table = mock_db.table.return_value
        if name == "completed_exercises":
            table.select.return_value.eq.return_value.execute.return_value.data = [
                {"completed_at": today.isoformat()}
            ]
        elif name == "module_scores":
            table.select.return_value.eq.return_value.execute.return_value.data = []
        elif name == "mock_test_scores":
            table.select.return_value.eq.return_value.execute.return_value.data = []
        elif name == "writing_submissions":
            table.select.return_value.eq.return_value.execute.return_value.data = []
        elif name == "speaking_sessions":
            table.select.return_value.eq.return_value.execute.return_value.data = []
        elif name == "user_vocabulary_progress":
            table.select.return_value.eq.return_value.execute.return_value.data = []
        return table

    mock_db.table.side_effect = table_side_effect
    assert get_display_streak(mock_db, profile) == 1
