from datetime import date, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from config import MOCK_CAPS, TIER_CAPS
from database import get_db
from dependencies import get_profile
from services.usage_service import get_weekly_usage

router = APIRouter(tags=["usage"])


def _monday(d: date | None = None) -> date:
    today = d or date.today()
    return today - timedelta(days=today.weekday())


class WeeklyUsageOut(BaseModel):
    writing_eval: int
    speaking_eval: int
    vocab_explain: int


class WeeklyCapsOut(BaseModel):
    writing_eval: int
    speaking_eval: int
    vocab_explain: int


class CanStartOut(BaseModel):
    writing_practice: bool
    speaking_practice: bool
    mock_exam: bool


class UsageLimitsResponse(BaseModel):
    tier: str
    week_start: str
    month_start: str
    weekly_usage: WeeklyUsageOut
    weekly_caps: WeeklyCapsOut
    monthly_mock_usage: int
    monthly_mock_cap: int
    can_start: CanStartOut


def _under_cap(count: int, cap: int | None) -> bool:
    if cap is None:
        return True
    return count < cap


def _build_limits(profile: dict, db) -> UsageLimitsResponse:
    tier = profile["tier"]
    caps = TIER_CAPS.get(tier, TIER_CAPS["Free"])
    mock_cap = MOCK_CAPS.get(tier, 0)

    week_start = _monday()
    usage_row = get_weekly_usage(db, profile["id"], week_start)

    writing_count = usage_row.get("writing_eval_count", 0)
    speaking_count = usage_row.get("speaking_eval_count", 0)
    vocab_count = usage_row.get("vocab_explain_count", 0)

    month_start = date.today().replace(day=1)
    mock_result = (
        db.table("mock_test_scores")
        .select("id", count="exact")
        .eq("user_id", profile["id"])
        .gte("taken_at", month_start.isoformat())
        .execute()
    )
    mock_usage = mock_result.count or 0

    return UsageLimitsResponse(
        tier=tier,
        week_start=week_start.isoformat(),
        month_start=month_start.isoformat(),
        weekly_usage=WeeklyUsageOut(
            writing_eval=writing_count,
            speaking_eval=speaking_count,
            vocab_explain=vocab_count,
        ),
        weekly_caps=WeeklyCapsOut(
            writing_eval=caps["writing_eval"],
            speaking_eval=caps["speaking_eval"],
            vocab_explain=caps["vocab_explain"],
        ),
        monthly_mock_usage=mock_usage,
        monthly_mock_cap=mock_cap,
        can_start=CanStartOut(
            writing_practice=_under_cap(writing_count, caps["writing_eval"]),
            speaking_practice=_under_cap(speaking_count, caps["speaking_eval"]),
            mock_exam=_under_cap(mock_usage, mock_cap),
        ),
    )


@router.get("/usage/limits", response_model=UsageLimitsResponse)
async def get_usage_limits(
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    return _build_limits(profile, db)
