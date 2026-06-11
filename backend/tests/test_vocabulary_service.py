from services.vocabulary_service import (
    apply_review_result,
    compute_vocab_suggestions,
    parse_cefr_level,
    select_review_cards,
)


def test_parse_cefr_level():
    assert parse_cefr_level("B2 — varied vocabulary.") == "B2"
    assert parse_cefr_level("invalid") is None


def test_select_review_cards_prioritizes_unreviewed():
    cards = [
        {"id": "1", "word": "a", "mastered": False, "last_reviewed_at": "2026-01-02", "review_count": 2, "exam_type": "both", "difficulty": "B2", "category": "Argument connectors"},
        {"id": "2", "word": "b", "mastered": False, "last_reviewed_at": None, "review_count": 0, "exam_type": "both", "difficulty": "B2", "category": "Argument connectors"},
    ]
    result = select_review_cards(cards, exam_type="TEF", target_score="B2", limit=1)
    assert result[0]["id"] == "2"


def test_apply_review_result_got_it_masters_after_threshold():
    existing = {"mastered": False, "review_count": 2, "ease": 0, "last_reviewed_at": None}
    updated = apply_review_result(existing, "got_it")
    assert updated["mastered"] is True
    assert updated["review_count"] == 3


def test_compute_vocab_suggestions_requires_evidence():
    writing = [
        {"ai_feedback": {"dimensionScores": {"vocabulary": "B1 — limited range."}}},
        {"ai_feedback": {"dimensionScores": {"vocabulary": "A2 — basic."}}},
    ]
    result = compute_vocab_suggestions(
        target_score="B2",
        writing_submissions=writing,
        speaking_sessions=[],
    )
    assert result is not None
    assert result["source"] == "writing"
    assert "Argument connectors" in result["suggested_categories"]
