from collections import defaultdict, deque
from time import monotonic

from fastapi import Depends, HTTPException

from ai_limits import AI_RATE_LIMIT_MAX_REQUESTS, AI_RATE_LIMIT_WINDOW_SEC
from dependencies import get_profile

_store: dict[str, deque[float]] = defaultdict(deque)


def reset_ai_rate_limits() -> None:
    """Clear in-memory counters (for tests)."""
    _store.clear()


def check_ai_rate_limit(profile: dict) -> None:
    user_id = profile["id"]
    now = monotonic()
    timestamps = _store[user_id]
    while timestamps and now - timestamps[0] > AI_RATE_LIMIT_WINDOW_SEC:
        timestamps.popleft()
    if len(timestamps) >= AI_RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many AI requests. Please wait a moment and try again.",
        )
    timestamps.append(now)


async def require_ai_rate_limit(profile: dict = Depends(get_profile)) -> dict:
    check_ai_rate_limit(profile)
    return profile
