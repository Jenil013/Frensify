from unittest.mock import MagicMock, patch

import stripe


def _checkout_completed_event(user_id: str = "user-uuid-123") -> dict:
    return {
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "client_reference_id": user_id,
                "customer": "cus_test123",
                "subscription": "sub_test123",
                "metadata": {"user_id": user_id, "tier": "Pro"},
            }
        },
    }


def _subscription_deleted_event(user_id: str = "user-uuid-123") -> dict:
    return {
        "type": "customer.subscription.deleted",
        "data": {
            "object": {
                "id": "sub_test123",
                "customer": "cus_test123",
                "metadata": {"user_id": user_id, "tier": "Pro"},
                "status": "canceled",
            }
        },
    }


@patch("routers.stripe_webhook.stripe.Webhook.construct_event")
def test_webhook_rejects_invalid_signature(mock_construct, client):
    mock_construct.side_effect = stripe.error.SignatureVerificationError(
        "bad sig", "sig_header"
    )

    response = client.post(
        "/api/v1/billing/webhook",
        data=b"{}",
        headers={"stripe-signature": "bad-signature"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid signature."


@patch("routers.stripe_webhook.apply_subscription_event")
@patch("routers.stripe_webhook.stripe.Webhook.construct_event")
def test_webhook_checkout_completed(
    mock_construct, mock_apply, client, mock_db
):
    event = stripe.Event.construct_from(_checkout_completed_event(), "evt_test")
    mock_construct.return_value = event

    response = client.post(
        "/api/v1/billing/webhook",
        data=b"{}",
        headers={"stripe-signature": "valid-signature"},
    )

    assert response.status_code == 200
    assert response.json() == {"received": True}
    mock_apply.assert_called_once_with(mock_db, event)


@patch("services.stripe_service._update_profile")
@patch("services.stripe_service.stripe.Subscription.retrieve")
def test_apply_checkout_completed_upgrades_tier(
    mock_retrieve, mock_update, mock_db
):
    from services.stripe_service import apply_subscription_event

    event = stripe.Event.construct_from(_checkout_completed_event(), "evt_test")
    apply_subscription_event(mock_db, event)

    mock_retrieve.assert_not_called()
    mock_update.assert_called_once()
    args = mock_update.call_args[0]
    patch = args[2]
    assert patch["tier"] == "Pro"
    assert patch["stripe_customer_id"] == "cus_test123"
    assert patch["subscription_status"] == "active"


@patch("services.stripe_service._update_profile")
def test_apply_subscription_deleted_downgrades_to_free(mock_update, mock_db):
    from services.stripe_service import apply_subscription_event

    event = stripe.Event.construct_from(
        _subscription_deleted_event(), "evt_deleted"
    )
    apply_subscription_event(mock_db, event)

    mock_update.assert_called_once()
    args = mock_update.call_args[0]
    patch = args[2]
    assert patch["tier"] == "Free"
    assert patch["subscription_status"] == "canceled"


def test_webhook_missing_signature(client):
    response = client.post("/api/v1/billing/webhook", data=b"{}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Missing Stripe-Signature header."
