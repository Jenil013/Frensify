from datetime import date, timedelta
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt as pyjwt
from auth_jwt import decode_supabase_access_token
from config import settings, TIER_CAPS, MOCK_CAPS
from database import get_db

_bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    try:
        return decode_supabase_access_token(credentials.credentials)
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")


async def get_profile(
    user: dict = Depends(get_current_user),
    db=Depends(get_db),
) -> dict:
    result = (
        db.table("profiles")
        .select("*")
        .eq("id", user["sub"])
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return result.data


def _get_monday(d: date) -> date:
    return d - timedelta(days=d.weekday())


def require_ai_cap(endpoint: str, context: str = "practice"):
    """Factory dependency. Checks tier cap before every AI call."""
    async def check(
        profile: dict = Depends(get_profile),
        db=Depends(get_db),
    ) -> dict:
        tier = profile["tier"]

        if context == "mock":
            month_start = date.today().replace(day=1)
            result = (
                db.table("mock_test_scores")
                .select("id", count="exact")
                .eq("user_id", profile["id"])
                .gte("taken_at", month_start.isoformat())
                .execute()
            )
            cap = MOCK_CAPS.get(tier, 0)
            if result.count >= cap:
                raise HTTPException(
                    status_code=403,
                    detail="Monthly mock test limit reached. Resets on the 1st.",
                )
        else:
            week_start = _get_monday(date.today())
            result = (
                db.table("weekly_usage")
                .select("*")
                .eq("user_id", profile["id"])
                .eq("week_start", week_start.isoformat())
                .single()
                .execute()
            )
            usage = result.data or {}
            count = usage.get(f"{endpoint}_count", 0)
            cap = TIER_CAPS[tier][endpoint]
            if cap is not None and count >= cap:
                raise HTTPException(
                    status_code=429,
                    detail=f"Weekly {endpoint} limit reached. Resets Monday.",
                )

        return profile

    return check
