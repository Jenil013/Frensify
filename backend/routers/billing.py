from fastapi import APIRouter, Depends, HTTPException
import stripe

from database import get_db
from dependencies import get_profile
from models.billing import CheckoutRequest, CheckoutResponse, PortalResponse
from services import stripe_service

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    body: CheckoutRequest,
    profile: dict = Depends(get_profile),
    db=Depends(get_db),
):
    try:
        url = stripe_service.create_checkout_session(db, profile, body.tier)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except stripe.error.StripeError as exc:
        raise HTTPException(
            status_code=502,
            detail=getattr(exc, "user_message", None) or str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to start checkout. Please try again.",
        ) from exc
    return CheckoutResponse(url=url)


@router.post("/portal", response_model=PortalResponse)
async def create_portal(
    profile: dict = Depends(get_profile),
):
    try:
        url = stripe_service.create_portal_session(profile)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to open billing portal. Please try again.",
        ) from exc
    return PortalResponse(url=url)
