from models.questions import QuestionItem

LISTENING_MODULE_ID = "comprehension-orale"
READING_MODULE_ID = "comprehension-ecrite"

MODULE_TABLE: dict[str, str] = {
    LISTENING_MODULE_ID: "listening_questions",
    READING_MODULE_ID: "reading_questions",
}


def map_row(row: dict) -> QuestionItem:
    return QuestionItem(
        id=str(row["id"]),
        prompt=row["prompt"],
        passage=row.get("passage"),
        audioUrl=row.get("audio_path"),
        imageUrl=row.get("image_path"),
        choices=row.get("choices") or [],
        correctChoiceIndex=row.get("correct_index") or 0,
        explanation=row.get("explanation"),
        difficulty=row.get("difficulty"),
    )
