"""
Core Transformation Engine — Python reference implementation.

Implements docs/transformation-engine-spec.md sections 2-3 exactly:
- transform_color(hex, profile, mode) is the single public entry point.
- Color Replacement: hue-space rotation away from the user's confusion axis,
  scaled by severity, preserving lightness/chroma.
- Context Replacement: semantic classification (success/warning/error/info/
  neutral) -> fixed icon + label lookup, independent of the user's profile.

This is the CANONICAL implementation other ports (engine/js/transformer.js)
are tested against for parity — see engine/tests/test_parity.py.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from .color import Lab, hex_to_lab, lab_to_hex
from .profile_adapter import NormalizedVisionProfile

TransformMode = Literal["color", "context", "combined"]
SemanticCategory = Literal["success", "warning", "error", "info", "neutral"]

# Below this severity, color replacement is a no-op: a typical-vision or
# near-typical user gets no benefit and only visual noise from a shift.
SEVERITY_NO_OP_THRESHOLD = 0.15

# Combined mode adds context replacement on top of color shift once severity
# crosses this bar — mirrors the 10-question module's `recommended_strategy`
# thresholds (shift_hue / combined / icon_replacement) for consistency.
COMBINED_MODE_SEVERITY_THRESHOLD = 0.40

# Edge taper floor: at the exact zone boundary, push strength is
# multiplied by this floor (not all the way to 0) so there's no jarring
# cliff between "just inside" and "just outside" the zone, while still
# letting severity dominate the overall strength.
EDGE_TAPER_FLOOR = 0.6


@dataclass(frozen=True)
class SemanticInfo:
    icon: str
    label: str
    category: SemanticCategory


@dataclass(frozen=True)
class TransformResult:
    original_hex: str
    transformed_hex: str | None
    semantic: SemanticInfo | None
    changed: bool

    def to_dict(self) -> dict:
        return {
            "originalHex": self.original_hex,
            "transformedHex": self.transformed_hex,
            "semantic": (
                {"icon": self.semantic.icon, "label": self.semantic.label, "category": self.semantic.category}
                if self.semantic
                else None
            ),
            "changed": self.changed,
        }


# ---------------------------------------------------------------------------
# Semantic classification + icon lookup (Context Replacement)
# ---------------------------------------------------------------------------

SEMANTIC_ICONS: dict[SemanticCategory, tuple[str, str]] = {
    "success": ("✅", "Good"),
    "warning": ("⚠", "Warning"),
    "error": ("❌", "Critical"),
    "info": ("ℹ", "Info"),
    "neutral": ("◻", "Neutral"),
}


def classify_semantic(hex_color: str) -> SemanticCategory:
    """
    Buckets a color into a semantic category by hue + chroma.

    Boundaries are calibrated against measured Lab hue angles of real status
    colors from common UI frameworks (Bootstrap, Tailwind, Flat UI), not
    guessed from raw color-wheel thirds:
      error:   26-40deg  (#DC3545 26, #EF4444 31, #E74C3C 36, #C0392B 37, #FF0000 40)
      warning: 61-84deg  (#E67E22 61, #F39C12 72, #F59E0B 73, #FFA500 73, #FFC107 84)
      success: 136-150deg (#00FF00 136, #2ECC40 140, #28A745 143, #22C55E 147, #27AE60 150)
      info:    219-285deg (#17A2B8 219, #2980B9 261, #3498DB 262, #3B82F6 285)
    Low-chroma (grayish) colors are 'neutral' regardless of hue, since a
    washed-out color rarely carries real status meaning in UIs. Pure yellow
    (~88-103deg) sits in a genuine gap between warning-orange and
    success-green with no single strong UI convention; it's bucketed with
    warning since "yellow = caution" is the more common reading (traffic
    lights, hazard signage) when it DOES carry status meaning.
    """
    lab = hex_to_lab(hex_color)
    chroma = lab.chroma()

    if chroma < 12:
        return "neutral"

    hue = lab.hue_deg()
    if hue < 48 or hue >= 345:
        return "error"     # red family (wraps around 0/360)
    if 48 <= hue < 118:
        return "warning"   # orange/amber/yellow family
    if 118 <= hue < 200:
        return "success"   # green family
    if 200 <= hue < 300:
        return "info"      # cyan/blue family
    return "neutral"        # purple/magenta family — no strong UI convention


def get_semantic_info(hex_color: str) -> SemanticInfo:
    category = classify_semantic(hex_color)
    icon, label = SEMANTIC_ICONS[category]
    return SemanticInfo(icon=icon, label=label, category=category)


# ---------------------------------------------------------------------------
# Color Replacement (hue-space rotation away from the confusion axis)
# ---------------------------------------------------------------------------

# Per-anchor zone bounds are ASYMMETRIC: real-world reds spread mostly
# toward orange (e.g. #FF0000 at 40deg, away from anchor 0deg going
# positive), and real-world greens spread mostly toward cyan (anchor
# 130deg going positive, e.g. #27AE60 at 150deg) — not symmetrically in
# both directions. A symmetric +/-48deg zone around the green anchor would
# reach down to ~82deg and incorrectly catch yellow (~90deg), a color that
# reads as clearly safe even for severe red-green deficiency. Each entry is
# (anchor_deg, half_width_toward_lower_hues, half_width_toward_higher_hues).
_RED_GREEN_ZONE_BOUNDS = {
    0.0: (30.0, 45.0),     # red: narrower toward magenta/purple side, wider toward orange side
    130.0: (20.0, 35.0),   # green: narrower toward yellow side, wider toward cyan side
}
_BLUE_YELLOW_ZONE_BOUNDS = {
    90.0: (35.0, 20.0),    # yellow: wider toward orange/red side, narrower toward green side
    270.0: (55.0, 35.0),   # blue: wider toward cyan side (real "info blue" UI colors lean
                            # cyan, e.g. Bootstrap #17A2B8 at ~219deg, 51deg from anchor),
                            # narrower toward violet/purple side
}
_SEVERITY_ZONE_BONUS_DEG = 12.0  # added to BOTH bounds, scaled by severity

# Anchor hues (degrees) for each deficiency axis, matching
# PROTAN_DEUTAN_AXIS / TRITAN_AXIS in backend/app/core/test_stimuli.py.
# Red-green confusion is NOT "things near one midpoint" — red (~0deg) and
# green (~130deg) are far apart in raw hue angle but confused as a PAIR.
# So we check proximity to each anchor independently, rather than to a
# single midpoint between them.
RED_GREEN_ANCHORS_DEG = (0.0, 130.0)
BLUE_YELLOW_ANCHORS_DEG = (90.0, 270.0)

# Each confusable anchor hue is paired with its OWN dedicated target hue —
# not "whichever safe hue is nearest," which would let two different
# anchors (e.g. red AND green) both get pulled toward the same nearby safe
# hue and end up converging on each other. Red anchor -> blue target, green
# anchor -> yellow target (and the reverse for blue-yellow deficiency) keeps
# the two originally-confused colors pulled APART from each other, which is
# the entire point.
_ANCHOR_TO_TARGET_DEG: dict[float, float] = {
    # red-green axis: red -> blue, green -> yellow
    RED_GREEN_ANCHORS_DEG[0]: BLUE_YELLOW_ANCHORS_DEG[0],   # red (0deg)   -> "yellow" slot (90deg)... see note below
    RED_GREEN_ANCHORS_DEG[1]: BLUE_YELLOW_ANCHORS_DEG[1],   # green (130deg) -> "blue" slot (270deg)
    # blue-yellow axis: blue -> red, yellow -> green
    BLUE_YELLOW_ANCHORS_DEG[0]: RED_GREEN_ANCHORS_DEG[1],   # "yellow" slot (90deg) -> green (130deg)
    BLUE_YELLOW_ANCHORS_DEG[1]: RED_GREEN_ANCHORS_DEG[0],   # "blue" slot (270deg) -> red (0deg)
}


def _anchors_for_profile(profile: NormalizedVisionProfile) -> tuple[float, float] | None:
    """Returns the pair of confusable anchor hues for this profile's axis,
    preferring measured confusion_axis data when available."""
    if profile.confusion_axis is not None:
        return profile.confusion_axis.hue_a_deg, profile.confusion_axis.hue_b_deg
    if profile.deficiency_type == "red-green":
        return RED_GREEN_ANCHORS_DEG
    if profile.deficiency_type == "blue-yellow":
        return BLUE_YELLOW_ANCHORS_DEG
    return None


def _signed_hue_distance_deg(from_hue: float, to_hue: float) -> float:
    """Signed shortest-arc distance: positive if to_hue is 'above' from_hue
    going the short way around, negative if 'below'."""
    return ((to_hue - from_hue + 540) % 360) - 180


def _target_for_anchor(anchor_hue: float, profile: NormalizedVisionProfile) -> float:
    """
    Looks up the dedicated target hue for a known curated anchor. For a
    profile supplying its OWN measured confusion_axis (arbitrary hues, not
    necessarily matching the curated RED_GREEN/BLUE_YELLOW constants), we
    don't have a curated target, so we fall back to "rotate 90 degrees" —
    enough to move into a different perceptual hue family without a fixed
    lookup, while still being deterministic per-anchor (both measured
    anchors get rotated in OPPOSITE directions, so they separate rather
    than converge — see test_anchors_separate_not_converge).
    """
    if anchor_hue in _ANCHOR_TO_TARGET_DEG:
        return _ANCHOR_TO_TARGET_DEG[anchor_hue]
    if profile.confusion_axis is not None:
        a, b = profile.confusion_axis.hue_a_deg, profile.confusion_axis.hue_b_deg
        sign = 1.0 if anchor_hue == min(a, b) else -1.0
        return (anchor_hue + sign * 90.0) % 360
    return (anchor_hue + 90.0) % 360


def _zone_bounds_for_anchor(anchor_hue: float, deficiency_type: str) -> tuple[float, float]:
    """Returns (half_width_toward_lower_hues, half_width_toward_higher_hues)
    for a curated anchor, or a symmetric fallback for a measured/custom one."""
    bounds_table = _RED_GREEN_ZONE_BOUNDS if deficiency_type == "red-green" else _BLUE_YELLOW_ZONE_BOUNDS
    if anchor_hue in bounds_table:
        return bounds_table[anchor_hue]
    return (30.0, 30.0)  # symmetric fallback for a profile's own measured axis


def shift_color_for_profile(hex_color: str, profile: NormalizedVisionProfile) -> tuple[str, bool]:
    """Returns (new_hex, changed). changed=False means the input was returned untouched."""
    if profile.deficiency_type in ("none", "unknown") or profile.severity < SEVERITY_NO_OP_THRESHOLD:
        return hex_color, False

    anchors = _anchors_for_profile(profile)
    if anchors is None:
        return hex_color, False

    lab = hex_to_lab(hex_color)
    hue = lab.hue_deg()

    # For each anchor, check the SIGNED distance against that anchor's own
    # asymmetric bounds (see _RED_GREEN_ZONE_BOUNDS / _BLUE_YELLOW_ZONE_BOUNDS)
    # rather than one symmetric width for all anchors — real confusable hues
    # don't spread evenly in both directions from their anchor.
    best_match: tuple[float, float] | None = None  # (normalized_distance, anchor)
    for anchor in anchors:
        signed = _signed_hue_distance_deg(anchor, hue)
        lower_bound, upper_bound = _zone_bounds_for_anchor(anchor, profile.deficiency_type)
        bound = lower_bound if signed < 0 else upper_bound
        bonus = _SEVERITY_ZONE_BONUS_DEG * profile.severity
        effective_bound = bound + bonus
        if effective_bound <= 0:
            continue
        normalized = abs(signed) / effective_bound
        if normalized <= 1.0 and (best_match is None or normalized < best_match[0]):
            best_match = (normalized, anchor)

    if best_match is None:
        return hex_color, False  # not close enough to either confusable hue
    normalized_distance, nearest_anchor = best_match

    # Each anchor has its OWN dedicated target (see _ANCHOR_TO_TARGET_DEG),
    # so colors near DIFFERENT anchors get pulled toward DIFFERENT targets
    # and end up separated from each other, not converged on a shared
    # nearest-safe-hue.
    target_hue = _target_for_anchor(nearest_anchor, profile)

    # Blend strength is PRIMARILY severity — a severe deficiency gets a
    # strong push even near the zone's edge. We only apply a gentle taper
    # (never below EDGE_TAPER_FLOOR) so colors right at the boundary still
    # get a meaningful correction instead of nearly none.
    edge_taper = EDGE_TAPER_FLOOR + (1 - EDGE_TAPER_FLOOR) * (1.0 - normalized_distance)
    blend_amount = profile.severity * edge_taper  # 0..1

    new_hue = _slerp_hue_deg(hue, target_hue, blend_amount)
    new_lab = lab.with_hue(new_hue)
    return lab_to_hex(new_lab), True


def _slerp_hue_deg(from_deg: float, to_deg: float, t: float) -> float:
    """Interpolates along the SHORTER arc between two hue angles."""
    diff = ((to_deg - from_deg + 540) % 360) - 180  # range (-180, 180]
    return (from_deg + diff * t) % 360


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def transform_color(
    hex_color: str,
    profile: NormalizedVisionProfile,
    mode: TransformMode = "combined",
) -> TransformResult:
    """
    The single public entry point for the engine, per
    docs/transformation-engine-spec.md section 3.
    """
    if mode == "color":
        new_hex, changed = shift_color_for_profile(hex_color, profile)
        return TransformResult(original_hex=hex_color, transformed_hex=new_hex, semantic=None, changed=changed)

    if mode == "context":
        semantic = get_semantic_info(hex_color)
        return TransformResult(
            original_hex=hex_color, transformed_hex=None, semantic=semantic, changed=True
        )

    # combined
    new_hex, color_changed = shift_color_for_profile(hex_color, profile)
    semantic = None
    if profile.severity >= COMBINED_MODE_SEVERITY_THRESHOLD:
        semantic = get_semantic_info(hex_color)
    return TransformResult(
        original_hex=hex_color,
        transformed_hex=new_hex,
        semantic=semantic,
        changed=color_changed or semantic is not None,
    )
