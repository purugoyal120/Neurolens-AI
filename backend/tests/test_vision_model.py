"""Tests for the rule-based vision scoring model."""
from app.ml.vision_model import VisionModel

model = VisionModel(use_neural=False)


def _resp(trial_id: str, answer: str, rt: int = 1000) -> dict:
    return {"trial_id": trial_id, "answer": answer, "response_time_ms": rt}


NORMAL_VISION_RESPONSES = [
    _resp("rg_discrim_1", "different"),
    _resp("rg_discrim_2", "different"),
    _resp("rg_discrim_3", "different"),
    _resp("by_discrim_1", "different"),
    _resp("by_discrim_2", "different"),
    _resp("by_discrim_3", "different"),
    _resp("ident_red", "Red"),
    _resp("ident_green", "Green"),
    _resp("ident_brownish", "Brown"),
    _resp("control_1", "different"),
    _resp("control_2", "different"),
    _resp("calibration_1", "different"),
]


def test_normal_vision_detected_as_none():
    result = model.score(NORMAL_VISION_RESPONSES)
    assert result["cvd_type"] == "none"
    assert result["severity"] == 0.0
    assert result["recommended_strategy"] == "none"
    assert result["confidence"] > 0.9


def test_severe_red_green_detected_with_icon_strategy():
    responses = [
        _resp("rg_discrim_1", "same"),
        _resp("rg_discrim_2", "same"),
        _resp("rg_discrim_3", "same"),
        _resp("by_discrim_1", "different"),
        _resp("by_discrim_2", "different"),
        _resp("by_discrim_3", "different"),
        _resp("ident_red", "Brown"),
        _resp("ident_green", "Brown"),
        _resp("ident_brownish", "Green"),
        _resp("control_1", "different"),
        _resp("control_2", "different"),
        _resp("calibration_1", "different"),
    ]
    result = model.score(responses)
    assert result["cvd_type"] in ("protan", "deutan")
    assert result["severity"] == 1.0
    assert result["recommended_strategy"] == "icon_replacement"


def test_mild_deficiency_only_fails_hardest_trial():
    responses = list(NORMAL_VISION_RESPONSES)
    # Override just the hardest red-green trial to a failure.
    responses = [r for r in responses if r["trial_id"] != "rg_discrim_3"]
    responses.append(_resp("rg_discrim_3", "same", rt=3500))

    result = model.score(responses)
    assert result["cvd_type"] in ("protan", "deutan")
    # Failing only the hardest trial => low severity, not maximum.
    assert result["severity"] < 0.3
    assert result["recommended_strategy"] == "shift_hue"


def test_tritan_detected_on_blue_yellow_axis():
    responses = [
        _resp("rg_discrim_1", "different"),
        _resp("rg_discrim_2", "different"),
        _resp("rg_discrim_3", "different"),
        _resp("by_discrim_1", "same"),
        _resp("by_discrim_2", "same"),
        _resp("by_discrim_3", "same"),
        _resp("ident_red", "Red"),
        _resp("ident_green", "Green"),
        _resp("ident_brownish", "Brown"),
        _resp("control_1", "different"),
        _resp("control_2", "different"),
        _resp("calibration_1", "different"),
    ]
    result = model.score(responses)
    assert result["cvd_type"] == "tritan"
    assert result["severity"] == 1.0


def test_failed_controls_lower_confidence():
    good = model.score(NORMAL_VISION_RESPONSES)

    bad_responses = list(NORMAL_VISION_RESPONSES)
    bad_responses = [r for r in bad_responses if r["trial_id"] not in ("control_1", "control_2")]
    bad_responses.append(_resp("control_1", "same"))
    bad_responses.append(_resp("control_2", "same"))
    bad = model.score(bad_responses)

    assert bad["confidence"] < good["confidence"]


def test_unknown_trial_ids_ignored_gracefully():
    responses = [_resp("not_a_real_trial", "different")]
    result = model.score(responses)
    # Should not crash; with zero usable responses, no deficiency detected.
    assert result["cvd_type"] == "none"
