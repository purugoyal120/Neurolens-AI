"""Unit tests for engine/python/transformer.py — the core transformation algorithm."""
import pytest

from engine.python.color import hex_to_lab
from engine.python.profile_adapter import ConfusionAxis, NormalizedVisionProfile
from engine.python.transformer import (
    classify_semantic,
    get_semantic_info,
    shift_color_for_profile,
    transform_color,
)

NO_DEFICIENCY = NormalizedVisionProfile.no_deficiency()
SEVERE_RG = NormalizedVisionProfile(user_id="puru", deficiency_type="red-green", severity=0.9)
MODERATE_RG = NormalizedVisionProfile(user_id="x", deficiency_type="red-green", severity=0.5)
MILD_RG = NormalizedVisionProfile(user_id="x", deficiency_type="red-green", severity=0.2)
SEVERE_BY = NormalizedVisionProfile(user_id="x", deficiency_type="blue-yellow", severity=0.9)

REAL_WORLD_REDS = ["#E74C3C", "#DC3545", "#FF0000", "#C0392B", "#EF4444"]
REAL_WORLD_GREENS = ["#2ECC40", "#28A745", "#27AE60", "#22C55E", "#00FF00"]
REAL_WORLD_BLUES = ["#3498DB", "#17A2B8", "#2980B9", "#3B82F6"]
REAL_WORLD_WARNINGS = ["#F39C12", "#FFC107", "#E67E22", "#F59E0B", "#FFA500"]


# --- Color Replacement mode -------------------------------------------------

class TestColorReplacement:
    def test_no_deficiency_never_changes_anything(self):
        for hex_color in REAL_WORLD_REDS + REAL_WORLD_GREENS + REAL_WORLD_BLUES:
            new_hex, changed = shift_color_for_profile(hex_color, NO_DEFICIENCY)
            assert changed is False
            assert new_hex == hex_color

    def test_below_no_op_threshold_never_changes_anything(self):
        barely_mild = NormalizedVisionProfile(user_id="x", deficiency_type="red-green", severity=0.1)
        new_hex, changed = shift_color_for_profile("#E74C3C", barely_mild)
        assert changed is False
        assert new_hex == "#E74C3C"

    @pytest.mark.parametrize("hex_color", REAL_WORLD_REDS)
    def test_canonical_reds_are_shifted_for_severe_red_green(self, hex_color):
        new_hex, changed = shift_color_for_profile(hex_color, SEVERE_RG)
        assert changed is True
        assert new_hex != hex_color

    @pytest.mark.parametrize("hex_color", REAL_WORLD_GREENS)
    def test_canonical_greens_are_shifted_for_severe_red_green(self, hex_color):
        new_hex, changed = shift_color_for_profile(hex_color, SEVERE_RG)
        assert changed is True
        assert new_hex != hex_color

    @pytest.mark.parametrize("hex_color", REAL_WORLD_REDS)
    def test_canonical_reds_shifted_even_at_moderate_severity(self, hex_color):
        # Regression test: an earlier version of this algorithm only caught
        # canonical reds at severity >= ~0.7, leaving moderate-severity users
        # (a large, important segment) with zero correction.
        new_hex, changed = shift_color_for_profile(hex_color, MODERATE_RG)
        assert changed is True

    def test_red_and_green_shift_to_clearly_different_destinations(self):
        """The whole point: a red-green deficient user's reds and greens
        must NOT converge on the same corrected hue."""
        red_hex, _ = shift_color_for_profile("#E74C3C", SEVERE_RG)
        green_hex, _ = shift_color_for_profile("#2ECC40", SEVERE_RG)
        red_hue = hex_to_lab(red_hex).hue_deg()
        green_hue = hex_to_lab(green_hex).hue_deg()
        # Shortest arc between the two destination hues should be large —
        # i.e. they land in clearly different hue families.
        diff = abs(red_hue - green_hue) % 360
        diff = min(diff, 360 - diff)
        assert diff > 60, f"red landed at {red_hue}, green at {green_hue} — too close together"

    def test_orange_leaning_yellow_stays_safe_for_red_green_deficiency(self):
        """#F1C40F (flat-ui yellow, hue ~89deg) leans orange/warm enough that
        it should stay outside the green anchor's danger zone."""
        new_hex, changed = shift_color_for_profile("#F1C40F", SEVERE_RG)
        assert changed is False, "#F1C40F should be unaffected by red-green correction"

    def test_bright_saturated_yellow_can_be_caught_by_green_zone(self):
        """Documented real phenomenon: deuteranopes/deuteranomalous users
        confuse BRIGHT GREENS WITH YELLOWS specifically (not just red/green).
        #FFFF00 (hue ~103deg) sits close enough to the green anchor (130deg)
        that it's legitimate for the engine to treat it as in-zone — this is
        NOT a bug, unlike the earlier symmetric-zone version that pulled
        #F1C40F (a much more orange-leaning yellow) all the way to magenta."""
        new_hex, changed = shift_color_for_profile("#FFFF00", SEVERE_RG)
        assert changed is True

    def test_blue_stays_safe_for_red_green_deficiency(self):
        new_hex, changed = shift_color_for_profile("#3498DB", SEVERE_RG)
        assert changed is False

    @pytest.mark.parametrize("hex_color", REAL_WORLD_BLUES)
    def test_canonical_blues_are_shifted_for_severe_blue_yellow(self, hex_color):
        new_hex, changed = shift_color_for_profile(hex_color, SEVERE_BY)
        assert changed is True

    def test_red_and_green_stay_safe_for_blue_yellow_deficiency(self):
        for hex_color in REAL_WORLD_REDS + REAL_WORLD_GREENS:
            new_hex, changed = shift_color_for_profile(hex_color, SEVERE_BY)
            assert changed is False, f"{hex_color} should be unaffected by blue-yellow correction"

    def test_lightness_and_chroma_roughly_preserved_after_shift(self):
        """with_hue() preserves L and chroma EXACTLY in Lab space — confirmed
        directly — but the rotated Lab coordinate can land outside the sRGB
        gamut, and clamping back into gamut during lab_to_hex causes some
        real, unavoidable drift. This checks the drift stays small, not that
        it's exactly zero."""
        before = hex_to_lab("#E74C3C")
        new_hex, changed = shift_color_for_profile("#E74C3C", SEVERE_RG)
        assert changed is True
        after = hex_to_lab(new_hex)
        assert abs(before.L - after.L) < 2.0
        assert abs(before.chroma() - after.chroma()) < 15.0

    def test_severity_zero_to_one_is_monotonically_more_aggressive(self):
        """Higher severity should move the hue further from its original
        position (not necessarily monotonic in absolute degrees due to the
        edge taper, but should generally trend stronger)."""
        results = []
        for severity in [0.2, 0.5, 0.9]:
            profile = NormalizedVisionProfile(user_id="x", deficiency_type="red-green", severity=severity)
            new_hex, _ = shift_color_for_profile("#E74C3C", profile)
            results.append(hex_to_lab(new_hex).hue_deg())
        # All should differ from the original (35.9deg) and trend upward
        # (toward the orange/warning target) as severity increases.
        assert results[0] < results[1] < results[2]

    def test_uses_measured_confusion_axis_when_provided(self):
        """A profile with its own measured confusion_axis should use that
        instead of the default curated anchors."""
        custom_profile = NormalizedVisionProfile(
            user_id="custom", deficiency_type="red-green", severity=0.9,
            confusion_axis=ConfusionAxis(hue_a_deg=10.0, hue_b_deg=140.0),
        )
        # A color near the custom axis's anchors should still be caught.
        new_hex, changed = shift_color_for_profile("#E74C3C", custom_profile)
        assert changed is True

    def test_unknown_deficiency_type_never_changes_anything(self):
        unknown_profile = NormalizedVisionProfile(user_id="x", deficiency_type="unknown", severity=0.9)
        new_hex, changed = shift_color_for_profile("#E74C3C", unknown_profile)
        assert changed is False


# --- Context Replacement mode -----------------------------------------------

class TestContextReplacement:
    @pytest.mark.parametrize("hex_color", REAL_WORLD_REDS)
    def test_reds_classify_as_error(self, hex_color):
        assert classify_semantic(hex_color) == "error"

    @pytest.mark.parametrize("hex_color", REAL_WORLD_GREENS)
    def test_greens_classify_as_success(self, hex_color):
        assert classify_semantic(hex_color) == "success"

    @pytest.mark.parametrize("hex_color", REAL_WORLD_WARNINGS)
    def test_oranges_classify_as_warning(self, hex_color):
        assert classify_semantic(hex_color) == "warning"

    @pytest.mark.parametrize("hex_color", REAL_WORLD_BLUES)
    def test_blues_classify_as_info(self, hex_color):
        assert classify_semantic(hex_color) == "info"

    def test_gray_classifies_as_neutral_regardless_of_hue(self):
        assert classify_semantic("#95A5A6") == "neutral"
        assert classify_semantic("#7F8C8D") == "neutral"

    def test_purple_classifies_as_neutral(self):
        assert classify_semantic("#9B59B6") == "neutral"

    def test_semantic_info_matches_brief_examples_exactly(self):
        """Locks in the brief's literal examples: green->Good/checkmark,
        orange->Warning, red->Critical/X."""
        green_info = get_semantic_info("#2ECC40")
        assert green_info.icon == "✅"
        assert green_info.label == "Good"

        warning_info = get_semantic_info("#F39C12")
        assert warning_info.icon == "⚠"
        assert warning_info.label == "Warning"

        error_info = get_semantic_info("#E74C3C")
        assert error_info.icon == "❌"
        assert error_info.label == "Critical"

    def test_context_mode_is_independent_of_vision_profile(self):
        """Context replacement should classify the same way regardless of
        the user's deficiency type or severity — it's not personalized,
        it removes color from the decision path for everyone."""
        result_severe = transform_color("#E74C3C", SEVERE_RG, mode="context")
        result_none = transform_color("#E74C3C", NO_DEFICIENCY, mode="context")
        assert result_severe.semantic == result_none.semantic


# --- Combined mode + public entry point -------------------------------------

class TestCombinedModeAndEntryPoint:
    def test_combined_mode_includes_semantic_above_threshold(self):
        result = transform_color("#E74C3C", SEVERE_RG, mode="combined")
        assert result.semantic is not None
        assert result.semantic.category == "error"
        assert result.transformed_hex != "#E74C3C"

    def test_combined_mode_omits_semantic_below_threshold(self):
        result = transform_color("#E74C3C", MILD_RG, mode="combined")
        assert result.semantic is None

    def test_color_mode_never_returns_semantic(self):
        result = transform_color("#E74C3C", SEVERE_RG, mode="color")
        assert result.semantic is None

    def test_context_mode_never_returns_transformed_hex(self):
        result = transform_color("#E74C3C", SEVERE_RG, mode="context")
        assert result.transformed_hex is None

    def test_to_dict_shape(self):
        result = transform_color("#E74C3C", SEVERE_RG, mode="combined")
        d = result.to_dict()
        assert set(d.keys()) == {"originalHex", "transformedHex", "semantic", "changed"}
        assert d["originalHex"] == "#E74C3C"

    def test_changed_is_false_when_truly_nothing_happens(self):
        result = transform_color("#3498DB", SEVERE_RG, mode="color")
        assert result.changed is False

    def test_no_deficiency_profile_safe_default(self):
        profile = NormalizedVisionProfile.no_deficiency("anon")
        result = transform_color("#E74C3C", profile, mode="combined")
        assert result.transformed_hex == "#E74C3C"
        # combined mode with severity 0.0 is below threshold, so no semantic either
        assert result.semantic is None
