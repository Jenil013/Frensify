"""Parse TCF Expression écrite combination files from the question bank."""

from __future__ import annotations

import re
from pathlib import Path

EXAM_TYPE = "TCF"
MODULE_ID = "expression-ecrite"
SKILL = "writing"
FILE_GLOB = "*_Expression_Ecrite_Topics.txt"

TASK3_INSTRUCTION = (
    "À partir des deux documents ci-dessous, rédigez un texte argumenté "
    "qui compare les points de vue présentés et exprime votre opinion (120–180 mots)."
)

_TASK1_RE = re.compile(r'Task1:\s*"(?P<text>.*?)"', re.DOTALL)
_TASK2_RE = re.compile(r'Task2:\s*"(?P<text>.*?)"', re.DOTALL)
_TASK3_RE = re.compile(r'Task3:\s*"(?P<text>.*?)"', re.DOTALL)
_MONTH_YEAR_RE = re.compile(
    r"^(Jan|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|Aug|Sept|Sep|Oct|Nov|Dec)(\d{4})_",
    re.IGNORECASE,
)

_MONTH_NUM = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "sep": 9,
    "sept": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
}


def _month_year_from_filename(name: str) -> tuple[int, int] | None:
    match = _MONTH_YEAR_RE.match(name)
    if not match:
        return None
    month_key = match.group(1).lower()
    month = _MONTH_NUM.get(month_key)
    if month is None:
        return None
    return int(match.group(2)), month


def discover_sources(
    bank_dir: Path,
    start: tuple[int, int] | None = None,
    end: tuple[int, int] | None = None,
) -> list[Path]:
    candidates: list[tuple[tuple[int, int], Path]] = []
    for path in sorted(bank_dir.glob(FILE_GLOB)):
        year_month = _month_year_from_filename(path.name)
        if year_month is None:
            continue
        if start is not None and year_month < start:
            continue
        if end is not None and year_month > end:
            continue
        candidates.append((year_month, path))
    candidates.sort(key=lambda item: item[0])
    return [path for _, path in candidates]


def _format_task3_stimulus(docs: str) -> str:
    doc2_marker = "Document 2 :"
    if doc2_marker not in docs:
        body = docs.strip()
        return f"Document 1 :\n\n{body}" if body else "Document 1 :"

    doc1_body, doc2_rest = docs.split(doc2_marker, 1)
    doc1_body = doc1_body.strip()
    doc2_body = doc2_rest.strip()
    return f"Document 1 :\n\n{doc1_body}\n\nDocument 2 :\n\n{doc2_body}"


def _split_task3(raw: str) -> tuple[str, str | None]:
    text = raw.strip()
    marker = "Document 1 :"
    if marker not in text:
        return text, None
    theme, docs = text.split(marker, 1)
    theme = theme.strip()
    stimulus = _format_task3_stimulus(docs)
    prompt = f"{theme}\n\n{TASK3_INSTRUCTION}" if theme else TASK3_INSTRUCTION
    return prompt, stimulus


def _extract_task(pattern: re.Pattern[str], block: str, label: str) -> str:
    match = pattern.search(block)
    if not match:
        raise ValueError(f"Missing {label} in combination block")
    return match.group("text").strip()


def parse_tcf_writing_file(path: Path, source_name: str | None = None) -> list[dict]:
    label = source_name or path.stem
    text = path.read_text(encoding="utf-8")
    parts = re.split(r"Combinaison\s+(\d+):", text)
    rows: list[dict] = []

    for i in range(1, len(parts), 2):
        source_combo = int(parts[i])
        block = parts[i + 1]
        task1 = _extract_task(_TASK1_RE, block, "Task1")
        task2 = _extract_task(_TASK2_RE, block, "Task2")
        task3_raw = _extract_task(_TASK3_RE, block, "Task3")
        task3_prompt, task3_stimulus = _split_task3(task3_raw)

        tasks = [
            {"section_id": "1", "prompt": task1},
            {"section_id": "2", "prompt": task2},
            {"section_id": "3", "prompt": task3_prompt},
        ]
        if task3_stimulus:
            tasks[2]["stimulus"] = task3_stimulus

        rows.append({
            "exam_type": EXAM_TYPE,
            "skill": SKILL,
            "module_id": MODULE_ID,
            "source_combo": source_combo,
            "source_label": label,
            "prompt": task1,
            "difficulty": "B1",
            "duration_minutes": 60,
            "question_type": "essay",
            "tier_required": "Free",
            "tasks": tasks,
        })

    rows.sort(key=lambda r: r["source_combo"])
    if not rows:
        raise ValueError(f"No combinations parsed from {path}")
    return rows
