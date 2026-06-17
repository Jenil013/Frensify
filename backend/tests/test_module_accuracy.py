from unittest.mock import MagicMock

from services.module_accuracy import build_module_accuracy


def _table_chain(data):
    chain = MagicMock()
    chain.select.return_value = chain
    chain.eq.return_value = chain
    chain.order.return_value = chain
    chain.execute.return_value = MagicMock(data=data)
    return chain


def test_build_module_accuracy_averages_last_three_module_scores():
    db = MagicMock()
    module_rows = [
        {
            "module_id": "comprehension-orale",
            "raw_score": 36,
            "max_score": 40,
            "exam_context": "practice",
            "taken_at": "2026-06-14T10:00:00+00:00",
        },
        {
            "module_id": "comprehension-orale",
            "raw_score": 32,
            "max_score": 40,
            "exam_context": "mock",
            "taken_at": "2026-06-13T10:00:00+00:00",
        },
        {
            "module_id": "comprehension-orale",
            "raw_score": 28,
            "max_score": 40,
            "exam_context": "practice",
            "taken_at": "2026-06-12T10:00:00+00:00",
        },
        {
            "module_id": "comprehension-orale",
            "raw_score": 20,
            "max_score": 40,
            "exam_context": "practice",
            "taken_at": "2026-06-01T10:00:00+00:00",
        },
    ]

    def table_side_effect(name):
        if name == "module_scores":
            return _table_chain(module_rows)
        if name == "mock_test_scores":
            return _table_chain([])
        if name == "writing_submissions":
            return _table_chain([])
        if name == "speaking_sessions":
            return _table_chain([])
        return _table_chain([])

    db.table.side_effect = table_side_effect

    summary = build_module_accuracy(db, "user-1", "TEF")
    oral = summary["comprehension-orale"]
    assert oral["hasData"] is True
    assert oral["sampleSize"] == 3
    # 90%, 80%, 70% -> 80%
    assert oral["accuracyPct"] == 80
    assert oral["cefr"] == "B2"


def test_build_module_accuracy_empty_module():
    db = MagicMock()
    db.table.side_effect = lambda _name: _table_chain([])
    summary = build_module_accuracy(db, "user-1", "TCF")
    assert summary["expression-orale"]["hasData"] is False
    assert summary["expression-orale"]["accuracyPct"] is None
