from datetime import date


_ZERO_ROW = {
    "writing_eval_count":  0,
    "speaking_eval_count": 0,
    "vocab_explain_count": 0,
}


def get_weekly_usage(db, user_id: str, week_start: date) -> dict:
    """Return this week's usage row, or zero counts if none exists yet."""
    result = (
        db.table("weekly_usage")
        .select("*")
        .eq("user_id", user_id)
        .eq("week_start", week_start.isoformat())
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else dict(_ZERO_ROW)


def get_or_create_week(db, user_id: str, week_start: date) -> dict:
    return get_weekly_usage(db, user_id, week_start)


def increment(db, user_id: str, week_start: date, endpoint: str) -> None:
    col = f"{endpoint}_count"
    existing = get_or_create_week(db, user_id, week_start)
    new_count = existing.get(col, 0) + 1
    db.table("weekly_usage").upsert(
        {
            "user_id": user_id,
            "week_start": week_start.isoformat(),
            col: new_count,
        },
        on_conflict="user_id,week_start",
    ).execute()


def write_audit_log(db, user_id: str, endpoint: str, context: str) -> None:
    db.table("ai_usage_logs").insert(
        {"user_id": user_id, "endpoint": endpoint, "context": context}
    ).execute()
