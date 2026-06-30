"""Shared MCQ sampling logic for exam modules (Pro/Max random + free-set generation)."""

import random

LISTENING_MODULE_ID = "comprehension-orale"
READING_MODULE_ID = "comprehension-ecrite"

LISTENING_IMAGE_FRONT_COUNT: dict[str, int] = {
    "TCF": 3,
    "TEF": 4,
}

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


def sample_listening_rows(rows: list[dict], count: int, exam_type: str) -> list[dict]:
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
