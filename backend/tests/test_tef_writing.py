from pathlib import Path

from content.tef_writing import EXAM_TYPE, MODULE_ID, parse_tef_writing_file

_FIXTURE = (
    Path(__file__).resolve().parent
    / "fixtures"
    / "tef_writing"
    / "tef_writing_combinations.txt"
)


def test_parse_tef_writing_file_returns_combinations():
    rows = parse_tef_writing_file(_FIXTURE)
    assert len(rows) == 2
    assert rows[0]["source_combo"] == 1
    assert rows[-1]["source_combo"] == 2


def test_each_combination_has_two_sections_a_and_b():
    rows = parse_tef_writing_file(_FIXTURE)
    for row in rows:
        assert row["exam_type"] == EXAM_TYPE
        assert row["module_id"] == MODULE_ID
        assert len(row["tasks"]) == 2
        assert row["tasks"][0]["section_id"] == "A"
        assert row["tasks"][1]["section_id"] == "B"
        assert row["tasks"][0]["prompt"]
        assert row["tasks"][1]["prompt"]


def test_combination_1_extracts_guillemet_stimulus():
    rows = parse_tef_writing_file(_FIXTURE)
    section_a = rows[0]["tasks"][0]
    section_b = rows[0]["tasks"][1]
    assert "Montréal" in section_a["stimulus"]
    assert "<<" not in section_a["prompt"]
    assert "argent" in section_b["stimulus"]


def test_combination_2_extracts_french_quote_stimulus():
    rows = parse_tef_writing_file(_FIXTURE)
    section_a = rows[1]["tasks"][0]
    assert "réseaux sociaux" in section_a["stimulus"]
    assert "Martin" in section_a["prompt"]
    assert "université" in section_a["prompt"].lower()
