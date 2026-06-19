from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    gemini_api_key_eval: str
    gemini_eval_model: str
    gemini_api_key_utils: str
    gemini_utils_model: str
    fastapi_port: int = 8000
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_id_pro: str = ""
    stripe_price_id_max: str = ""
    frontend_url: str = "http://localhost:3000"
    # Optional comma-separated extra origins (e.g. Cloudflare preview URLs).
    cors_origins: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

_LOCAL_CORS_ORIGINS = ("http://localhost:3000", "http://localhost:5173")


def cors_allow_origins() -> list[str]:
    origins: list[str] = list(_LOCAL_CORS_ORIGINS)
    for candidate in (settings.frontend_url, *settings.cors_origins.split(",")):
        origin = candidate.strip().rstrip("/")
        if origin and origin not in origins:
            origins.append(origin)
    return origins

GEMINI_EVAL_MODEL = settings.gemini_eval_model
GEMINI_UTILS_MODEL = settings.gemini_utils_model


TIER_CAPS: dict[str, dict[str, int]] = {
    "Free": {
        "writing_eval":  0,
        "speaking_eval": 0,
        "vocab_explain": 3,
    },
    "Pro": {
        "writing_eval":  2,
        "speaking_eval": 2,
        "vocab_explain": 20,
    },
    "Max": {
        "writing_eval":  4,
        "speaking_eval": 4,
        "vocab_explain": 30,
    },
}

MOCK_CAPS: dict[str, int] = {
    "Free": 0,
    "Pro":  2,
    "Max":  4,
}

DEFAULT_QUESTION_LIMIT = 40

FREE_READING_LISTENING_CAP = 15

CAPPED_FREE_MODULE_IDS = {"comprehension-ecrite", "comprehension-orale"}

TIER_TO_PRICE: dict[str, str] = {
    "Pro": settings.stripe_price_id_pro,
    "Max": settings.stripe_price_id_max,
}

PRICE_TO_TIER: dict[str, str] = {
    settings.stripe_price_id_pro: "Pro",
    settings.stripe_price_id_max: "Max",
}
