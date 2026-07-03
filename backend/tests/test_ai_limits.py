import pytest
from pydantic import ValidationError

from ai_limits import (
    AI_RATE_LIMIT_MAX_REQUESTS,
    MAX_ESSAY_TEXT_LENGTH,
    MAX_VOCAB_FIELD_LENGTH,
)
from models.ai import VocabExplainRequest, WritingEvalRequest
from services.ai_rate_limit import check_ai_rate_limit, reset_ai_rate_limits


def test_writing_eval_accepts_long_essay_within_limit():
    text = "mot " * 400  # ~2× TEF longest min_words (200)
    req = WritingEvalRequest(
        exercise_id="ex-1",
        essay_text=text,
        word_count=400,
        exam_type="TEF",
        prompt="Rédigez un texte.",
        min_words=200,
    )
    assert req.word_count == 400


def test_writing_eval_rejects_oversized_essay():
    with pytest.raises(ValidationError):
        WritingEvalRequest(
            exercise_id="ex-1",
            essay_text="x" * (MAX_ESSAY_TEXT_LENGTH + 1),
            word_count=100,
            exam_type="TCF",
            prompt="Test",
        )


def test_vocab_explain_word_limit():
    word = "a" * MAX_VOCAB_FIELD_LENGTH
    req = VocabExplainRequest(word=word)
    assert len(req.word) == MAX_VOCAB_FIELD_LENGTH

    with pytest.raises(ValidationError):
        VocabExplainRequest(word="a" * (MAX_VOCAB_FIELD_LENGTH + 1))


def test_ai_rate_limit_blocks_burst():
    reset_ai_rate_limits()
    profile = {"id": "rate-limit-user"}
    for _ in range(AI_RATE_LIMIT_MAX_REQUESTS):
        check_ai_rate_limit(profile)
    with pytest.raises(Exception) as exc:
        check_ai_rate_limit(profile)
    assert exc.value.status_code == 429
