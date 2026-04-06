from pydantic import BaseModel
from typing import List, Dict, Optional

class ScheduleGenerateRequest(BaseModel):
    college_tier: str
    target_roles: List[str]
    weekday_hrs: int
    weekend_hrs: int
    preferred_windows: List[str]
    skill_levels: Dict[str, str]

class ScheduleItem(BaseModel):
    id: Optional[str] = None
    day_index: int
    time_slot: str
    topic: str
    difficulty: str
    resource_url: str
    status: str = "pending"

class ScheduleGenerateResponse(BaseModel):
    schedule_id: str
    items: List[ScheduleItem]
    next_sync_at: str

class ProgressUpdateRequest(BaseModel):
    item_id: str
    status: str

class ProgressUpdateResponse(BaseModel):
    success: bool
    streak: int
    readiness_score: int
