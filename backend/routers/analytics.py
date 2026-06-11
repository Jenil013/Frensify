from datetime import date, timedelta
from fastapi import APIRouter, Depends
from database import get_db
from dependencies import get_profile

router = APIRouter(tags=["analytics"])


def _monday() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


@router.get("/analytics/summary")
async def analytics_summary(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    user_id = profile["id"]

    recent_mocks = (
        db.table("mock_test_scores")
        .select("score_pct,cefr,taken_at,exam_name")
        .eq("user_id", user_id)
        .order("taken_at", desc=True)
        .limit(5)
        .execute()
    )

    module_history = (
        db.table("module_scores")
        .select("module_id,raw_score,max_score,taken_at,exam_context")
        .eq("user_id", user_id)
        .order("taken_at", desc=True)
        .execute()
    )

    week_start = _monday()
    usage_result = (
        db.table("weekly_usage")
        .select("*")
        .eq("user_id", user_id)
        .eq("week_start", week_start.isoformat())
        .single()
        .execute()
    )
    weekly_usage = usage_result.data or {
        "writing_eval_count": 0,
        "speaking_eval_count": 0,
        "vocab_explain_count": 0,
    }

    return {
        "recentMockScores": recent_mocks.data,
        "moduleHistory": module_history.data,
        "weeklyUsage": weekly_usage,
        "streakDays": profile.get("streak_days", 0),
        "tier": profile.get("tier"),
    }
