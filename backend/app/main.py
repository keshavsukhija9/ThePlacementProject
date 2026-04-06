from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import schedule, payment

app = FastAPI(title="ThePlacementProject API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedule.router, prefix="/api/v1/schedule", tags=["schedule"])
app.include_router(schedule.router, prefix="/api/v1", tags=["progress"])
app.include_router(payment.router, prefix="/api/v1/payment", tags=["payment"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
