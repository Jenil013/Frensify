from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Frensify API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


def _register_routers():
    from routers.profile import router as profile_router
    from routers.practice import router as practice_router
    from routers.exams import router as exams_router
    from routers.vocabulary import router as vocabulary_router
    from routers.ai import router as ai_router
    from routers.analytics import router as analytics_router

    app.include_router(profile_router, prefix="/api/v1")
    app.include_router(practice_router, prefix="/api/v1")
    app.include_router(exams_router, prefix="/api/v1")
    app.include_router(vocabulary_router, prefix="/api/v1")
    app.include_router(ai_router, prefix="/api/v1")
    app.include_router(analytics_router, prefix="/api/v1")


_register_routers()
