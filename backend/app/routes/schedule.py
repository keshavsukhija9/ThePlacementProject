import uuid
import json
import os
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import (
    ScheduleGenerateRequest,
    ScheduleGenerateResponse,
    ScheduleItem,
)
from app.core.auth import get_current_user
from app.core.db import supabase

router = APIRouter()

# ── Curriculum ────────────────────────────────────────────────────────────────

_CURRICULUM_CACHE: Optional[dict] = None


def load_curriculum() -> dict:
    global _CURRICULUM_CACHE
    if _CURRICULUM_CACHE is None:
        path = os.path.join(os.path.dirname(__file__), "..", "data", "curriculum.json")
        with open(path, encoding="utf-8") as f:
            _CURRICULUM_CACHE = json.load(f)
    return _CURRICULUM_CACHE


# ── Schedule Engine ──────────────────────────────────────────────────────────

WINDOW_SLOTS: dict[str, list[str]] = {
    "Morning":   ["07:00-08:00", "08:00-09:00", "09:00-10:00"],
    "Afternoon": ["13:00-14:00", "14:00-15:00", "15:00-16:00"],
    "Evening":   ["18:00-19:00", "19:00-20:00", "20:00-21:00"],
    "Night":     ["21:00-22:00", "22:00-23:00", "23:00-00:00"],
}

TIER_ALLOWED: dict[str, list[str]] = {
    "Tier-1": ["easy", "medium", "hard"],
    "Tier-2": ["easy", "medium"],
    "Tier-3": ["easy"],
}

SKILL_ALLOWED: dict[str, list[str]] = {
    "beginner":     ["easy", "medium"],
    "intermediate": ["easy", "medium", "hard"],
    "advanced":     ["medium", "hard"],
}

ROLE_WEIGHTS: dict[str, float] = {
    "SDE":           1.5,
    "Data Engineer": 1.2,
    "Core":          1.0,
    "Startup":       1.0,
    "Quant":         1.3,
    "Other":         0.8,
}


def build_topic_pool(req: ScheduleGenerateRequest) -> list[dict]:
    curriculum = load_curriculum()

    pool: dict[str, dict] = {}

    for role in req.target_roles:
        topics = curriculum.get(role, [])
        weight = ROLE_WEIGHTS.get(role, 1.0)
        for item in topics:
            key = item["topic"]
            if key not in pool:
                pool[key] = {**item, "weight": 0.0}
            pool[key]["weight"] += weight

    # Always include some Aptitude for all roles (Indian placement reality)
    if "Aptitude" not in req.target_roles and "Other" not in req.target_roles:
        for item in curriculum.get("Aptitude", []):
            key = item["topic"]
            if key not in pool:
                pool[key] = {**item, "weight": 0.0}
            pool[key]["weight"] += 0.5

    return list(pool.values())


def apply_difficulty_filter(topics: list[dict], req: ScheduleGenerateRequest) -> list[dict]:
    tier_ok = set(TIER_ALLOWED[req.college_tier])

    # Dominant skill level
    levels = [v.lower() for v in req.skill_levels.values()]
    dominant = Counter(levels).most_common(1)[0][0]
    skill_ok = set(SKILL_ALLOWED.get(dominant, ["easy", "medium", "hard"]))

    allowed = tier_ok & skill_ok
    if not allowed:
        allowed = {"easy", "medium"}

    filtered = [t for t in topics if t["difficulty"] in allowed]
    return filtered if filtered else topics  # Fallback to unfiltered


def get_time_slots(req: ScheduleGenerateRequest) -> list[str]:
    slots: list[str] = []
    for window in req.preferred_windows:
        slots.extend(WINDOW_SLOTS.get(window, []))
    return slots or ["18:00-19:00", "19:00-20:00"]


def get_daily_cap(req: ScheduleGenerateRequest) -> int:
    total_weekly = req.weekday_hrs * 5 + req.weekend_hrs * 2
    if total_weekly <= 10:
        return 2
    elif total_weekly <= 15:
        return 3
    return 4


def build_schedule(req: ScheduleGenerateRequest) -> list[ScheduleItem]:
    pool = build_topic_pool(req)
    pool = apply_difficulty_filter(pool, req)
    pool.sort(key=lambda x: -x["weight"])

    time_slots = get_time_slots(req)
    daily_cap = get_daily_cap(req)
    items: list[ScheduleItem] = []
    topic_idx = 0

    for day in range(7):
        is_weekend = day in (5, 6)
        raw_hours = req.weekend_hrs if is_weekend else req.weekday_hrs
        day_sessions = min(raw_hours, daily_cap)

        for slot_idx in range(day_sessions):
            topic = pool[topic_idx % len(pool)]
            time_slot = time_slots[slot_idx % len(time_slots)]
            items.append(
                ScheduleItem(
                    id=str(uuid.uuid4()),
                    day_index=day,
                    time_slot=time_slot,
                    topic=topic["topic"],
                    difficulty=topic["difficulty"],
                    resource_url=topic["resource_url"],
                    status="pending",
                )
            )
            topic_idx += 1

    return items


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=ScheduleGenerateResponse)
def generate_schedule(
    req: ScheduleGenerateRequest,
    user: dict = Depends(get_current_user),
):
    items = build_schedule(req)
    schedule_id = str(uuid.uuid4())
    next_sync = datetime.now(timezone.utc) + timedelta(days=1)

    # Deactivate any existing active schedules for this user
    try:
        supabase.table("schedules").update({"status": "completed"}).eq(
            "user_id", user["id"]
        ).eq("status", "active").execute()

        # Insert new schedule
        supabase.table("schedules").insert(
            {"id": schedule_id, "user_id": user["id"], "status": "active"}
        ).execute()

        # Batch insert items
        supabase.table("schedule_items").insert(
            [
                {
                    "id": item.id,
                    "schedule_id": schedule_id,
                    "day_index": item.day_index,
                    "time_slot": item.time_slot,
                    "topic": item.topic,
                    "difficulty": item.difficulty,
                    "resource_url": item.resource_url,
                    "status": "pending",
                }
                for item in items
            ]
        ).execute()
    except Exception as e:
        # Log but don't crash — return in-memory schedule
        print(f"[schedule] DB error: {e}")

    return ScheduleGenerateResponse(
        schedule_id=schedule_id,
        items=items,
        next_sync_at=next_sync.isoformat(),
    )


@router.get("/current", response_model=ScheduleGenerateResponse)
def get_current_schedule(user: dict = Depends(get_current_user)):
    """Fetch the user's current active schedule from the DB."""
    try:
        schedule_res = (
            supabase.table("schedules")
            .select("id")
            .eq("user_id", user["id"])
            .eq("status", "active")
            .order("generated_at", desc=True)
            .limit(1)
            .execute()
        )
        if not schedule_res.data:
            raise HTTPException(status_code=404, detail="No active schedule found")

        schedule_id = schedule_res.data[0]["id"]

        items_res = (
            supabase.table("schedule_items")
            .select("*")
            .eq("schedule_id", schedule_id)
            .order("day_index")
            .execute()
        )

        items = [
            ScheduleItem(
                id=row["id"],
                day_index=row["day_index"],
                time_slot=row["time_slot"],
                topic=row["topic"],
                difficulty=row["difficulty"],
                resource_url=row["resource_url"],
                status=row["status"],
            )
            for row in items_res.data
        ]

        next_sync = datetime.now(timezone.utc) + timedelta(days=1)
        return ScheduleGenerateResponse(
            schedule_id=schedule_id,
            items=items,
            next_sync_at=next_sync.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
