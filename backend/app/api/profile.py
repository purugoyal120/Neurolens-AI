from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.vision_profile import VisionProfile
from app.schemas.profile import ProfileSummaryOut, SubmitTestIn, VisionMapOut
from app.schemas.test import TestBatteryOut
from app.services import profile_builder

router = APIRouter(prefix="/profile", tags=["vision-profile"])


@router.get("/test-battery", response_model=TestBatteryOut)
def get_test_battery() -> TestBatteryOut:
    """Returns the 12-trial color test, with stimulus colors as sRGB hex."""
    return profile_builder.get_test_battery()


@router.post("/test-results", response_model=ProfileSummaryOut)
def submit_test_results(payload: SubmitTestIn, db: Session = Depends(get_db)) -> ProfileSummaryOut:
    """Scores submitted test responses and persists/updates the user's vision profile."""
    if not payload.responses:
        raise HTTPException(status_code=400, detail="No responses submitted.")
    profile = profile_builder.submit_test_and_build_profile(db, payload)
    return profile_builder.build_profile_summary(profile)


@router.get("/{user_id}/vision-map", response_model=VisionMapOut)
def get_vision_map(user_id: str, db: Session = Depends(get_db)) -> VisionMapOut:
    """Fetches a previously computed vision map — this is what the transformation engine consumes."""
    profile = db.query(VisionProfile).filter(VisionProfile.user_id == user_id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="No vision profile found for this user. Take the test first.")
    return profile_builder.to_vision_map_out(profile)


@router.delete("/{user_id}")
def delete_profile(user_id: str, db: Session = Depends(get_db)) -> dict:
    profile = db.query(VisionProfile).filter(VisionProfile.user_id == user_id).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="No vision profile found for this user.")
    db.delete(profile)
    db.commit()
    return {"status": "deleted", "user_id": user_id}
