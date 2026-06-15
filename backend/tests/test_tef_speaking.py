from pathlib import Path

from content.tef_speaking import (
    EXAM_TYPE,
    MODULE_ID,
    SKILL,
    build_tef_speaking_combinations,
    parse_tef_speaking_file,
)

_SOURCE = (
    Path(__file__).resolve().parents[2]
    / "supabase"
    / "question_bank"
    / "TEF_Speaking"
    / "TEF_Speaking_Questions.txt"
)


def test_parse_tef_speaking_file_returns_section_pools():
    sections = parse_tef_speaking_file(_SOURCE)
    assert len(sections["A"]) == 38
    assert len(sections["B"]) == 30
    assert "bateaux sans permis" in sections["A"][0]
    assert "opéra" in sections["B"][0]


def test_build_tef_speaking_combinations_pairs_sections():
    rows = build_tef_speaking_combinations(_SOURCE)
    assert len(rows) == 30
    assert rows[0]["exam_type"] == EXAM_TYPE
    assert rows[0]["skill"] == SKILL
    assert rows[0]["module_id"] == MODULE_ID
    assert len(rows[0]["tasks"]) == 2
    assert rows[0]["tasks"][0]["section_id"] == "A"
    assert rows[0]["tasks"][1]["section_id"] == "B"
    assert rows[0]["tasks"][0]["stimulus"].startswith("Situation :")
