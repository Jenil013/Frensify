"""Build a unified recent-tests feed for the dashboard."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from services.mcq_scoring import estimate_mcq_cefr, format_mcq_score_label

MODULE_LABELS: dict[str, str] = {
    "comprehension-orale": "Compréhension orale",
    "comprehension-ecrite": "Compréhension écrite",
    "expression-ecrite": "Expression écrite",
    "expression-orale": "Expression orale",
}

CEFR_TO_PCT: dict[str, int] = {
    "A1": 35,
    "A2": 45,
    "B1": 55,
    "B2": 70,
    "C1": 82,
    "C2": 92,
}

CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]

RECENT_LIMIT = 12
# Max pause between sections in the same module attempt.
SECTION_GAP_SECONDS = 20 * 60
FETCH_MULTIPLIER = 5

EXPECTED_MODULE_SECTIONS: dict[tuple[str, str], frozenset[str]] = {
    ("TCF", "expression-ecrite"): frozenset({"1", "2", "3"}),
    ("TEF", "expression-ecrite"): frozenset({"A", "B"}),
    ("TCF", "expression-orale"): frozenset({"1", "2", "3"}),
    ("TEF", "expression-orale"): frozenset({"A", "B"}),
}


def _module_label(module_id: str) -> str:
    return MODULE_LABELS.get(
        module_id, module_id.replace("-", " ").title()
    )


def _label_from_exercise_id(exercise_id: str) -> str:
    lowered = exercise_id.lower()
    for key, label in MODULE_LABELS.items():
        if key in lowered:
            return label
    return "Practice"


def _parse_ts(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    if "T" not in normalized and " " in normalized:
        normalized = normalized.replace(" ", "T", 1)
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _parse_exercise(
    exercise_id: str, exam_type: str | None = None
) -> tuple[str, str | None, str | None, str | None]:
    """Return (module_key, section_id, exam_type, module_id)."""
    structured = re.match(
        r"^(TCF|TEF)-(expression-ecrite|expression-orale)-(.+)$",
        exercise_id,
        re.IGNORECASE,
    )
    if structured:
        exam = structured.group(1).upper()
        module_id = structured.group(2).lower()
        section_id = structured.group(3).upper()
        return f"{exam}-{module_id}", section_id, exam, module_id

    digit_suffix = re.match(r"^(.*)-(\d+)$", exercise_id)
    if digit_suffix:
        return (
            digit_suffix.group(1),
            digit_suffix.group(2),
            exam_type.upper() if exam_type else None,
            "expression-orale",
        )

    letter_suffix = re.match(r"^(.*)-([AB])$", exercise_id, re.IGNORECASE)
    if letter_suffix:
        return (
            letter_suffix.group(1),
            letter_suffix.group(2).upper(),
            exam_type.upper() if exam_type else None,
            "expression-orale",
        )

    return exercise_id, None, exam_type.upper() if exam_type else None, None


def _expected_sections(
    exam_type: str | None, module_id: str | None
) -> frozenset[str] | None:
    if exam_type and module_id:
        return EXPECTED_MODULE_SECTIONS.get((exam_type, module_id))
    return None


def _session_complete(
    sections_seen: set[str], expected: frozenset[str] | None
) -> bool:
    if not expected or not sections_seen:
        return False
    return expected.issubset(sections_seen)


def _practice_subtitle(exam_type: str | None) -> str:
    if exam_type:
        return f"{exam_type} · Practice"
    return "Practice"


def _module_subtitle(exam_type: str | None, context: str) -> str:
    if context == "mock":
        return f"{exam_type} · Mock" if exam_type else "Mock exam"
    return _practice_subtitle(exam_type)


def _session_exam_name(module_key: str, module_id: str | None) -> str:
    if module_id:
        return _module_label(module_id)
    return _label_from_exercise_id(module_key)


def _normalize_cefr(cefr: str | None) -> str | None:
    if not cefr:
        return None
    level = cefr.strip().upper()[:2]
    return level if level in CEFR_TO_PCT else None


def _average_cefr(cefrs: list[str]) -> str | None:
    levels = [level for level in (_normalize_cefr(c) for c in cefrs) if level]
    if not levels:
        return None
    indices = [CEFR_ORDER.index(level) for level in levels]
    avg_index = round(sum(indices) / len(indices))
    return CEFR_ORDER[min(avg_index, len(CEFR_ORDER) - 1)]


def _cefr_pct(cefr: str | None) -> int | None:
    normalized = _normalize_cefr(cefr)
    if normalized is None:
        return None
    return CEFR_TO_PCT[normalized]


def _row(
    *,
    row_id: str,
    kind: str,
    exam_name: str,
    subtitle: str | None,
    taken_at: str,
    score_label: str,
    score_pct: int | None,
) -> dict[str, Any]:
    return {
        "id": row_id,
        "kind": kind,
        "examName": exam_name,
        "subtitle": subtitle,
        "takenAt": taken_at,
        "scoreLabel": score_label,
        "scorePct": score_pct,
    }


def _aggregate_section_rows(
    items: list[dict],
    *,
    cefr_field: str,
    time_field: str,
    kind: str,
) -> list[dict[str, Any]]:
    """Merge per-section writing/oral rows into one row per module attempt."""
    if not items:
        return []

    sorted_items = sorted(items, key=lambda row: _parse_ts(row[time_field]))
    sessions: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    for item in sorted_items:
        module_key, section_id, exam_type, module_id = _parse_exercise(
            item["exercise_id"], item.get("exam_type")
        )
        expected = _expected_sections(exam_type, module_id)
        ts = _parse_ts(item[time_field])
        cefr = item.get(cefr_field)

        start_new = (
            current is None
            or module_key != current["module_key"]
            or _session_complete(current["sections_seen"], current["expected"])
            or (ts - current["last_ts"]).total_seconds() > SECTION_GAP_SECONDS
        )

        if start_new:
            if current is not None:
                sessions.append(current)
            current = {
                "module_key": module_key,
                "module_id": module_id,
                "exam_type": exam_type,
                "expected": expected,
                "items": [item],
                "sections_seen": {section_id} if section_id else set(),
                "last_ts": ts,
                "cefrs": [cefr] if cefr else [],
            }
        else:
            current["items"].append(item)
            current["last_ts"] = ts
            if section_id:
                current["sections_seen"].add(section_id)
            if cefr:
                current["cefrs"].append(cefr)
            if exam_type and not current["exam_type"]:
                current["exam_type"] = exam_type

    if current is not None:
        sessions.append(current)

    rows: list[dict[str, Any]] = []
    for session in sessions:
        section_items = session["items"]
        latest = max(section_items, key=lambda row: _parse_ts(row[time_field]))
        overall_cefr = _average_cefr(session["cefrs"])

        rows.append(
            _row(
                row_id=f"{kind}:{section_items[0]['id']}",
                kind=kind,
                exam_name=_session_exam_name(
                    session["module_key"], session["module_id"]
                ),
                subtitle=_practice_subtitle(session["exam_type"]),
                taken_at=latest[time_field],
                score_label=overall_cefr or "—",
                score_pct=_cefr_pct(overall_cefr),
            )
        )

    return rows


def build_recent_tests(db, user_id: str, limit: int = RECENT_LIMIT) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []

    mocks = (
        db.table("mock_test_scores")
        .select("id,exam_name,score_pct,cefr,taken_at")
        .eq("user_id", user_id)
        .order("taken_at", desc=True)
        .limit(limit)
        .execute()
    )
    for item in mocks.data or []:
        rows.append(
            _row(
                row_id=f"mock:{item['id']}",
                kind="full_mock",
                exam_name="Full Mock",
                subtitle=item["exam_name"],
                taken_at=item["taken_at"],
                score_label=f"{item['score_pct']}%",
                score_pct=item["score_pct"],
            )
        )

    modules = (
        db.table("module_scores")
        .select("id,module_id,exam_type,raw_score,max_score,exam_context,taken_at")
        .eq("user_id", user_id)
        .order("taken_at", desc=True)
        .limit(limit)
        .execute()
    )
    for item in modules.data or []:
        raw = item["raw_score"]
        maximum = item["max_score"]
        cefr = estimate_mcq_cefr(raw, maximum)
        context = item.get("exam_context") or "practice"
        exam_type = item.get("exam_type")
        rows.append(
            _row(
                row_id=f"module:{item['id']}",
                kind="practice",
                exam_name=_module_label(item["module_id"]),
                subtitle=_module_subtitle(exam_type, context),
                taken_at=item["taken_at"],
                score_label=format_mcq_score_label(raw, maximum),
                score_pct=_cefr_pct(cefr),
            )
        )

    fetch_limit = max(limit * FETCH_MULTIPLIER, 50)

    writing = (
        db.table("writing_submissions")
        .select("id,exercise_id,exam_type,cefr_score,submitted_at")
        .eq("user_id", user_id)
        .order("submitted_at", desc=True)
        .limit(fetch_limit)
        .execute()
    )
    rows.extend(
        _aggregate_section_rows(
            writing.data or [],
            cefr_field="cefr_score",
            time_field="submitted_at",
            kind="writing",
        )
    )

    speaking = (
        db.table("speaking_sessions")
        .select("id,exercise_id,exam_type,cefr_level,submitted_at")
        .eq("user_id", user_id)
        .order("submitted_at", desc=True)
        .limit(fetch_limit)
        .execute()
    )
    rows.extend(
        _aggregate_section_rows(
            speaking.data or [],
            cefr_field="cefr_level",
            time_field="submitted_at",
            kind="speaking",
        )
    )

    rows.sort(key=lambda r: r["takenAt"], reverse=True)
    return rows[:limit]
