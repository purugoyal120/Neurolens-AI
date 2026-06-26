"""
Smart text extraction (spec brief item 3).

Given a dict describing an element's available text sources, picks the
best one to use as both (a) the text signal fed into SemanticColorDetector
and (b) the display text shown alongside the icon. Falls back to a
generated descriptive label when nothing usable is found.

This is intentionally a plain function operating on a plain dict rather
than a real DOM node, so it's testable without a browser and reusable from
the Excel add-in (cell text) and React Native SDK (component children),
which have no DOM at all.
"""

from __future__ import annotations

from .icon_library import get_default_label
from .semantic_detector import SemanticLabel

# Priority order matches the brief: direct text content first (most
# deliberate), then aria-label (explicit accessibility intent), then title
# (tooltip — often present but secondary), then child text nodes.
_SOURCE_PRIORITY = ("text_content", "aria_label", "title", "child_text")


def extract_text(sources: dict[str, str | None]) -> str | None:
    """
    sources: dict with any of the keys in _SOURCE_PRIORITY, values being
    the raw extracted strings (already pulled from the DOM/cell/props by
    the caller — this function does no DOM access itself).
    Returns the first non-empty, non-whitespace-only source, or None.
    """
    for key in _SOURCE_PRIORITY:
        value = sources.get(key)
        if value and value.strip():
            return value.strip()
    return None


def display_text(extracted_text: str | None, label: SemanticLabel) -> str:
    """
    Returns the text to actually display next to the icon. Preserves the
    original text if one was found (per spec: "preserve original text +
    add icon prefix"); otherwise generates a descriptive fallback like
    "Success status" / "Warning indicator" per the brief's examples.
    """
    if extracted_text:
        return extracted_text

    fallback_phrasing: dict[SemanticLabel, str] = {
        "success": "Success status",
        "warning": "Warning indicator",
        "error": "Error message",
        "info": "Information",
        "neutral": f"{get_default_label(label)} status",
    }
    return fallback_phrasing.get(label, "Status")
