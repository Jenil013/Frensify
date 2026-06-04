from datetime import date
from unittest.mock import MagicMock
from services.usage_service import get_or_create_week, increment, write_audit_log


def _make_db(existing_row=None):
    db = MagicMock()
    select_execute = MagicMock()
    select_execute.data = [existing_row] if existing_row else []
    db.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = select_execute
    upsert_mock = MagicMock()
    upsert_mock.execute.return_value = MagicMock(data=[{"writing_eval_count": 1}])
    db.table.return_value.upsert.return_value = upsert_mock
    insert_mock = MagicMock()
    insert_mock.execute.return_value = MagicMock(data=[{}])
    db.table.return_value.insert.return_value = insert_mock
    return db


def test_get_or_create_returns_existing_row():
    existing = {"user_id": "u1", "week_start": "2026-05-18", "writing_eval_count": 1}
    db = _make_db(existing_row=existing)
    result = get_or_create_week(db, "u1", date(2026, 5, 18))
    assert result["writing_eval_count"] == 1


def test_get_or_create_returns_zeroed_row_when_missing():
    db = _make_db(existing_row=None)
    result = get_or_create_week(db, "u1", date(2026, 5, 18))
    assert result["writing_eval_count"] == 0


def test_increment_calls_upsert():
    db = _make_db(existing_row={"writing_eval_count": 0})
    increment(db, "u1", date(2026, 5, 18), "writing_eval")
    db.table.assert_any_call("weekly_usage")


def test_write_audit_log_inserts_row():
    db = _make_db()
    write_audit_log(db, "u1", "writing_eval", "practice")
    db.table.assert_any_call("ai_usage_logs")
