from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TrialResponseIn(BaseModel):
    """One answer to one trial, sent from the frontend test runner."""
    trial_id: str
    # For discrimination trials: "same" | "different"
    # For identification trials: the chosen label (e.g. "Red")
    answer: str
    response_time_ms: int = Field(ge=0, le=60_000)


class SubmitTestIn(BaseModel):
    user_id: str
    responses: list[TrialResponseIn]
    test_version: str


class VisionMapOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    cvd_type: str
    severity: float
    confidence: float
    confusion_axis: dict[str, float]
    per_hue_discrimination: dict[str, float]
    recommended_strategy: str
    test_version: str
    created_at: datetime


class ProfileSummaryOut(BaseModel):
    """Human-readable summary shown on the results screen, derived from VisionMapOut."""
    headline: str
    description: str
    severity_label: str
    vision_map: VisionMapOut
