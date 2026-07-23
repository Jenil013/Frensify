"""Shared MCQ sampling logic for exam modules (Pro/Max random + free-set generation)."""

import random

LISTENING_MODULE_ID = "comprehension-orale"
READING_MODULE_ID = "comprehension-ecrite"

LISTENING_IMAGE_FRONT_COUNT: dict[str, int] = {
    "TCF": 3,
    "TEF": 4,
}

# Official TCF compréhension orale ramp (39 items): image items open the exam,
# then CEFR bands by question index (1-based): 1–4 A1, 5–10 A2, 11–19 B1,
# 20–29 B2, 30–35 C1, 36–39 C2.
TCF_LISTENING_DIFFICULTY_BANDS: list[tuple[str, int]] = [
    ("A1", 4),
    ("A2", 6),
    ("B1", 9),
    ("B2", 10),
    ("C1", 6),
    ("C2", 4),
]

TEF_READING_DIFFICULTY_BANDS: list[tuple[str, int]] = [
    ("A1", 13),
    ("A2", 7),
    ("B1", 6),
    ("B2", 4),
    ("C1", 4),
    ("C2", 6),
]

TCF_READING_DIFFICULTY_BANDS: list[tuple[str, int]] = [
    ("A1", 13),
    ("A2", 7),
    ("B1", 6),
    ("B2", 4),
    ("C1", 4),
    ("C2", 5),
]

FREE_SET_QUESTION_COUNTS: dict[tuple[str, str], int] = {
    ("TCF", LISTENING_MODULE_ID): 39,
    ("TCF", READING_MODULE_ID): 39,
    ("TEF", LISTENING_MODULE_ID): 40,
    ("TEF", READING_MODULE_ID): 40,
}


def row_has_image(row: dict) -> bool:
    path = row.get("image_path")
    return bool(path and str(path).strip())


def _sample_from_pool(pool: list[dict], take: int) -> list[dict]:
    if take <= 0 or not pool:
        return []
    return random.sample(pool, min(take, len(pool)))


def sample_tcf_listening_rows(rows: list[dict], count: int) -> list[dict]:
    """Sample TCF listening: CEFR bands in order, with image items in Q1–Q3."""
    front_cap = LISTENING_IMAGE_FRONT_COUNT["TCF"]
    by_difficulty: dict[str, list[dict]] = {}
    for row in rows:
        difficulty = row.get("difficulty")
        if difficulty:
            by_difficulty.setdefault(difficulty, []).append(row)

    result: list[dict] = []
    used_ids: set = set()
    remaining = count

    for band_index, (difficulty, band_size) in enumerate(TCF_LISTENING_DIFFICULTY_BANDS):
        if remaining <= 0:
            break
        take = min(band_size, remaining)
        pool = [r for r in by_difficulty.get(difficulty, []) if r["id"] not in used_ids]
        if not pool:
            continue

        if band_index == 0:
            # A1 opens the module: prefer illustrated items for the first slots.
            image_pool = [r for r in pool if row_has_image(r)]
            other_pool = [r for r in pool if not row_has_image(r)]
            image_take = min(front_cap, take, len(image_pool))
            picked = _sample_from_pool(image_pool, image_take)
            picked.extend(_sample_from_pool(other_pool, take - len(picked)))
            # If still short (e.g. only images left), top up from leftover images.
            if len(picked) < take:
                leftover = [r for r in image_pool if r not in picked]
                picked.extend(_sample_from_pool(leftover, take - len(picked)))
        else:
            picked = _sample_from_pool(pool, take)

        result.extend(picked)
        used_ids.update(r["id"] for r in picked)
        remaining = count - len(result)

    if len(result) < count:
        filler = [r for r in rows if r["id"] not in used_ids]
        result.extend(_sample_from_pool(filler, count - len(result)))

    return result[:count]


def sample_listening_rows(rows: list[dict], count: int, exam_type: str) -> list[dict]:
    if exam_type == "TCF":
        return sample_tcf_listening_rows(rows, count)

    image_rows = [r for r in rows if row_has_image(r)]
    other_rows = [r for r in rows if not row_has_image(r)]

    front_cap = LISTENING_IMAGE_FRONT_COUNT.get(exam_type, 3)
    front_count = min(front_cap, len(image_rows), count)
    front = random.sample(image_rows, front_count) if front_count else []

    remaining = count - len(front)
    rest_pool = [r for r in other_rows if r not in front]
    rest_count = min(remaining, len(rest_pool))
    rest = random.sample(rest_pool, rest_count) if rest_count else []

    combined = front + rest
    if len(combined) < count:
        used_ids = {r["id"] for r in combined}
        filler = [r for r in rows if r["id"] not in used_ids]
        need = count - len(combined)
        combined.extend(random.sample(filler, min(need, len(filler))))

    return combined[:count]


def sample_reading_rows_by_bands(
    rows: list[dict],
    count: int,
    bands: list[tuple[str, int]],
) -> list[dict]:
    by_difficulty: dict[str, list[dict]] = {}
    for row in rows:
        difficulty = row.get("difficulty")
        if difficulty:
            by_difficulty.setdefault(difficulty, []).append(row)

    result: list[dict] = []
    remaining = count
    for difficulty, band_size in bands:
        if remaining <= 0:
            break
        take = min(band_size, remaining)
        pool = by_difficulty.get(difficulty, [])
        if not pool:
            continue
        result.extend(random.sample(pool, min(take, len(pool))))
        remaining -= min(take, len(pool))

    return result[:count]


def sample_module_rows(
    rows: list[dict],
    count: int,
    exam_type: str,
    module_id: str,
) -> list[dict]:
    if module_id == LISTENING_MODULE_ID:
        return sample_listening_rows(rows, count, exam_type)
    if module_id == READING_MODULE_ID and exam_type == "TEF":
        return sample_reading_rows_by_bands(rows, count, TEF_READING_DIFFICULTY_BANDS)
    if module_id == READING_MODULE_ID and exam_type == "TCF":
        return sample_reading_rows_by_bands(rows, count, TCF_READING_DIFFICULTY_BANDS)
    return random.sample(rows, min(count, len(rows)))
