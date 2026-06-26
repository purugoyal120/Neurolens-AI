"""Tests for the rule-based vision profile analyzer (simple 10-question module)."""
from app.ml.vision_test_analyzer import analyze_vision_profile


def _ans(qid: str, opt: str, rt: int = 1000) -> dict:
    return {"question_id": qid, "selected_option_id": opt, "response_time_ms": rt}


PERFECT_ANSWERS = [
    _ans("q1", "q1_a"), _ans("q2", "q2_b"), _ans("q3", "q3_b"),
    _ans("q4", "q4_b"), _ans("q5", "q5_b"), _ans("q6", "q6_c"),
    _ans("q7", "q7_b"), _ans("q8", "q8_c"), _ans("q9", "q9_b"), _ans("q10", "q10_b"),
]


def test_perfect_score_yields_no_deficiency():
    result = analyze_vision_profile("user_perfect", PERFECT_ANSWERS)
    assert result["deficiency_type"] == "none"
    assert result["severity"] == "none"
    assert result["recommended_transformations"] == []
    assert all(v == 1.0 for v in result["perception_scores"].values())
    assert result["_score_summary"]["accuracy"] == 1.0


def test_red_green_confusion_detected():
    answers = [
        _ans("q1", "q1_b"),  # red stimulus -> picked green
        _ans("q2", "q2_a"),  # green stimulus -> picked red
        _ans("q3", "q3_a"),  # red stimulus -> picked brown
    ] + PERFECT_ANSWERS[3:]
    result = analyze_vision_profile("puru", answers)
    assert result["deficiency_type"] == "red-green"
    assert result["severity"] in ("mild", "moderate", "severe")
    assert result["perception_scores"]["red"] < 1.0
    assert len(result["recommended_transformations"]) > 0
    assert all(t["reason"] == "red-green confusion" for t in result["recommended_transformations"])


def test_blue_yellow_confusion_detected():
    answers = PERFECT_ANSWERS[:3] + [
        _ans("q4", "q4_a"),  # blue stimulus -> picked yellow
        _ans("q5", "q5_a"),  # yellow stimulus -> picked blue
        _ans("q6", "q6_a"),  # blue stimulus -> picked yellow
    ] + PERFECT_ANSWERS[6:]
    result = analyze_vision_profile("user_by", answers)
    assert result["deficiency_type"] == "blue-yellow"
    assert result["perception_scores"]["blue"] < 1.0
    assert result["perception_scores"]["yellow"] < 1.0
    assert all(t["reason"] == "blue-yellow confusion" for t in result["recommended_transformations"])


def test_severity_scales_with_error_rate():
    mild_answers = [_ans("q1", "q1_b")] + PERFECT_ANSWERS[1:]
    mild_result = analyze_vision_profile("u1", mild_answers)

    severe_answers = [
        _ans("q1", "q1_b"), _ans("q2", "q2_a"), _ans("q3", "q3_a"),
        _ans("q8", "q8_a"), _ans("q9", "q9_a"),
    ] + PERFECT_ANSWERS[3:8] + PERFECT_ANSWERS[9:]
    severe_result = analyze_vision_profile("u2", severe_answers)

    severity_order = {"none": 0, "mild": 1, "moderate": 2, "severe": 3}
    assert severity_order[severe_result["severity"]] >= severity_order[mild_result["severity"]]


def test_empty_answers_does_not_crash_and_defaults_safely():
    result = analyze_vision_profile("nobody_answered", [])
    assert result["deficiency_type"] == "none"
    assert result["_score_summary"]["total_questions"] == 0
    assert result["_score_summary"]["accuracy"] == 0.0


def test_unknown_question_and_option_ids_ignored_gracefully():
    answers = [
        _ans("not_a_real_question", "opt_x"),
        _ans("q1", "not_a_real_option"),
        _ans("q2", "q2_b"),  # one valid answer
    ]
    result = analyze_vision_profile("user_garbage", answers)
    assert result["_score_summary"]["total_questions"] == 1
    assert result["_score_summary"]["correct_count"] == 1


def test_unrelated_wrong_answer_not_classified_as_either_axis():
    # q3 stimulus is "red"; picking "purple" isn't in either confusion set.
    answers = [_ans("q3", "q3_d")] + PERFECT_ANSWERS[:2] + PERFECT_ANSWERS[3:]
    result = analyze_vision_profile("user_random_miss", answers)
    # Should not be misclassified as a color deficiency from an unrelated miss.
    assert result["deficiency_type"] == "none"


def test_perception_score_for_decoy_only_category():
    # "purple" never appears as a stimulus in QUESTIONS, only as a decoy
    # option. A user who never picks it should score 1.0 on it.
    result = analyze_vision_profile("user_perfect2", PERFECT_ANSWERS)
    assert result["perception_scores"]["red"] == 1.0
