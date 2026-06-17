"""Per-module accuracy from the last 3 practice + mock attempts."""

from __future__ import annotations

from typing import Any

from services.mcq_scoring import estimate_mcq_cefr
from services.recent_tests import (
    CEFR_ORDER,
    _aggregate_section_rows,
    _average_cefr,
    _cefr_pct,
    _normalize_cefr,
    _parse_ts,
)

MODULE_IDS = (
    "comprehension-orale",
    "comprehension-ecrite",
    "expression-ecrite",
    "expression-orale",
)

LAST_N_ATTEMPTS = 3


def _pct_from_raw(raw: int, maximum: int) -> int:
    if maximum <= 0:
        return 0
    return round((raw / maximum) * 100)


def _cefr_from_pct(pct: int) -> str:
    if pct >= 92:
        return "C2"
    if pct >= 82:
        return "C1"
    if pct >= 70:
        return "B2"
    if pct >= 55:
        return "B1"
    if pct >= 45:
        return "A2"
    return "A1"


def _attempt(
    *,
    module_id: str,
    taken_at: str,
    score_pct: int | None,
    cefr: str | None,
) -> dict[str, Any] | None:
    if score_pct is None and cefr:
        score_pct = _cefr_pct(cefr)
    if score_pct is None:
        return None
    normalized = _normalize_cefr(cefr) or _cefr_from_pct(score_pct)
    return {
        "moduleId": module_id,
        "takenAt": taken_at,
        "scorePct": score_pct,
        "cefr": normalized,
    }


def _module_scores_attempts(db, user_id: str, exam_type: str) -> list[dict[str, Any]]:
    result = (
        db.table("module_scores")
        .select("module_id,raw_score,max_score,exam_context,taken_at")
        .eq("user_id", user_id)
        .eq("exam_type", exam_type)
        .order("taken_at", desc=True)
        .execute()
    )
    attempts: list[dict[str, Any]] = []
    for row in result.data or []:
        module_id = row.get("module_id")
        if module_id not in MODULE_IDS:
            continue
        raw = row["raw_score"]
        maximum = row["max_score"]
        cefr = estimate_mcq_cefr(raw, maximum)
        item = _attempt(
            module_id=module_id,
            taken_at=row["taken_at"],
            score_pct=_pct_from_raw(raw, maximum),
            cefr=cefr,
        )
        if item:
            attempts.append(item)
    return attempts


def _mock_breakdown_attempts(db, user_id: str, exam_type: str) -> list[dict[str, Any]]:
    result = (
        db.table("mock_test_scores")
        .select("module_breakdown,taken_at,exam_name")
        .eq("user_id", user_id)
        .order("taken_at", desc=True)
        .execute()
    )
    attempts: list[dict[str, Any]] = []
    for mock in result.data or []:
        exam_name = mock.get("exam_name") or ""
        if exam_type.upper() not in exam_name.upper():
            continue
        taken_at = mock["taken_at"]
        for mod in mock.get("module_breakdown") or []:
            module_id = mod.get("moduleId") or mod.get("module_id")
            if not module_id or module_id not in MODULE_IDS:
                continue
            if mod.get("scorePct") is not None:
                pct = int(mod["scorePct"])
                cefr = _normalize_cefr(mod.get("cefr"))
            elif mod.get("rawScore") is not None and mod.get("maxScore"):
                raw = int(mod["rawScore"])
                maximum = int(mod["maxScore"])
                pct = _pct_from_raw(raw, maximum)
                cefr = estimate_mcq_cefr(raw, maximum)
            elif mod.get("sectionCefr"):
                section_cefrs = [
                    v for v in mod["sectionCefr"].values() if v
                ]
                cefr = _average_cefr(section_cefrs)
                pct = _cefr_pct(cefr)
            else:
                continue
            item = _attempt(
                module_id=module_id,
                taken_at=taken_at,
                score_pct=pct,
                cefr=cefr,
            )
            if item:
                attempts.append(item)
    return attempts


def _expression_attempts_from_rows(
    rows: list[dict[str, Any]],
    *,
    cefr_field: str,
    time_field: str,
    module_id: str,
    exam_type: str,
) -> list[dict[str, Any]]:
    filtered = [
        row for row in rows if (row.get("exam_type") or "").upper() == exam_type
    ]
    aggregated = _aggregate_section_rows(
        filtered,
        cefr_field=cefr_field,
        time_field=time_field,
        kind="practice",
    )
    attempts: list[dict[str, Any]] = []
    for row in aggregated:
        cefr = _normalize_cefr(
            row["scoreLabel"] if row["scoreLabel"] != "—" else None
        )
        item = _attempt(
            module_id=module_id,
            taken_at=row["takenAt"],
            score_pct=row.get("scorePct"),
            cefr=cefr,
        )
        if item:
            attempts.append(item)
    return attempts


def _writing_attempts(db, user_id: str, exam_type: str) -> list[dict[str, Any]]:
    result = (
        db.table("writing_submissions")
        .select("id,exercise_id,exam_type,cefr_score,submitted_at")
        .eq("user_id", user_id)
        .eq("exam_type", exam_type)
        .order("submitted_at", desc=True)
        .execute()
    )
    return _expression_attempts_from_rows(
        result.data or [],
        cefr_field="cefr_score",
        time_field="submitted_at",
        module_id="expression-ecrite",
        exam_type=exam_type,
    )


def _speaking_attempts(db, user_id: str, exam_type: str) -> list[dict[str, Any]]:
    result = (
        db.table("speaking_sessions")
        .select("id,exercise_id,exam_type,cefr_level,submitted_at")
        .eq("user_id", user_id)
        .eq("exam_type", exam_type)
        .order("submitted_at", desc=True)
        .execute()
    )
    return _expression_attempts_from_rows(
        result.data or [],
        cefr_field="cefr_level",
        time_field="submitted_at",
        module_id="expression-orale",
        exam_type=exam_type,
    )


def _average_cefr_from_attempts(attempts: list[dict[str, Any]]) -> str | None:
    levels = [a["cefr"] for a in attempts if a.get("cefr")]
    if not levels:
        return None
    indices = [CEFR_ORDER.index(level) for level in levels if level in CEFR_ORDER]
    if not indices:
        return None
    avg_index = round(sum(indices) / len(indices))
    return CEFR_ORDER[min(avg_index, len(CEFR_ORDER) - 1)]


def build_module_accuracy(
    db,
    user_id: str,
    exam_type: str,
    *,
    last_n: int = LAST_N_ATTEMPTS,
) -> dict[str, dict[str, Any]]:
    exam_key = exam_type.upper()
    all_attempts: list[dict[str, Any]] = []
    all_attempts.extend(_module_scores_attempts(db, user_id, exam_key))
    all_attempts.extend(_mock_breakdown_attempts(db, user_id, exam_key))
    all_attempts.extend(_writing_attempts(db, user_id, exam_key))
    all_attempts.extend(_speaking_attempts(db, user_id, exam_key))

    by_module: dict[str, list[dict[str, Any]]] = {mid: [] for mid in MODULE_IDS}
    for attempt in all_attempts:
        by_module[attempt["moduleId"]].append(attempt)

    summary: dict[str, dict[str, Any]] = {}
    for module_id in MODULE_IDS:
        attempts = sorted(
            by_module[module_id],
            key=lambda row: _parse_ts(row["takenAt"]),
            reverse=True,
        )[:last_n]
        if not attempts:
            summary[module_id] = {
                "accuracyPct": None,
                "cefr": None,
                "sampleSize": 0,
                "hasData": False,
            }
            continue
        avg_pct = round(
            sum(a["scorePct"] for a in attempts) / len(attempts)
        )
        summary[module_id] = {
            "accuracyPct": avg_pct,
            "cefr": _average_cefr_from_attempts(attempts) or _cefr_from_pct(avg_pct),
            "sampleSize": len(attempts),
            "hasData": True,
        }
    return summary
