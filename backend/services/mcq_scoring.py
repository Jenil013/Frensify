"""MCQ (+1/0) raw score → CEFR for TCF (39 Q) and TEF (40 Q) comprehension modules."""

from __future__ import annotations

TCF_MAX = 39
TEF_MAX = 40

# TCF Canada / TCF — raw correct out of 39.
MCQ_CEFR_BANDS_39: list[tuple[int, int, str]] = [
    (0, 14, "A1"),
    (15, 20, "A2"),
    (21, 27, "B1"),
    (28, 32, "B2"),
    (33, 37, "C1"),
    (38, 39, "C2"),
]

# TEF comprehension — raw correct out of 40 (C2 band extended to 38–40).
MCQ_CEFR_BANDS_40: list[tuple[int, int, str]] = [
    (0, 14, "A1"),
    (15, 20, "A2"),
    (21, 27, "B1"),
    (28, 32, "B2"),
    (33, 37, "C1"),
    (38, 40, "C2"),
]


def _bands_for_max(max_score: int) -> list[tuple[int, int, str]]:
    if max_score == TEF_MAX:
        return MCQ_CEFR_BANDS_40
    if max_score == TCF_MAX:
        return MCQ_CEFR_BANDS_39
    # Fallback: scale onto the /39 table for non-standard totals.
    return MCQ_CEFR_BANDS_39


def _clamp_raw(raw: int, max_score: int) -> int:
    if max_score <= 0:
        return 0
    if max_score in (TCF_MAX, TEF_MAX):
        return max(0, min(max_score, raw))
    scaled = round((raw / max_score) * TCF_MAX)
    return max(0, min(TCF_MAX, scaled))


def estimate_mcq_cefr(raw: int, max_score: int) -> str:
    if max_score <= 0:
        return "A1"
    score = _clamp_raw(raw, max_score)
    lookup_max = TEF_MAX if max_score == TEF_MAX else TCF_MAX
    bands = _bands_for_max(lookup_max)
    for low, high, level in bands:
        if low <= score <= high:
            return level
    return "C2"


def format_mcq_score_label(raw: int, max_score: int) -> str:
    cefr = estimate_mcq_cefr(raw, max_score)
    return f"{raw}/{max_score} ({cefr})"
