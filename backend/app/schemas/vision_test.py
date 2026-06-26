"""
Schemas for the Vision Profile Test Module (simple 10-question version).
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# --- /api/vision-test/start -------------------------------------------------

class AnswerOptionOut(BaseModel):
    id: str
    label: str
    hex: str


class QuestionOut(BaseModel):
    id: str
    index: int
    axis: str
    difficulty: str
    prompt: str
    stimulus_hex: str
    options: list[AnswerOptionOut]
    correct_option_id: str


class VisionTestConfigOut(BaseModel):
    test_id: str
    version: str
    time_limit_seconds: int
    questions: list[QuestionOut]


# --- /api/vision-test/submit ------------------------------------------------

class UserAnswerIn(BaseModel):
    question_id: str
    selected_option_id: str
    response_time_ms: int = Field(ge=0, le=120_000)


class SubmitVisionTestIn(BaseModel):
    user_id: str
    test_id: str
    answers: list[UserAnswerIn]


class PerceptionScoresOut(BaseModel):
    red: float
    green: float
    blue: float
    yellow: float
    brown: float | None = 1.0


class ColorTransformationOut(BaseModel):
    from_: str = Field(alias="from")
    to: str
    reason: str

    model_config = ConfigDict(populate_by_name=True)


class MeaningBasedTransformationOut(BaseModel):
    original_color_name: str
    transformed_color_hex: str
    meaning_label: str
    explanation: str


class PersonalImpactOut(BaseModel):
    workplace: str
    productivity: str
    dashboard: str
    daily: str


class VisionProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    deficiency_type: str
    deficiency_name: str | None = None
    clinical_diagnosis: str | None = None
    severity: str
    percent_accuracy: int | None = None
    color_confusion_status: str | None = None
    perception_scores: PerceptionScoresOut
    recommended_transformations: list[ColorTransformationOut] = []
    meaning_based_transformations: list[MeaningBasedTransformationOut] = []
    risk_areas: list[str] = []
    personal_impact: PersonalImpactOut | None = None
    ai_explanation: str | None = None
    created_at: datetime
    updated_at: datetime


class ScoreSummaryOut(BaseModel):
    total_questions: int
    correct_count: int
    accuracy: float


class SubmitVisionTestOut(BaseModel):
    profile: VisionProfileOut
    score_summary: ScoreSummaryOut
