from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


# ── Schedule ────────────────────────────────────────────────

class ScheduleGenerateRequest(BaseModel):
    college_tier: Literal["Tier-1", "Tier-2", "Tier-3"]
    target_roles: list[str]
    weekday_hrs: int = Field(..., ge=1, le=8)
    weekend_hrs: int = Field(..., ge=1, le=10)
    preferred_windows: list[Literal["Morning", "Afternoon", "Evening", "Night"]]
    skill_levels: dict[str, str]  # {"dsa": "beginner", "web": "intermediate", ...}


class ScheduleItem(BaseModel):
    id: str  # Always populated — never Optional
    day_index: int
    time_slot: str
    topic: str
    difficulty: Literal["easy", "medium", "hard"]
    resource_url: str
    status: Literal["pending", "completed", "skipped"] = "pending"


class ScheduleGenerateResponse(BaseModel):
    schedule_id: str
    items: list[ScheduleItem]
    next_sync_at: str


# ── Progress ─────────────────────────────────────────────────

class ProgressUpdateRequest(BaseModel):
    item_id: str
    status: Literal["pending", "completed", "skipped"]


class ProgressUpdateResponse(BaseModel):
    success: bool
    streak: int
    readiness_score: int


# ── Profile ──────────────────────────────────────────────────

class ProfileCreateRequest(BaseModel):
    college_tier: Literal["Tier-1", "Tier-2", "Tier-3"]
    branch: str = Field(..., min_length=1)
    grad_year: int = Field(..., ge=2020, le=2030)
    target_roles: list[str] = Field(..., min_length=1)
    weekday_hrs: int = Field(..., ge=1, le=8)
    weekend_hrs: int = Field(..., ge=1, le=10)
    preferred_windows: list[Literal["Morning", "Afternoon", "Evening", "Night"]]
    skill_levels: dict[str, str]


class ProfileResponse(BaseModel):
    user_id: str
    college_tier: Optional[str]
    branch: Optional[str]
    grad_year: Optional[int]
    target_roles: list[str]
    weekday_hrs: Optional[int]
    weekend_hrs: Optional[int]
    preferred_windows: list[str]
    skill_levels: Optional[dict]
    is_pro: bool
    pro_expires_at: Optional[str]
    telegram_chat_id: Optional[str]


# ── Payment ──────────────────────────────────────────────────

class CheckoutCreateResponse(BaseModel):
    checkout_url: str


class WebhookResponse(BaseModel):
    status: str
