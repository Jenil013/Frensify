from unittest.mock import patch

from content.tcf_oral_task1 import (
    TCF_TASK1_FOLLOWUPS,
    TCF_TASK1_INTRO_FR,
    build_tcf_task1_section,
)


def test_build_tcf_task1_includes_mandatory_intro():
    with patch("content.tcf_oral_task1.random.choice", return_value=TCF_TASK1_FOLLOWUPS[0]):
        section, topic_id = build_tcf_task1_section()

    assert section.stimulus == TCF_TASK1_INTRO_FR
    assert TCF_TASK1_FOLLOWUPS[0]["fr"] not in section.stimulus
    assert "Work & studies" in section.prompt
    assert topic_id == "work"


def test_build_tcf_task1_picks_random_followup():
    with patch(
        "content.tcf_oral_task1.random.choice",
        return_value=TCF_TASK1_FOLLOWUPS[4],
    ):
        section, topic_id = build_tcf_task1_section()

    assert section.stimulus == TCF_TASK1_INTRO_FR
    assert "Canada" in section.prompt
    assert "Canada" not in section.stimulus
    assert topic_id == "future"
