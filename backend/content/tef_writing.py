"""Parse TEF Canada Expression écrite combination files from the question bank."""

from __future__ import annotations

import re
from pathlib import Path

EXAM_TYPE = "TEF"
MODULE_ID = "expression-ecrite"
SKILL = "writing"
DEFAULT_FILE = "tef_writing_combinations.txt"

_SECTION_A_RE = re.compile(
    r'Section\s+A:\s*"(?P<text>.*?)"\s*(?=Section\s+B:|$)',
    re.DOTALL | re.IGNORECASE,
)
_SECTION_B_RE = re.compile(
    r'Section\s+B:\s*"(?P<text>.*?)"\s*(?=Combination\s+\d+:|$)',
    re.DOTALL | re.IGNORECASE,
)
_GUILLEMET_RE = re.compile(r"<<\s*(.*?)\s*>>", re.DOTALL)
_FRENCH_QUOTE_RE = re.compile(r"«\s*(.*?)\s*»", re.DOTALL)


def _split_stimulus(raw: str) -> tuple[str, str | None]:
    text = raw.strip()
    guillemet_parts = _GUILLEMET_RE.findall(text)
    if guillemet_parts:
        stimulus = "\n\n".join(part.strip() for part in guillemet_parts)
        prompt = _GUILLEMET_RE.sub("", text).strip()
        prompt = re.sub(r"\n{3,}", "\n\n", prompt)
        return prompt, stimulus

    french_quote = _FRENCH_QUOTE_RE.search(text)
    if french_quote:
        stimulus = french_quote.group(1).strip()
        before = text[: french_quote.start()].strip()
        after = text[french_quote.end() :].strip()
        prompt = "\n\n".join(part for part in (before, after) if part)
        return prompt or text, stimulus

    return text, None


def _task_from_section(section_id: str, raw: str) -> dict:
    prompt, stimulus = _split_stimulus(raw)
    task = {"section_id": section_id, "prompt": prompt}
    if stimulus:
        task["stimulus"] = stimulus
    return task


def parse_tef_writing_file(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    parts = re.split(r"Combination\s+(\d+)\s*:", text, flags=re.IGNORECASE)
    rows: list[dict] = []

    for i in range(1, len(parts), 2):
        source_combo = int(parts[i])
        block = parts[i + 1]
        section_a_match = _SECTION_A_RE.search(block)
        section_b_match = _SECTION_B_RE.search(block)
        if not section_a_match or not section_b_match:
            raise ValueError(f"Missing Section A or B in combination {source_combo}")

        section_a_raw = section_a_match.group("text").strip()
        section_b_raw = section_b_match.group("text").strip()
        tasks = [
            _task_from_section("A", section_a_raw),
            _task_from_section("B", section_b_raw),
        ]

        rows.append(
            {
                "exam_type": EXAM_TYPE,
                "skill": SKILL,
                "module_id": MODULE_ID,
                "source_combo": source_combo,
                "prompt": tasks[0]["prompt"],
                "difficulty": "B1",
                "duration_minutes": 60,
                "question_type": "essay",
                "tier_required": "Free",
                "tasks": tasks,
            }
        )

    rows.sort(key=lambda row: row["source_combo"])
    if not rows:
        raise ValueError(f"No combinations parsed from {path}")
    return rows
