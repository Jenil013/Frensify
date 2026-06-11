"""Vocabulary deck selection, review queue, and analytics-driven suggestions."""

from __future__ import annotations

import re
from datetime import date, datetime, timedelta, timezone
from typing import Any

CEFR_ORDER = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}

WEAK_CATEGORY_MAP: dict[str, list[str]] = {
    "A1": ["Argument connectors", "Cause / consequence"],
    "A2": ["Argument connectors", "Cause / consequence"],
    "B1": ["Argument connectors", "Formal register"],
    "B2": ["Formal register", "Oral — convince / argue"],
    "C1": ["Formal register", "Oral — convince / argue"],
    "C2": ["Formal register"],
}

MASTERED_RECALL_THRESHOLD = 3
DAILY_REVIEW_GOAL = 5


def parse_cefr_level(value: str | None) -> str | None:
    if not value:
        return None
    match = re.match(r"^(A1|A2|B1|B2|C1|C2)\b", value.strip(), re.IGNORECASE)
    return match.group(1).upper() if match else None


def cefr_index(level: str | None) -> int:
    return CEFR_ORDER.get((level or "").upper(), 0)


def difficulty_in_band(difficulty: str, target: str, spread: int = 1) -> bool:
    target_idx = cefr_index(target)
    diff_idx = cefr_index(difficulty)
    if target_idx == 0 or diff_idx == 0:
        return True
    return abs(diff_idx - target_idx) <= spread


def exam_matches(card_exam_type: str, user_exam: str) -> bool:
    normalized = (card_exam_type or "both").upper()
    user = (user_exam or "TEF").upper()
    return normalized == "BOTH" or normalized == user


def merge_card_with_progress(card: dict, progress: dict | None) -> dict:
    merged = dict(card)
    prog = progress or {}
    merged["mastered"] = bool(prog.get("mastered", False))
    merged["last_reviewed_at"] = prog.get("last_reviewed_at")
    merged["review_count"] = int(prog.get("review_count") or 0)
    merged["ease"] = int(prog.get("ease") or 0)
    return merged


def _review_sort_key(card: dict) -> tuple:
    last = card.get("last_reviewed_at")
    never_reviewed = last is None
    last_ts = datetime.min.replace(tzinfo=timezone.utc)
    if last:
        try:
            last_ts = datetime.fromisoformat(last.replace("Z", "+00:00"))
        except ValueError:
            pass
    return (0 if never_reviewed else 1, last_ts, card.get("review_count") or 0, card.get("word") or "")


def select_review_cards(
    cards: list[dict],
    *,
    exam_type: str,
    target_score: str,
    categories: list[str] | None = None,
    limit: int = 5,
) -> list[dict]:
    pool: list[dict] = []
    for card in cards:
        if card.get("mastered"):
            continue
        if not exam_matches(card.get("exam_type", "both"), exam_type):
            continue
        if categories and card.get("category") not in categories:
            continue
        if not difficulty_in_band(card.get("difficulty", "B2"), target_score):
            continue
        pool.append(card)

    pool.sort(key=_review_sort_key)
    return pool[:limit]


def apply_review_result(
    existing: dict | None,
    review_result: str,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    base = existing or {
        "mastered": False,
        "review_count": 0,
        "ease": 0,
        "last_reviewed_at": None,
    }
    review_count = int(base.get("review_count") or 0)
    mastered = bool(base.get("mastered", False))

    if review_result == "got_it":
        review_count += 1
        if review_count >= MASTERED_RECALL_THRESHOLD:
            mastered = True
    elif review_result == "again":
        review_count = max(0, review_count - 1)
        mastered = False

    return {
        "mastered": mastered,
        "review_count": review_count,
        "ease": int(base.get("ease") or 0),
        "last_reviewed_at": now,
        "updated_at": now,
    }


def _week_start() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


def _today_start_utc() -> datetime:
    today = date.today()
    return datetime(today.year, today.month, today.day, tzinfo=timezone.utc)


def compute_review_stats(progress_rows: list[dict]) -> dict:
    today_start = _today_start_utc()
    week_start = _week_start()
    reviewed_today = 0
    reviewed_this_week = 0

    for row in progress_rows:
        last = row.get("last_reviewed_at")
        if not last:
            continue
        try:
            ts = datetime.fromisoformat(last.replace("Z", "+00:00"))
        except ValueError:
            continue
        if ts >= today_start:
            reviewed_today += 1
        if ts.date() >= week_start:
            reviewed_this_week += 1

    return {
        "reviewed_today": reviewed_today,
        "reviewed_this_week": reviewed_this_week,
        "daily_goal": DAILY_REVIEW_GOAL,
        "daily_complete": reviewed_today >= DAILY_REVIEW_GOAL,
    }


def _extract_writing_vocab_level(feedback: dict) -> str | None:
    dims = feedback.get("dimensionScores") or {}
    return parse_cefr_level(dims.get("vocabulary"))


def _extract_speaking_vocab_level(feedback: dict) -> str | None:
    level = parse_cefr_level(feedback.get("cefrLevel"))
    if level:
        return level
    return parse_cefr_level(feedback.get("grammarAndVocab"))


def compute_vocab_suggestions(
    *,
    target_score: str,
    writing_submissions: list[dict],
    speaking_sessions: list[dict],
) -> dict | None:
    target_idx = cefr_index(target_score)
    if target_idx == 0:
        return None

    threshold_idx = max(1, target_idx - 1)
    weak_writing = 0
    weak_speaking = 0
    levels: list[str] = []

    for row in writing_submissions[:10]:
        feedback = row.get("ai_feedback") or {}
        level = _extract_writing_vocab_level(feedback)
        if level:
            levels.append(level)
            if cefr_index(level) <= threshold_idx:
                weak_writing += 1

    for row in speaking_sessions[:10]:
        feedback = row.get("ai_feedback") or {}
        level = _extract_speaking_vocab_level(feedback)
        if level:
            levels.append(level)
            if cefr_index(level) <= threshold_idx:
                weak_speaking += 1

    weak_total = weak_writing + weak_speaking
    if weak_total < 2:
        return None

    weakest = min(levels, key=cefr_index) if levels else target_score
    categories = WEAK_CATEGORY_MAP.get(weakest, WEAK_CATEGORY_MAP["B1"])

    source = "both"
    if weak_writing >= 2 and weak_speaking >= 2:
        source = "both"
    elif weak_writing >= 2:
        source = "writing"
    elif weak_speaking >= 2:
        source = "speaking"

    if source == "writing":
        reason = (
            f"Recent writing feedback shows vocabulary around {weakest} — "
            "connector and register drills will help raise your Expression écrite score."
        )
    elif source == "speaking":
        reason = (
            f"Recent speaking practice suggests lexical range around {weakest} — "
            "review oral argument phrases before your next simulation."
        )
    else:
        reason = (
            f"Vocabulary has appeared below your {target_score} target in recent practice — "
            "a short connector deck is your best next step."
        )

    return {
        "suggested_categories": categories[:2],
        "reason": reason,
        "source": source,
        "weakest_level": weakest,
    }
