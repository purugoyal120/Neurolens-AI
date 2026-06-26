from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.vision_test import SubmitVisionTestIn, SubmitVisionTestOut, VisionProfileOut, VisionTestConfigOut
from app.services import simple_vision_test_service as service

router = APIRouter(tags=["vision-test"])


@router.post("/vision-test/start", response_model=VisionTestConfigOut)
def start_vision_test() -> VisionTestConfigOut:
    """Returns the test configuration: 10 questions with colors, options, and timing."""
    return service.build_test_config()


@router.post("/vision-test/submit", response_model=SubmitVisionTestOut)
def submit_vision_test(payload: SubmitVisionTestIn, db: Session = Depends(get_db)) -> SubmitVisionTestOut:
    """Receives the user's 10 answers, scores them, persists the resulting vision profile, and returns it."""
    if not payload.answers:
        raise HTTPException(status_code=400, detail="No answers submitted.")
    return service.submit_and_score(db, payload)


@router.get("/vision-profile/{user_id}", response_model=VisionProfileOut)
def get_vision_profile(user_id: str, db: Session = Depends(get_db)) -> VisionProfileOut:
    """Fetches a previously saved vision profile for this user."""
    profile = service.get_profile(db, user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="No vision profile found for this user. Take the test first.")
    return profile
