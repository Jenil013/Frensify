"""Parse TEF Canada Expression orale question bank files."""

from __future__ import annotations

import re
from pathlib import Path

EXAM_TYPE = "TEF"
MODULE_ID = "expression-orale"
SKILL = "speaking"
DEFAULT_FILE = "TEF_Speaking_Questions.txt"

_SECTION_A_PROMPT = (
    "Jeu de rôle : obtenez des renseignements auprès de l'examinateur. "
    "Posez des questions naturelles en phrases complètes. (5 minutes)"
)
_SECTION_B_PROMPT = (
    "Jeu de rôle : convainquez votre ami. "
    "Présentez des arguments clairs et structurés. (10 minutes)"
)

_QUESTION_RE = re.compile(r"^\s*(\d+)\s*-\s*(?P<text>.+?)\s*$", re.MULTILINE)


def _parse_section_block(block: str) -> list[str]:
    questions: list[str] = []
    for match in _QUESTION_RE.finditer(block):
        text = match.group("text").strip()
        if text:
            questions.append(text)
    return questions


def parse_tef_speaking_file(path: Path) -> dict[str, list[str]]:
    text = path.read_text(encoding="utf-8")
    section_a_block = ""
    section_b_block = ""
    if "SECTION A" in text:
        after_a = text.split("SECTION A", 1)[1]
        if "SECTION B" in after_a:
            section_a_block, section_b_block = after_a.split("SECTION B", 1)
        else:
            section_a_block = after_a

    section_a = _parse_section_block(section_a_block)
    section_b = _parse_section_block(section_b_block)
    if not section_a or not section_b:
        raise ValueError(f"Missing Section A or B questions in {path}")
    return {"A": section_a, "B": section_b}


def build_tef_speaking_combinations(path: Path) -> list[dict]:
    """Pair Section A and B scenarios into full oral combinations."""
    sections = parse_tef_speaking_file(path)
    section_a = sections["A"]
    section_b = sections["B"]
    count = min(len(section_a), len(section_b))
    rows: list[dict] = []

    for index in range(count):
        tasks = [
            {
                "section_id": "A",
                "prompt": _SECTION_A_PROMPT,
                "stimulus": f"Situation : {section_a[index]}",
            },
            {
                "section_id": "B",
                "prompt": _SECTION_B_PROMPT,
                "stimulus": f"Situation : {section_b[index]}",
            },
        ]
        rows.append(
            {
                "exam_type": EXAM_TYPE,
                "skill": SKILL,
                "module_id": MODULE_ID,
                "source_combo": index + 1,
                "prompt": tasks[0]["prompt"],
                "difficulty": "B1",
                "duration_minutes": 15,
                "question_type": "oral-response",
                "tier_required": "Pro",
                "tasks": tasks,
            }
        )

    return rows
