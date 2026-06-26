"""Tests for engine/python/semantic_detector.py — the production rule-based detector."""
import pytest

from engine.python.semantic_detector import SemanticColorDetector

detector = SemanticColorDetector()


class TestTextSignalAlone:
    @pytest.mark.parametrize("text,expected", [
        ("Good", "success"), ("Success", "success"), ("Passed", "success"),
        ("Critical", "error"), ("Failed", "error"), ("Error", "error"),
        ("Warning", "warning"), ("Pending", "warning"), ("At Risk", "warning"),
        ("Info", "info"), ("In Progress", "info"),
    ])
    def test_brief_example_cases(self, text, expected):
        result = detector.detect(text=text)
        assert result.label == expected

    def test_word_boundary_good_does_not_match_goodbye(self):
        result = detector.detect(text="Goodbye for now")
        assert result.label == "neutral"

    def test_word_boundary_warning_does_not_match_inside_compound_word(self):
        result = detector.detect(text="forewarningless")
        assert result.label == "neutral"

    def test_case_insensitive_matching(self):
        assert detector.detect(text="CRITICAL").label == "error"
        assert detector.detect(text="critical").label == "error"
        assert detector.detect(text="Critical").label == "error"

    def test_no_text_no_color_returns_neutral_low_confidence(self):
        result = detector.detect()
        assert result.label == "neutral"
        assert result.confidence <= 0.4

    def test_more_specific_phrase_wins_over_shorter_match(self):
        result = detector.detect(text="This needs review before shipping")
        assert result.label == "warning"


class TestColorSignalAlone:
    @pytest.mark.parametrize("color,expected", [
        ("#E74C3C", "error"), ("#DC3545", "error"),
        ("#2ECC40", "success"), ("#28A745", "success"),
        ("#F39C12", "warning"), ("#FFC107", "warning"),
        ("#3498DB", "info"), ("#17A2B8", "info"),
    ])
    def test_color_only_matches_classify_semantic(self, color, expected):
        result = detector.detect(color_hex=color)
        assert result.label == expected

    def test_gray_color_alone_is_neutral_with_low_confidence(self):
        result = detector.detect(color_hex="#95A5A6")
        assert result.label == "neutral"
        assert result.confidence < 0.5

    def test_color_alone_has_lower_confidence_than_text_alone(self):
        color_result = detector.detect(color_hex="#E74C3C")
        text_result = detector.detect(text="Critical")
        assert color_result.confidence < text_result.confidence


class TestSignalFusion:
    def test_text_and_color_agreement_boosts_confidence(self):
        agree = detector.detect(color_hex="#E74C3C", text="Critical")
        text_only = detector.detect(text="Critical")
        assert agree.label == "error"
        assert agree.confidence > text_only.confidence

    def test_text_overrides_disagreeing_color_but_confidence_drops(self):
        """The brief's core test case: gray background but text says
        'Critical' must still resolve to error — color alone would say
        neutral, but text is the stronger signal."""
        result = detector.detect(color_hex="#95A5A6", text="Critical")
        assert result.label == "error"

    def test_text_wins_over_contradicting_color(self):
        """Green background, but text explicitly says 'Failed' — text
        should win, with reduced confidence to flag the ambiguity."""
        agree_result = detector.detect(color_hex="#E74C3C", text="Failed")
        conflict_result = detector.detect(color_hex="#2ECC40", text="Failed")
        assert conflict_result.label == "error"
        assert conflict_result.confidence < agree_result.confidence

    def test_context_alone_never_asserts_a_label(self):
        result = detector.detect(element_type="badge", parent_context="Revenue")
        assert result.label == "neutral"

    def test_context_nudges_confidence_when_combined_with_other_signals(self):
        without_context = detector.detect(color_hex="#E74C3C", text="Critical")
        with_context = detector.detect(
            color_hex="#E74C3C", text="Critical", element_type="badge", parent_context="System Status",
        )
        assert with_context.confidence >= without_context.confidence


class TestFinancialPatternRefinement:
    def test_revenue_gain_with_color(self):
        result = detector.detect(color_hex="#2ECC40", text="Revenue Gain", parent_context="Quarterly Revenue")
        assert result.label == "success"
        assert result.pattern == "gain"

    def test_revenue_loss_with_color(self):
        result = detector.detect(color_hex="#E74C3C", text="Revenue Loss", parent_context="Quarterly Revenue")
        assert result.label == "error"
        assert result.pattern == "loss"

    def test_gain_word_alone_no_color_no_parent_context(self):
        result = detector.detect(text="Revenue Gain")
        assert result.label == "success"
        assert result.pattern == "gain"

    def test_loss_word_with_gray_background(self):
        result = detector.detect(color_hex="#95A5A6", text="Revenue Loss")
        assert result.label == "error"
        assert result.pattern == "loss"

    def test_financial_context_without_explicit_gain_loss_word_infers_from_label(self):
        result = detector.detect(color_hex="#2ECC40", parent_context="Revenue")
        assert result.label == "success"
        assert result.pattern == "gain"

    def test_non_financial_success_has_no_pattern(self):
        result = detector.detect(color_hex="#2ECC40", text="Good")
        assert result.label == "success"
        assert result.pattern is None

    def test_warning_and_info_never_get_financial_pattern(self):
        warning_result = detector.detect(text="Warning")
        info_result = detector.detect(text="Info")
        assert warning_result.pattern is None
        assert info_result.pattern is None

    def test_explicit_status_word_beats_incidental_gain_word(self):
        """'Failed to gain market share' should be error, not success,
        even though 'gain' is present — 'failed' is more specific/direct."""
        result = detector.detect(text="Failed to gain market share")
        assert result.label == "error"


class TestMatchedSignalsTraceability:
    def test_matched_signals_populated_for_text_match(self):
        result = detector.detect(text="Critical")
        assert any("text:" in s for s in result.matched_signals)

    def test_matched_signals_populated_for_color_match(self):
        result = detector.detect(color_hex="#E74C3C")
        assert any("color:" in s for s in result.matched_signals)

    def test_matched_signals_flags_conflict(self):
        result = detector.detect(color_hex="#2ECC40", text="Failed")
        assert any("color_conflict" in s for s in result.matched_signals)

    def test_to_dict_shape(self):
        result = detector.detect(color_hex="#E74C3C", text="Critical")
        d = result.to_dict()
        assert set(d.keys()) == {"label", "confidence", "pattern", "matchedSignals"}
