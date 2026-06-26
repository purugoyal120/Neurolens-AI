from __future__ import annotations

from pydantic import BaseModel, Field


class StimulusOut(BaseModel):
    id: str
    hex: str  # color converted to sRGB hex for direct use in CSS


class TrialOut(BaseModel):
    id: str
    type: str
    stimuli: list[StimulusOut]
    options: list[str] = Field(default_factory=list)
    prompt: str


class TestBatteryOut(BaseModel):
    test_version: str
    trials: list[TrialOut]
