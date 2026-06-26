"""
Icon library — maps a DetectionResult to the actual icon + display text a
renderer (browser extension, Excel add-in, dashboard SDK, RN SDK) should
show. Separate from semantic_detector.py so detection logic and
presentation choices can evolve independently — e.g. swapping Unicode
icons for SVG/FontAwesome later only touches this file.
"""

from __future__ import annotations

from dataclasses import dataclass

from .semantic_detector import DetectionResult, SemanticLabel

# Base icons, used when no financial pattern refinement applies. Matches
# the brief's literal examples (success -> checkmark, warning -> warning
# sign, error -> X, info -> info).
BASE_ICONS: dict[SemanticLabel, str] = {
    "success": "✅",
    "warning": "⚠",
    "error": "❌",
    "info": "📘",
    "neutral": "◻",
}

# Financial pattern icons override the base icon when DetectionResult.pattern
# is set (see docs/semantic-detector-spec.md section 4).
PATTERN_ICONS: dict[str, str] = {
    "gain": "📈",
    "loss": "📉",
}

DEFAULT_LABELS: dict[SemanticLabel, str] = {
    "success": "Good",
    "warning": "Warning",
    "error": "Critical",
    "info": "Info",
    "neutral": "Neutral",
}


@dataclass(frozen=True)
class IconAssignment:
    icon: str
    # CSS class hint for a subtle pattern overlay (see pattern_library.py).
    # None unless a financial gain/loss pattern applies.
    pattern_class: str | None


def get_icon(result: DetectionResult) -> IconAssignment:
    if result.pattern and result.pattern in PATTERN_ICONS:
        return IconAssignment(icon=PATTERN_ICONS[result.pattern], pattern_class=f"nl-pattern-{result.pattern}")
    return IconAssignment(icon=BASE_ICONS.get(result.label, BASE_ICONS["neutral"]), pattern_class=None)


def get_default_label(label: SemanticLabel) -> str:
    return DEFAULT_LABELS.get(label, "Status")
