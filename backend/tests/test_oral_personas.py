from content.oral_examiner_personas import (
    MAX_ORAL_TURNS_PER_SECTION,
    get_persona,
    get_turn_reply_instructions,
)
import pytest


def test_get_persona_tef_sections():
    assert "service" in get_persona("TEF", "A").lower() or "business" in get_persona("TEF", "A").lower()
    assert "friend" in get_persona("TEF", "B").lower()


def test_get_persona_tcf_tasks():
    assert "interview" in get_persona("TCF", "1").lower()
    assert "role-play" in get_persona("TCF", "2").lower()
    assert "devil" in get_persona("TCF", "3").lower() or "advocate" in get_persona("TCF", "3").lower()


def test_get_turn_reply_instructions_tcf_task2_answers_not_interviews():
    instructions = get_turn_reply_instructions("TCF", "2")
    lowered = instructions.lower()
    assert "candidate-led" in lowered or "candidate leads" in lowered
    assert "only answer" in lowered
    assert "no questions" in lowered
    persona = get_persona("TCF", "2").lower()
    assert "never ask" in persona
    assert "8" in persona and "12" in persona


def test_get_persona_unknown_raises():
    with pytest.raises(ValueError):
        get_persona("TEF", "Z")


def test_max_oral_turns_is_positive():
    assert MAX_ORAL_TURNS_PER_SECTION >= 10
