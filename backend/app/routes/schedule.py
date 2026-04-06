from fastapi import APIRouter
from app.models.schemas import ScheduleGenerateRequest, ScheduleGenerateResponse, ScheduleItem, ProgressUpdateRequest, ProgressUpdateResponse
import uuid
from datetime import datetime, timedelta, timezone

router = APIRouter()

def get_deterministic_schedule(req: ScheduleGenerateRequest):
    base_topic = "DSA" if "SDE" in req.target_roles else "Aptitude"
    diff = "hard" if req.college_tier == "Tier-1" else ("medium" if req.college_tier == "Tier-2" else "easy")
    
    items = []
    for i in range(7):
        is_weekend = i in [5,6] # Saturday=5, Sunday=6
        hrs = req.weekend_hrs if is_weekend else req.weekday_hrs
        
        if hrs > 0:
            capped_hrs = min(3, hrs) if hrs >= 10 else min(2, hrs)
            for j in range(capped_hrs):
                start_hr = 18 + j 
                items.append(ScheduleItem(
                    day_index=i,
                    time_slot=f"{start_hr}:00-{start_hr+1}:00",
                    topic=f"{base_topic} - Module {j+1}",
                    difficulty=diff,
                    resource_url="https://example.com/mock-resource"
                ))
    return items

@router.post("/generate", response_model=ScheduleGenerateResponse)
def generate_schedule(req: ScheduleGenerateRequest):
    items = get_deterministic_schedule(req)
    next_sync = datetime.now(timezone.utc) + timedelta(days=1)
    
    return ScheduleGenerateResponse(
        schedule_id=str(uuid.uuid4()),
        items=items,
        next_sync_at=next_sync.isoformat()
    )

@router.post("/progress/update", response_model=ProgressUpdateResponse)
def update_progress(req: ProgressUpdateRequest):
    return ProgressUpdateResponse(
        success=True,
        streak=1,
        readiness_score=50
    )
