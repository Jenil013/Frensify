"""Verify Supabase access tokens (HS256 legacy or ES256/RS256 via JWKS)."""

from functools import lru_cache

import jwt
from jwt import PyJWKClient

from config import settings


@lru_cache
def _jwks_client() -> PyJWKClient:
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    return PyJWKClient(url, cache_keys=True)


def decode_supabase_access_token(token: str) -> dict:
    """
    Decode a Supabase Auth access token.

    Newer projects sign user JWTs with ES256 and publish keys at JWKS.
    Legacy projects use HS256 with SUPABASE_JWT_SECRET.
    """
    header = jwt.get_unverified_header(token)
    alg = header.get("alg", "HS256")

    if alg in ("ES256", "RS256"):
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=[alg],
            audience="authenticated",
        )

    return jwt.decode(
        token,
        settings.supabase_jwt_secret,
        algorithms=["HS256"],
        audience="authenticated",
    )
