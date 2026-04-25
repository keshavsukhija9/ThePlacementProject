from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ProfileCreateRequest, ProfileResponse
from app.core.auth import get_current_user
from app.core.db import supabase

router = APIRouter()


@router.post("", response_model=ProfileResponse, status_code=201)
def save_profile(
    req: ProfileCreateRequest,
    user: dict = Depends(get_current_user),
):
    """
    Save (upsert) onboarding data to the profiles table.
    Called at the end of the onboarding flow before schedule generation.
    """
    payload = {
        "user_id": user["id"],
        "college_tier": req.college_tier,
        "branch": req.branch,
        "grad_year": req.grad_year,
        "target_roles": req.target_roles,
        "weekday_hrs": req.weekday_hrs,
        "weekend_hrs": req.weekend_hrs,
        "preferred_windows": req.preferred_windows,
        "skill_levels": {k: v.lower() for k, v in req.skill_levels.items()},
    }
    try:
        result = supabase.table("profiles").upsert(payload).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save profile")
        row = result.data[0]
        return ProfileResponse(
            user_id=row["user_id"],
            college_tier=row.get("college_tier"),
            branch=row.get("branch"),
            grad_year=row.get("grad_year"),
            target_roles=row.get("target_roles", []),
            weekday_hrs=row.get("weekday_hrs"),
            weekend_hrs=row.get("weekend_hrs"),
            preferred_windows=row.get("preferred_windows", []),
            skill_levels=row.get("skill_levels"),
            is_pro=row.get("is_pro", False),
            pro_expires_at=row.get("pro_expires_at"),
            telegram_chat_id=row.get("telegram_chat_id"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=ProfileResponse)
def get_profile(user: dict = Depends(get_current_user)):
    """Fetch the current user's profile."""
    try:
        result = (
            supabase.table("profiles")
            .select("*")
            .eq("user_id", user["id"])
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        row = result.data
        return ProfileResponse(
            user_id=row["user_id"],
            college_tier=row.get("college_tier"),
            branch=row.get("branch"),
            grad_year=row.get("grad_year"),
            target_roles=row.get("target_roles", []),
            weekday_hrs=row.get("weekday_hrs"),
            weekend_hrs=row.get("weekend_hrs"),
            preferred_windows=row.get("preferred_windows", []),
            skill_levels=row.get("skill_levels"),
            is_pro=row.get("is_pro", False),
            pro_expires_at=row.get("pro_expires_at"),
            telegram_chat_id=row.get("telegram_chat_id"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
