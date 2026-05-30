from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def billing_client(mock_profile, mock_db):
    from main import app
    from dependencies import get_profile
    from database import get_db

    async def _get_profile():
        return mock_profile

    def _get_db():
        return mock_db

    app.dependency_overrides[get_profile] = _get_profile
    app.dependency_overrides[get_db] = _get_db

    yield TestClient(app)

    app.dependency_overrides.clear()


def test_checkout_requires_auth():
    from main import app

    with TestClient(app) as unauth_client:
        response = unauth_client.post(
            "/api/v1/billing/checkout",
            json={"tier": "Pro"},
        )
    assert response.status_code == 401


def test_checkout_rejects_free_tier(billing_client, auth_headers):
    response = billing_client.post(
        "/api/v1/billing/checkout",
        headers=auth_headers,
        json={"tier": "Free"},
    )
    assert response.status_code == 422


def test_checkout_rejects_invalid_tier(billing_client, auth_headers):
    response = billing_client.post(
        "/api/v1/billing/checkout",
        headers=auth_headers,
        json={"tier": "Ultra"},
    )
    assert response.status_code == 422


@patch("routers.billing.stripe_service.create_checkout_session")
def test_checkout_returns_url(
    mock_create_checkout, billing_client, auth_headers, mock_db
):
    mock_create_checkout.return_value = "https://checkout.stripe.com/test"

    response = billing_client.post(
        "/api/v1/billing/checkout",
        headers=auth_headers,
        json={"tier": "Pro"},
    )

    assert response.status_code == 200
    assert response.json() == {"url": "https://checkout.stripe.com/test"}
    mock_create_checkout.assert_called_once()


@patch("routers.billing.stripe_service.create_checkout_session")
def test_checkout_handles_missing_price(
    mock_create_checkout, billing_client, auth_headers
):
    mock_create_checkout.side_effect = ValueError(
        "Stripe price not configured for tier: Pro"
    )

    response = billing_client.post(
        "/api/v1/billing/checkout",
        headers=auth_headers,
        json={"tier": "Pro"},
    )

    assert response.status_code == 400
    assert "Stripe price not configured" in response.json()["detail"]


@patch("routers.billing.stripe_service.create_checkout_session")
def test_checkout_rejects_product_id(
    mock_create_checkout, billing_client, auth_headers
):
    mock_create_checkout.side_effect = ValueError(
        "Stripe price for Pro must be a price ID (price_...), not a product ID."
    )

    response = billing_client.post(
        "/api/v1/billing/checkout",
        headers=auth_headers,
        json={"tier": "Pro"},
    )

    assert response.status_code == 400
    assert "price ID" in response.json()["detail"]


@patch("routers.billing.stripe_service.create_portal_session")
def test_portal_returns_url(mock_create_portal, billing_client, auth_headers):
    mock_create_portal.return_value = "https://billing.stripe.com/test"

    response = billing_client.post(
        "/api/v1/billing/portal",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json() == {"url": "https://billing.stripe.com/test"}


@patch("routers.billing.stripe_service.create_portal_session")
def test_portal_missing_customer(mock_create_portal, billing_client, auth_headers):
    mock_create_portal.side_effect = ValueError("No Stripe customer on file.")

    response = billing_client.post(
        "/api/v1/billing/portal",
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "No Stripe customer on file."
