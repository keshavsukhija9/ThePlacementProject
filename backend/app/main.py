from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import schedule, payment
from app.routes import progress, profile
from app.core.config import settings

app = FastAPI(
    title="ThePlacementProject API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Explicit origins — wildcard + credentials is rejected by browsers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://theplacementproject.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(schedule.router,  prefix="/api/v1/schedule",  tags=["schedule"])
app.include_router(progress.router,  prefix="/api/v1/progress",  tags=["progress"])
app.include_router(payment.router,   prefix="/api/v1/payment",   tags=["payment"])
app.include_router(profile.router,   prefix="/api/v1/profile",   tags=["profile"])


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["meta"])
def health_check():
    return {"status": "ok", "env": settings.ENVIRONMENT}
