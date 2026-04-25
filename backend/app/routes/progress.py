from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ProgressUpdateRequest, ProgressUpdateResponse
from app.core.auth import get_current_user
from app.core.db import supabase

router = APIRouter()


def calculate_streak(user_id: str) -> int:
    """
    Count consecutive days (0-6, Mon-Sun) with at least one completed item,
    working backwards from today's weekday index.
    """
    try:
        result = (
            supabase.table("schedule_items")
            .select("day_index, schedules!inner(user_id, status)")
            .eq("schedules.user_id", user_id)
            .eq("schedules.status", "active")
            .eq("status", "completed")
            .execute()
        )
        completed_days = set(row["day_index"] for row in result.data)

        # Weekday index: Monday=0, Sunday=6
        today_idx = datetime.now(timezone.utc).weekday()

        streak = 0
        for i in range(today_idx + 1):
            if i in completed_days:
                streak += 1
            else:
                streak = 0  # Reset on gap — only count the current run
        return streak
    except Exception:
        return 0


def calculate_readiness(completed: int, total: int, streak: int) -> int:
    """
    Readiness score (0-100):
    - 60% weight: completion rate
    - 30% weight: streak (capped at 10 days = 30 pts)
    - 10% base score
    """
    if total == 0:
        return 0
    completion_pts = (completed / total) * 60
    streak_pts = min(streak * 3, 30)
    score = 10 + completion_pts + streak_pts
    return min(int(score), 100)


@router.post("/update", response_model=ProgressUpdateResponse)
def update_progress(
    req: ProgressUpdateRequest,
    user: dict = Depends(get_current_user),
):
    """Update a schedule item status and recalculate streak & readiness."""
    try:
        # Verify item belongs to this user before updating
        item_res = (
            supabase.table("schedule_items")
            .select("id, schedule_id, schedules!inner(user_id)")
            .eq("id", req.item_id)
            .single()
            .execute()
        )
        if not item_res.data:
            raise HTTPException(status_code=404, detail="Item not found")

        if item_res.data["schedules"]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not your schedule item")

        # Update status
        supabase.table("schedule_items").update({"status": req.status}).eq(
            "id", req.item_id
        ).execute()

        # Recalculate metrics
        streak = calculate_streak(user["id"])

        # Get completion totals for readiness
        totals_res = (
            supabase.table("schedule_items")
            .select("status, schedules!inner(user_id, status)")
            .eq("schedules.user_id", user["id"])
            .eq("schedules.status", "active")
            .execute()
        )
        total = len(totals_res.data)
        completed = sum(1 for r in totals_res.data if r["status"] == "completed")
        readiness = calculate_readiness(completed, total, streak)

        return ProgressUpdateResponse(
            success=True,
            streak=streak,
            readiness_score=readiness,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[progress] Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update progress")
