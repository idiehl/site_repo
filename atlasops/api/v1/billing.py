"""Billing and subscription endpoints."""

import json
import hmac
import hashlib
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select

from atlasops.api.deps import CurrentUser, DbSession
from atlasops.config import get_settings
from atlasops.models.user import User
from atlasops.schemas.user import CurrentUserResponse
from atlasops.services.entitlements import (
    can_access_premium_features,
    get_resume_generation_limit,
    reset_resume_quota_if_needed,
)

router = APIRouter()
settings = get_settings()


def _verify_stripe_signature(payload: bytes, signature: str, secret: str) -> None:
    """Verify Stripe webhook signature header."""
    try:
        parts = dict(item.split("=", 1) for item in signature.split(","))
        timestamp = parts.get("t")
        signature_hash = parts.get("v1")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid signature header")

    if not timestamp or not signature_hash:
        raise HTTPException(status_code=400, detail="Invalid signature header")

    signed_payload = f"{timestamp}.{payload.decode('utf-8')}".encode("utf-8")
    expected = hmac.new(
        secret.encode("utf-8"), signed_payload, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature_hash):
        raise HTTPException(status_code=400, detail="Invalid signature")


@router.get("/status", response_model=CurrentUserResponse)
async def get_billing_status(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Return subscription status and usage limits."""
    if reset_resume_quota_if_needed(current_user):
        await db.commit()

    base = CurrentUserResponse.model_validate(current_user).model_dump()
    base["resume_generation_limit"] = get_resume_generation_limit(current_user)
    base["can_access_premium_features"] = can_access_premium_features(current_user)
    return base


@router.post("/checkout")
async def create_checkout_session(
    current_user: CurrentUser,
) -> dict:
    """Create a Stripe Checkout session for subscription upgrades."""
    if not settings.stripe_secret_key or not settings.stripe_price_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Billing is not configured",
        )

    data = {
        "mode": "subscription",
        "payment_method_types[0]": "card",
        "line_items[0][price]": settings.stripe_price_id,
        "line_items[0][quantity]": 1,
        "success_url": settings.stripe_success_url,
        "cancel_url": settings.stripe_cancel_url,
        "customer_email": current_user.email,
        "client_reference_id": str(current_user.id),
        "metadata[user_id]": str(current_user.id),
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            "https://api.stripe.com/v1/checkout/sessions",
            data=data,
            headers={
                "Authorization": f"Bearer {settings.stripe_secret_key}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to start checkout session",
        )

    session = response.json()
    return {"url": session.get("url")}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: DbSession) -> dict:
    """Handle Stripe webhook events."""
    if not settings.stripe_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Billing is not configured",
        )

    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature header")

    _verify_stripe_signature(payload, signature, settings.stripe_webhook_secret)
    event = json.loads(payload.decode("utf-8"))

    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        user_id = data.get("client_reference_id") or data.get("metadata", {}).get("user_id")
        if user_id:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                user.stripe_customer_id = data.get("customer")
                user.stripe_subscription_id = data.get("subscription")
                user.subscription_tier = "paid"
                user.subscription_status = "active"
                await db.commit()

    if event_type in {"customer.subscription.updated", "customer.subscription.deleted"}:
        subscription_id = data.get("id")
        customer_id = data.get("customer")
        status_value = data.get("status")
        current_period_end = data.get("current_period_end")

        query = select(User)
        if subscription_id:
            query = query.where(User.stripe_subscription_id == subscription_id)
        elif customer_id:
            query = query.where(User.stripe_customer_id == customer_id)
        else:
            return {"received": True}

        result = await db.execute(query)
        user = result.scalar_one_or_none()
        if user:
            user.subscription_status = status_value or "canceled"
            user.subscription_tier = (
                "paid" if status_value in {"active", "trialing", "past_due"} else "free"
            )
            if current_period_end:
                user.current_period_end = datetime.fromtimestamp(
                    current_period_end, tz=timezone.utc
                )
            await db.commit()

    return {"received": True}
