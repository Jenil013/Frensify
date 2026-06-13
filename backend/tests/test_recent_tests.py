from unittest.mock import MagicMock

from services.recent_tests import (
    _aggregate_section_rows,
    _average_cefr,
    _parse_exercise,
    build_recent_tests,
    _label_from_exercise_id,
)


def test_label_from_exercise_id():
    assert _label_from_exercise_id("TEF-expression-ecrite-A") == "Expression écrite"
    assert _label_from_exercise_id("TCF-comprehension-ecrite-q1") == "Compréhension écrite"


def test_parse_exercise():
    assert _parse_exercise("TCF-expression-ecrite-3") == (
        "TCF-expression-ecrite",
        "3",
        "TCF",
        "expression-ecrite",
    )
    assert _parse_exercise("TEF-expression-ecrite-B") == (
        "TEF-expression-ecrite",
        "B",
        "TEF",
        "expression-ecrite",
    )
    assert _parse_exercise("combo+uuid-2", "TCF") == (
        "combo+uuid",
        "2",
        "TCF",
        "expression-orale",
    )


def test_average_cefr():
    assert _average_cefr(["B2", "C1", "C1"]) == "C1"
    assert _average_cefr(["A1", "C2"]) == "B1"


def test_aggregate_writing_sections_into_one_row():
    submissions = [
        {
            "id": "w1",
            "exercise_id": "TCF-expression-ecrite-1",
            "exam_type": "TCF",
            "cefr_score": "B2",
            "submitted_at": "2026-06-09T19:55:10Z",
        },
        {
            "id": "w2",
            "exercise_id": "TCF-expression-ecrite-2",
            "exam_type": "TCF",
            "cefr_score": "C1",
            "submitted_at": "2026-06-09T19:55:24Z",
        },
        {
            "id": "w3",
            "exercise_id": "TCF-expression-ecrite-3",
            "exam_type": "TCF",
            "cefr_score": "C1",
            "submitted_at": "2026-06-09T19:55:45Z",
        },
    ]
    rows = _aggregate_section_rows(
        submissions,
        cefr_field="cefr_score",
        time_field="submitted_at",
        kind="writing",
    )
    assert len(rows) == 1
    assert rows[0]["examName"] == "Expression écrite"
    assert rows[0]["scoreLabel"] == "C1"
    assert rows[0]["subtitle"] == "TCF · Practice"


def test_oral_sessions_label_as_expression_orale():
    sessions = [
        {
            "id": "s1",
            "exercise_id": "task1-travel+uuid+combo-1",
            "exam_type": "TCF",
            "cefr_level": "B1",
            "submitted_at": "2026-06-08T20:21:55Z",
        },
        {
            "id": "s2",
            "exercise_id": "task1-travel+uuid+combo-2",
            "exam_type": "TCF",
            "cefr_level": "A1",
            "submitted_at": "2026-06-08T20:22:19Z",
        },
        {
            "id": "s3",
            "exercise_id": "task1-travel+uuid+combo-3",
            "exam_type": "TCF",
            "cefr_level": "A1",
            "submitted_at": "2026-06-08T20:22:26Z",
        },
    ]
    rows = _aggregate_section_rows(
        sessions,
        cefr_field="cefr_level",
        time_field="submitted_at",
        kind="speaking",
    )
    assert len(rows) == 1
    assert rows[0]["examName"] == "Expression orale"
    assert rows[0]["subtitle"] == "TCF · Practice"


def test_aggregate_splits_back_to_back_module_attempts():
    submissions = [
        {
            "id": "w1",
            "exercise_id": "TCF-expression-ecrite-1",
            "exam_type": "TCF",
            "cefr_score": "C1",
            "submitted_at": "2026-06-09T19:51:22Z",
        },
        {
            "id": "w2",
            "exercise_id": "TCF-expression-ecrite-2",
            "exam_type": "TCF",
            "cefr_score": "B2",
            "submitted_at": "2026-06-09T19:51:59Z",
        },
        {
            "id": "w3",
            "exercise_id": "TCF-expression-ecrite-3",
            "exam_type": "TCF",
            "cefr_score": "C1",
            "submitted_at": "2026-06-09T19:52:13Z",
        },
        {
            "id": "w4",
            "exercise_id": "TCF-expression-ecrite-1",
            "exam_type": "TCF",
            "cefr_score": "C1",
            "submitted_at": "2026-06-09T19:55:10Z",
        },
        {
            "id": "w5",
            "exercise_id": "TCF-expression-ecrite-2",
            "exam_type": "TCF",
            "cefr_score": "A1",
            "submitted_at": "2026-06-09T19:55:24Z",
        },
        {
            "id": "w6",
            "exercise_id": "TCF-expression-ecrite-3",
            "exam_type": "TCF",
            "cefr_score": "C1",
            "submitted_at": "2026-06-09T19:55:45Z",
        },
    ]
    rows = _aggregate_section_rows(
        submissions,
        cefr_field="cefr_score",
        time_field="submitted_at",
        kind="writing",
    )
    assert len(rows) == 2


def _table_chain(data):
    chain = MagicMock()
    chain.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value = MagicMock(
        data=data
    )
    return chain


def test_build_recent_tests_merges_and_sorts():
    db = MagicMock()
    db.table.side_effect = lambda name: {
        "mock_test_scores": _table_chain(
            [
                {
                    "id": "m1",
                    "exam_name": "TCF Simulation",
                    "score_pct": 80,
                    "cefr": "B2",
                    "taken_at": "2026-06-10T10:00:00Z",
                }
            ]
        ),
        "module_scores": _table_chain(
            [
                {
                    "id": "mod1",
                    "module_id": "comprehension-ecrite",
                    "raw_score": 30,
                    "max_score": 39,
                    "exam_context": "practice",
                    "taken_at": "2026-06-11T10:00:00Z",
                }
            ]
        ),
        "writing_submissions": _table_chain([]),
        "speaking_sessions": _table_chain([]),
    }[name]

    rows = build_recent_tests(db, "user-uuid-123", limit=12)
    assert len(rows) == 2
    assert rows[0]["examName"] == "Compréhension écrite"
    assert rows[1]["examName"] == "Full Mock"
