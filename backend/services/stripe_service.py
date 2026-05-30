from __future__ import annotations

from typing import Any

import stripe

from config import PRICE_TO_TIER, TIER_TO_PRICE, settings

stripe.api_key = settings.stripe_secret_key

PAID_TIERS = frozenset({"Pro", "Max"})
ACTIVE_SUBSCRIPTION_STATUSES = frozenset({"active", "trialing"})


def _stripe_get(obj: Any, key: str, default: Any = None) -> Any:
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    try:
        return obj[key]
    except (KeyError, TypeError):
        return default


def _to_plain_dict(obj: Any) -> dict[str, Any]:
    if isinstance(obj, dict):
        return obj
    if hasattr(obj, "to_dict"):
        return obj.to_dict()
    return dict(obj)


def _stripe_metadata(obj: Any) -> dict[str, Any]:
    metadata = _stripe_get(obj, "metadata") or {}
    return _to_plain_dict(metadata) if metadata else {}


def ensure_stripe_customer(db, profile: dict) -> str:
    existing = profile.get("stripe_customer_id")
    if existing:
        return existing

    customer = stripe.Customer.create(
        metadata={"user_id": profile["id"]},
    )
    db.table("profiles").update({"stripe_customer_id": customer.id}).eq(
        "id", profile["id"]
    ).execute()
    return customer.id


def create_checkout_session(db, profile: dict, tier: str) -> str:
    if tier not in PAID_TIERS:
        raise ValueError(f"Invalid checkout tier: {tier}")

    price_id = TIER_TO_PRICE.get(tier)
    if not price_id:
        raise ValueError(f"Stripe price not configured for tier: {tier}")
    if not price_id.startswith("price_"):
        raise ValueError(
            f"Stripe price for {tier} must be a price ID (price_...), "
            f"not a product ID. Check STRIPE_PRICE_ID_{tier.upper()} in .env."
        )

    customer_id = ensure_stripe_customer(db, profile)
    metadata = {"user_id": profile["id"], "tier": tier}

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=customer_id,
        line_items=[{"price": price_id, "quantity": 1}],
        client_reference_id=profile["id"],
        metadata=metadata,
        subscription_data={"metadata": metadata},
        success_url=(
            f"{settings.frontend_url}/app?checkout=success"
            "&session_id={CHECKOUT_SESSION_ID}"
        ),
        cancel_url=f"{settings.frontend_url}/app?checkout=cancel",
    )
    if not session.url:
        raise RuntimeError("Stripe did not return a checkout URL.")
    return session.url


def create_portal_session(profile: dict) -> str:
    customer_id = profile.get("stripe_customer_id")
    if not customer_id:
        raise ValueError("No Stripe customer on file.")

    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.frontend_url}/app",
    )
    if not session.url:
        raise RuntimeError("Stripe did not return a portal URL.")
    return session.url


def _tier_from_subscription(subscription: dict[str, Any]) -> str | None:
    metadata_tier = _stripe_metadata(subscription).get("tier")
    if metadata_tier in PAID_TIERS:
        return metadata_tier

    items = _stripe_get(subscription, "items") or {}
    if not isinstance(items, dict):
        items = dict(items)
    data = items.get("data") or []
    for item in data:
        if not isinstance(item, dict):
            item = dict(item)
        price = item.get("price") or {}
        if not isinstance(price, dict):
            price = dict(price)
        price_id = price.get("id")
        if price_id and price_id in PRICE_TO_TIER:
            return PRICE_TO_TIER[price_id]

    return None


def _find_user_id_by_customer(db, customer_id: str | None) -> str | None:
    if not customer_id:
        return None
    result = (
        db.table("profiles")
        .select("id")
        .eq("stripe_customer_id", customer_id)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]["id"]
    return None


def _resolve_user_id(
    db,
    *,
    user_id: str | None = None,
    customer_id: str | None = None,
) -> str | None:
    if user_id:
        return user_id
    return _find_user_id_by_customer(db, customer_id)


def _update_profile(db, user_id: str, patch: dict[str, Any]) -> None:
    if not patch:
        return
    db.table("profiles").update(patch).eq("id", user_id).execute()


def _apply_checkout_completed(db, session: dict[str, Any]) -> None:
    user_id = _resolve_user_id(
        db,
        user_id=_stripe_get(session, "client_reference_id")
        or _stripe_metadata(session).get("user_id"),
        customer_id=_stripe_get(session, "customer"),
    )
    if not user_id:
        return

    tier = _stripe_metadata(session).get("tier")
    subscription_id = _stripe_get(session, "subscription")

    patch: dict[str, Any] = {
        "stripe_customer_id": _stripe_get(session, "customer"),
        "stripe_subscription_id": subscription_id,
        "subscription_status": "active",
    }
    if tier in PAID_TIERS:
        patch["tier"] = tier
    elif subscription_id:
        subscription = stripe.Subscription.retrieve(subscription_id)
        resolved = _tier_from_subscription(subscription)
        if resolved:
            patch["tier"] = resolved

    _update_profile(db, user_id, patch)


def _apply_subscription_change(db, subscription: dict[str, Any]) -> None:
    user_id = _resolve_user_id(
        db,
        user_id=_stripe_metadata(subscription).get("user_id"),
        customer_id=_stripe_get(subscription, "customer"),
    )
    if not user_id:
        return

    status = _stripe_get(subscription, "status") or "active"
    tier = _tier_from_subscription(subscription)

    patch: dict[str, Any] = {
        "stripe_customer_id": _stripe_get(subscription, "customer"),
        "stripe_subscription_id": _stripe_get(subscription, "id"),
        "subscription_status": status,
    }

    if status in ACTIVE_SUBSCRIPTION_STATUSES and tier:
        patch["tier"] = tier
    elif status in {"canceled", "unpaid", "incomplete_expired"}:
        patch["tier"] = "Free"

    _update_profile(db, user_id, patch)


def _apply_subscription_deleted(db, subscription: dict[str, Any]) -> None:
    user_id = _resolve_user_id(
        db,
        user_id=_stripe_metadata(subscription).get("user_id"),
        customer_id=_stripe_get(subscription, "customer"),
    )
    if not user_id:
        return

    _update_profile(
        db,
        user_id,
        {
            "tier": "Free",
            "stripe_subscription_id": None,
            "subscription_status": "canceled",
        },
    )


def _apply_invoice_event(db, invoice: dict[str, Any], *, past_due: bool) -> None:
    user_id = _find_user_id_by_customer(db, _stripe_get(invoice, "customer"))
    if not user_id:
        return

    _update_profile(
        db,
        user_id,
        {"subscription_status": "past_due" if past_due else "active"},
    )


def apply_subscription_event(db, event: stripe.Event) -> None:
    event_type = event["type"]
    data_object = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _apply_checkout_completed(db, data_object)
    elif event_type in {"customer.subscription.created", "customer.subscription.updated"}:
        _apply_subscription_change(db, data_object)
    elif event_type == "customer.subscription.deleted":
        _apply_subscription_deleted(db, data_object)
    elif event_type == "invoice.paid":
        _apply_invoice_event(db, data_object, past_due=False)
    elif event_type == "invoice.payment_failed":
        _apply_invoice_event(db, data_object, past_due=True)
