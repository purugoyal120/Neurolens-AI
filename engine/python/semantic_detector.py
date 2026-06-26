"""
SemanticColorDetector — rule-based signal fusion, the production detector.

See docs/semantic-detector-spec.md sections 1-4 for the full design
rationale, including why this is the real "AI model" deliverable rather
than an untrained neural net (that architecture exists separately in
semantic_detector_net.py, explicitly flagged as not production-ready).

Public interface:
    detector = SemanticColorDetector()
    label, confidence = detector.detect(
        color_hex="#E74C3C", text="Critical", element_type="badge",
        parent_context="System Status",
    )
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .semantic_lexicon import (
    FINANCIAL_CONTEXT_KEYWORDS,
    GAIN_KEYWORDS,
    LOSS_KEYWORDS,
    STATUS_BEARING_ELEMENT_TYPES,
    TEXT_KEYWORDS,
)
from .transformer import SemanticCategory, classify_semantic

SemanticLabel = SemanticCategory  # 'success'|'warning'|'error'|'info'|'neutral'


@dataclass(frozen=True)
class DetectionResult:
    label: SemanticLabel
    confidence: float
    # Populated only when a financial gain/loss refinement applied (spec
    # section 4) — None otherwise. Rendering layers use this to pick
    # the gain/loss icon instead of the generic success/error icon.
    pattern: str | None  # 'gain' | 'loss' | None
    # Which signal(s) actually drove the decision — useful for debugging
    # and for a settings UI that wants to explain "why did this happen."
    matched_signals: tuple[str, ...]

    def to_dict(self) -> dict:
        return {
            "label": self.label,
            "confidence": round(self.confidence, 3),
            "pattern": self.pattern,
            "matchedSignals": list(self.matched_signals),
        }


_WORD_BOUNDARY_CACHE: dict[str, re.Pattern] = {}


def _phrase_pattern(phrase: str) -> re.Pattern:
    """Compiles (and caches) a word-boundary regex for a keyword/phrase,
    so 'good' doesn't match inside 'goodbye' and 'warning' doesn't match
    inside 'Early Warning System'."""
    if phrase not in _WORD_BOUNDARY_CACHE:
        escaped = re.escape(phrase)
        _WORD_BOUNDARY_CACHE[phrase] = re.compile(rf"\b{escaped}\b", re.IGNORECASE)
    return _WORD_BOUNDARY_CACHE[phrase]


def _find_matching_keywords(text: str, keyword_set: set[str]) -> list[str]:
    if not text:
        return []
    return [kw for kw in keyword_set if _phrase_pattern(kw).search(text)]


class SemanticColorDetector:
    """
    Rule-based signal fusion detector. Stateless and cheap to construct —
    no model file to load, no warm-up cost, microsecond-scale inference.
    """

    def detect(
        self,
        color_hex: str | None = None,
        text: str | None = None,
        element_type: str | None = None,
        parent_context: str | None = None,
    ) -> DetectionResult:
        text_label, text_confidence, text_matched = self._text_signal(text)
        color_label, color_confidence = self._color_signal(color_hex)
        context_bias = self._context_signal(element_type, parent_context)

        label, confidence, matched_signals = self._fuse(
            text_label, text_confidence, text_matched,
            color_label, color_confidence,
            context_bias,
        )

        pattern = self._financial_refinement(label, text, parent_context)

        return DetectionResult(
            label=label, confidence=confidence, pattern=pattern,
            matched_signals=tuple(matched_signals),
        )

    # -- signal extraction -------------------------------------------------

    def _text_signal(self, text: str | None) -> tuple[SemanticLabel | None, float, list[str]]:
        if not text:
            return None, 0.0, []

        # Check every category, keep the one with the most specific (longest)
        # matching keyword — "needs review" beats a coincidental shorter
        # match, and resolves ties deterministically rather than by dict
        # iteration order.
        best_label: SemanticLabel | None = None
        best_match = ""
        for label, keywords in TEXT_KEYWORDS.items():
            matches = _find_matching_keywords(text, keywords)
            for m in matches:
                if len(m) > len(best_match):
                    best_match = m
                    best_label = label  # type: ignore[assignment]

        # Gain/loss words (see semantic_lexicon.py) are ALSO a base text
        # signal in their own right — "Revenue Gain" on a gray/uncolored
        # badge should still detect as success, not fall through to a weak
        # color-only guess just because "gain" isn't in TEXT_KEYWORDS
        # directly. They only compete on specificity (match length) like
        # any other keyword, so an explicit status word ("Failed") still
        # wins over an incidental gain/loss word in the same string.
        for kw in _find_matching_keywords(text, GAIN_KEYWORDS):
            if len(kw) > len(best_match):
                best_match, best_label = kw, "success"
        for kw in _find_matching_keywords(text, LOSS_KEYWORDS):
            if len(kw) > len(best_match):
                best_match, best_label = kw, "error"

        if best_label is None:
            return None, 0.0, []
        return best_label, 0.85, [best_match]

    def _color_signal(self, color_hex: str | None) -> tuple[SemanticLabel | None, float]:
        if not color_hex:
            return None, 0.0
        category = classify_semantic(color_hex)
        if category == "neutral":
            return "neutral", 0.3  # weak — gray could mean anything
        return category, 0.6

    def _context_signal(self, element_type: str | None, parent_context: str | None) -> float:
        """Returns a small confidence BONUS (not a label) — context alone
        never asserts a label per spec section 2."""
        bonus = 0.0
        if element_type and element_type.lower() in STATUS_BEARING_ELEMENT_TYPES:
            bonus += 0.05
        if parent_context:
            lowered = parent_context.lower()
            if any(_phrase_pattern(kw).search(lowered) for kw in FINANCIAL_CONTEXT_KEYWORDS):
                bonus += 0.05
        return bonus

    # -- fusion --------------------------------------------------------

    def _fuse(
        self,
        text_label: SemanticLabel | None, text_confidence: float, text_matched: list[str],
        color_label: SemanticLabel | None, color_confidence: float,
        context_bonus: float,
    ) -> tuple[SemanticLabel, float, list[str]]:
        matched_signals: list[str] = []

        if text_label is not None:
            matched_signals.append(f"text:{text_matched[0]}")
            if color_label is not None and color_label == text_label:
                # Text and color agree — strongest possible case.
                confidence = min(1.0, text_confidence + 0.10 + context_bonus)
                matched_signals.append(f"color:{color_label}")
                return text_label, confidence, matched_signals
            if color_label is not None and color_label not in ("neutral", text_label):
                # Text and color DISAGREE. Text wins (it's the more direct
                # evidence of intended meaning) but confidence is reduced to
                # flag the ambiguity — see spec section 3.
                matched_signals.append(f"color_conflict:{color_label}")
                confidence = max(0.0, text_confidence - 0.15 + context_bonus)
                return text_label, confidence, matched_signals
            # Text fires, color is absent/neutral/uninformative.
            confidence = min(1.0, text_confidence + context_bonus)
            return text_label, confidence, matched_signals

        if color_label is not None and color_label != "neutral":
            matched_signals.append(f"color:{color_label}")
            confidence = min(1.0, color_confidence + context_bonus)
            return color_label, confidence, matched_signals

        # Nothing meaningful fired.
        if context_bonus > 0:
            matched_signals.append("context_only")
        return "neutral", min(0.3 + context_bonus, 0.4), matched_signals

    # -- financial gain/loss refinement (spec section 4) --------------------

    def _financial_refinement(
        self, label: SemanticLabel, text: str | None, parent_context: str | None,
    ) -> str | None:
        if label not in ("success", "error"):
            return None

        combined = f"{text or ''} {parent_context or ''}".lower()
        is_financial_context = any(
            _phrase_pattern(kw).search(combined) for kw in FINANCIAL_CONTEXT_KEYWORDS
        )
        has_gain_word = any(_phrase_pattern(kw).search(combined) for kw in GAIN_KEYWORDS)
        has_loss_word = any(_phrase_pattern(kw).search(combined) for kw in LOSS_KEYWORDS)

        if has_gain_word and label == "success":
            return "gain"
        if has_loss_word and label == "error":
            return "loss"
        # Financial context without an explicit gain/loss word: infer from
        # the base label alone (success in a revenue context likely IS a
        # gain, even if the word "gain" itself wasn't used).
        if is_financial_context:
            return "gain" if label == "success" else "loss"
        return None
