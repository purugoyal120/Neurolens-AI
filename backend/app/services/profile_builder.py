from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.color_space import lab_to_hex
from app.core.config import settings
from app.core.test_stimuli import TrialType, build_test_battery
from app.ml.vision_model import VisionModel
from app.models.vision_profile import VisionProfile
from app.schemas.profile import ProfileSummaryOut, SubmitTestIn, VisionMapOut
from app.schemas.test import StimulusOut, TestBatteryOut, TrialOut

_PROMPTS = {
    TrialType.DISCRIMINATION: "Do these two colors look the same, or different?",
    TrialType.IDENTIFICATION: "What color is this?",
    TrialType.CONTROL: "Do these two colors look the same, or different?",
    TrialType.CALIBRATION: "Do these two colors look the same, or different?",
}

_vision_model = VisionModel(use_neural=False)


def get_test_battery() -> TestBatteryOut:
    """Builds the fixed 12-trial battery and converts Lab stimuli to hex for the client."""
    trials = build_test_battery()
    out_trials = [
        TrialOut(
            id=t.id,
            type=t.type.value,
            stimuli=[StimulusOut(id=s.id, hex=lab_to_hex(s.lab)) for s in t.stimuli],
            options=t.options,
            prompt=_PROMPTS[t.type],
        )
        for t in trials
    ]
    return TestBatteryOut(test_version=settings.test_version, trials=out_trials)


def submit_test_and_build_profile(db: Session, payload: SubmitTestIn) -> VisionProfile:
    """
    Scores the submitted responses via the vision model, then upserts a
    VisionProfile row for this user (one profile per user — retaking the
    test overwrites the previous map; raw_responses from prior attempts are
    not retained beyond the current row to keep this simple for v1).
    """
    raw = [r.model_dump() for r in payload.responses]
    scored = _vision_model.score(raw)

    existing = db.query(VisionProfile).filter(VisionProfile.user_id == payload.user_id).first()
    profile = existing or VisionProfile(user_id=payload.user_id)

    profile.cvd_type = scored["cvd_type"]
    profile.severity = scored["severity"]
    profile.confidence = scored["confidence"]
    profile.hue_a_deg = scored["confusion_axis"]["hue_a_deg"]
    profile.hue_b_deg = scored["confusion_axis"]["hue_b_deg"]
    profile.per_hue_discrimination = scored["per_hue_discrimination"]
    profile.recommended_strategy = scored["recommended_strategy"]
    profile.raw_responses = raw
    profile.test_version = payload.test_version

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def to_vision_map_out(profile: VisionProfile) -> VisionMapOut:
    return VisionMapOut(
        user_id=profile.user_id,
        cvd_type=profile.cvd_type,
        severity=profile.severity,
        confidence=profile.confidence,
        confusion_axis={"hue_a_deg": profile.hue_a_deg, "hue_b_deg": profile.hue_b_deg},
        per_hue_discrimination=profile.per_hue_discrimination,
        recommended_strategy=profile.recommended_strategy,
        test_version=profile.test_version,
        created_at=profile.created_at,
    )


_HEADLINES = {
    "none": "No color vision deficiency detected",
    "protan": "Red-green color vision difference (protan-type)",
    "deutan": "Red-green color vision difference (deutan-type)",
    "tritan": "Blue-yellow color vision difference",
}

_SEVERITY_LABELS = [
    (0.0, "none"),
    (0.25, "mild"),
    (0.5, "moderate"),
    (0.75, "significant"),
    (1.01, "severe"),
]


def _severity_label(severity: float) -> str:
    for threshold, label in _SEVERITY_LABELS:
        if severity < threshold:
            return label
    return "severe"


def build_profile_summary(profile: VisionProfile) -> ProfileSummaryOut:
    vmap = to_vision_map_out(profile)
    sev_label = _severity_label(profile.severity)
    if profile.cvd_type == "none":
        description = (
            "Your responses matched what we'd expect from typical color vision. "
            "We won't apply any color transformation, but you can retake the test anytime."
        )
    else:
        description = (
            f"Your results suggest a {sev_label} {profile.cvd_type}-type difference, "
            f"with confidence {round(profile.confidence * 100)}%. "
            "We'll use this to personalize how colors and color-coded meaning "
            "are shown to you across apps."
        )
    return ProfileSummaryOut(
        headline=_HEADLINES.get(profile.cvd_type, "Color vision profile created"),
        description=description,
        severity_label=sev_label,
        vision_map=vmap,
    )
