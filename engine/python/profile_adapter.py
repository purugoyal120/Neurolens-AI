"""
Adapts the two existing vision-profile JSON shapes in this repo into the
engine's own stable `NormalizedVisionProfile`. See
docs/transformation-engine-spec.md section 1 for why this exists.

The engine package itself never imports from backend/app/ml or
backend/app/schemas — only this adapter module knows about those shapes,
so the core transformer stays portable.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

DeficiencyType = Literal["red-green", "blue-yellow", "none", "unknown"]

_CATEGORICAL_SEVERITY_TO_FLOAT: dict[str, float] = {
    "none": 0.0,
    "mild": 0.25,
    "moderate": 0.55,
    "severe": 0.85,
}


@dataclass(frozen=True)
class ConfusionAxis:
    hue_a_deg: float
    hue_b_deg: float


@dataclass(frozen=True)
class NormalizedVisionProfile:
    user_id: str
    deficiency_type: DeficiencyType
    severity: float  # 0.0-1.0, continuous
    confusion_axis: ConfusionAxis | None = None

    @staticmethod
    def no_deficiency(user_id: str = "anonymous") -> "NormalizedVisionProfile":
        """Safe default — used when no profile is available yet, so callers
        never need to special-case 'no profile' vs 'profile says no deficiency'."""
        return NormalizedVisionProfile(user_id=user_id, deficiency_type="none", severity=0.0)


def from_extended_module(vision_map: dict) -> NormalizedVisionProfile:
    """
    Adapts the 12-trial module's VisionMapOut shape:
    { cvd_type: "protan"|"deutan"|"tritan"|"none"|"unknown",
      severity: float, confusion_axis: {hue_a_deg, hue_b_deg}, ... }
    """
    cvd_type = vision_map.get("cvd_type", "unknown")
    if cvd_type in ("protan", "deutan"):
        deficiency_type: DeficiencyType = "red-green"
    elif cvd_type == "tritan":
        deficiency_type = "blue-yellow"
    elif cvd_type == "none":
        deficiency_type = "none"
    else:
        deficiency_type = "unknown"

    axis_raw = vision_map.get("confusion_axis")
    axis = (
        ConfusionAxis(hue_a_deg=axis_raw["hue_a_deg"], hue_b_deg=axis_raw["hue_b_deg"])
        if axis_raw
        else None
    )

    return NormalizedVisionProfile(
        user_id=vision_map.get("user_id", "anonymous"),
        deficiency_type=deficiency_type,
        severity=float(vision_map.get("severity", 0.0)),
        confusion_axis=axis,
    )


def from_simple_module(vision_profile: dict) -> NormalizedVisionProfile:
    """
    Adapts the 10-question module's VisionProfileOut shape:
    { deficiency_type: "red-green"|"blue-yellow"|"none", severity: "mild"|... }
    """
    deficiency_type = vision_profile.get("deficiency_type", "unknown")
    if deficiency_type not in ("red-green", "blue-yellow", "none"):
        deficiency_type = "unknown"

    severity_label = vision_profile.get("severity", "none")
    severity = _CATEGORICAL_SEVERITY_TO_FLOAT.get(severity_label, 0.0)

    return NormalizedVisionProfile(
        user_id=vision_profile.get("user_id", "anonymous"),
        deficiency_type=deficiency_type,  # type: ignore[arg-type]
        severity=severity,
        confusion_axis=None,  # this module doesn't produce per-hue axis data
    )
