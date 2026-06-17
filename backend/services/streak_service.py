from datetime import date, timedelta


def _parse_activity_date(value: str | None) -> date | None:
    if not value:
        return None
    return date.fromisoformat(value[:10])


def effective_streak_days(stored_streak: int, last_active: str | None) -> int:
    """Return stored streak only if last practice was today or yesterday."""
    if stored_streak <= 0 or not last_active:
        return 0
    last = _parse_activity_date(last_active)
    if last is None:
        return 0
    gap = (date.today() - last).days
    if gap <= 1:
        return stored_streak
    return 0


def _dates_from_rows(rows: list[dict], field: str) -> set[date]:
    dates: set[date] = set()
    for row in rows:
        parsed = _parse_activity_date(row.get(field))
        if parsed is not None:
            dates.add(parsed)
    return dates


def collect_activity_dates(db, user_id: str) -> set[date]:
    dates: set[date] = set()
    activity_tables = (
        ("completed_exercises", "completed_at"),
        ("module_scores", "taken_at"),
        ("mock_test_scores", "taken_at"),
        ("writing_submissions", "submitted_at"),
        ("speaking_sessions", "submitted_at"),
    )
    for table, column in activity_tables:
        result = (
            db.table(table).select(column).eq("user_id", user_id).execute()
        )
        dates |= _dates_from_rows(result.data or [], column)

    vocab = (
        db.table("user_vocabulary_progress")
        .select("last_reviewed_at")
        .eq("user_id", user_id)
        .execute()
    )
    dates |= _dates_from_rows(vocab.data or [], "last_reviewed_at")
    return dates


def streak_from_dates(
    active_dates: set[date],
    today: date | None = None,
) -> tuple[int, date | None]:
    if not active_dates:
        return 0, None

    today = today or date.today()
    yesterday = today - timedelta(days=1)
    if today in active_dates:
        anchor = today
    elif yesterday in active_dates:
        anchor = yesterday
    else:
        return 0, max(active_dates)

    streak = 0
    cursor = anchor
    while cursor in active_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak, anchor


def sync_profile_streak(
    db,
    user_id: str,
    streak_days: int,
    last_active_date: date | None,
) -> None:
    patch: dict = {"streak_days": streak_days}
    if last_active_date is not None:
        patch["last_active_date"] = last_active_date.isoformat()
    db.table("profiles").update(patch).eq("id", user_id).execute()


def compute_streak_from_activity(db, user_id: str) -> tuple[int, date | None]:
    return streak_from_dates(collect_activity_dates(db, user_id))


def get_display_streak(db, profile: dict) -> int:
    user_id = profile["id"]
    stored = profile.get("streak_days") or 0
    last_active = profile.get("last_active_date")

    effective = effective_streak_days(stored, last_active)
    if effective > 0:
        return effective

    computed, anchor = compute_streak_from_activity(db, user_id)
    if computed > 0 and (
        computed != stored or last_active != (anchor.isoformat() if anchor else None)
    ):
        sync_profile_streak(db, user_id, computed, anchor)
    return computed


def record_practice_day(db, profile: dict) -> int:
    """Call after qualifying practice so the streak advances for today."""
    user_id = profile["id"]
    today = date.today()
    today_iso = today.isoformat()
    last_active = profile.get("last_active_date")
    current = profile.get("streak_days") or 0

    if last_active == today_iso:
        return current

    if last_active:
        gap = (today - date.fromisoformat(last_active[:10])).days
        new_streak = current + 1 if gap == 1 else 1
    else:
        new_streak = 1

    sync_profile_streak(db, user_id, new_streak, today)
    return new_streak
