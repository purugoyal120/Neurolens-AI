"""Tests for engine/python/semantic_detector_net.py, icon_library.py, text_extraction.py."""
import os
import tempfile

from engine.python.icon_library import get_default_label, get_icon
from engine.python.semantic_detector import DetectionResult
from engine.python.semantic_detector_net import (
    FEATURE_DIM,
    SemanticDetectorNet,
    featurize,
    load_model,
    make_synthetic_training_set,
    predict,
    save_model,
    train,
)
from engine.python.text_extraction import display_text, extract_text


class TestNeuralNetPipeline:
    def test_param_count_under_500kb_budget(self):
        model = SemanticDetectorNet()
        n_params = sum(p.numel() for p in model.parameters())
        approx_bytes = n_params * 4  # float32
        assert approx_bytes < 500_000

    def test_featurize_produces_correct_shape(self):
        f = featurize("#E74C3C", "Critical", "badge", "Revenue")
        assert f.shape == (FEATURE_DIM,)

    def test_featurize_handles_all_none_inputs(self):
        f = featurize(None, None, None, None)
        assert f.shape == (FEATURE_DIM,)

    def test_training_reduces_loss(self):
        examples = make_synthetic_training_set(200)
        model = SemanticDetectorNet()
        history = train(model, examples, epochs=80)
        assert history[-1] < history[0]
        assert history[-1] < 1.0

    def test_predict_returns_detection_result_shape(self):
        examples = make_synthetic_training_set(100)
        model = SemanticDetectorNet()
        train(model, examples, epochs=30)
        result = predict(model, "#E74C3C", "Critical", None, None)
        assert isinstance(result, DetectionResult)
        assert 0.0 <= result.confidence <= 1.0
        assert result.label in ("success", "warning", "error", "info", "neutral")

    def test_save_and_load_round_trip_preserves_predictions(self):
        examples = make_synthetic_training_set(150)
        model = SemanticDetectorNet()
        train(model, examples, epochs=50)

        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "model.pt")
            save_model(model, path)
            assert os.path.getsize(path) < 500_000

            loaded = load_model(path)
            before = predict(model, "#2ECC40", "Good", None, None)
            after = predict(loaded, "#2ECC40", "Good", None, None)
            assert before.label == after.label
            assert abs(before.confidence - after.confidence) < 1e-5


class TestIconLibrary:
    def test_base_icons_match_brief_examples(self):
        success = DetectionResult(label="success", confidence=0.9, pattern=None, matched_signals=())
        warning = DetectionResult(label="warning", confidence=0.9, pattern=None, matched_signals=())
        error = DetectionResult(label="error", confidence=0.9, pattern=None, matched_signals=())
        assert get_icon(success).icon == "✅"
        assert get_icon(warning).icon == "⚠"
        assert get_icon(error).icon == "❌"

    def test_financial_pattern_overrides_base_icon(self):
        gain = DetectionResult(label="success", confidence=0.9, pattern="gain", matched_signals=())
        loss = DetectionResult(label="error", confidence=0.9, pattern="loss", matched_signals=())
        assert get_icon(gain).icon == "📈"
        assert get_icon(loss).icon == "📉"
        assert get_icon(gain).pattern_class == "nl-pattern-gain"
        assert get_icon(loss).pattern_class == "nl-pattern-loss"

    def test_default_labels(self):
        assert get_default_label("success") == "Good"
        assert get_default_label("error") == "Critical"
        assert get_default_label("warning") == "Warning"


class TestTextExtraction:
    def test_priority_order(self):
        assert extract_text({"text_content": "Good", "aria_label": "Status OK"}) == "Good"
        assert extract_text({"text_content": "  ", "aria_label": "Status OK"}) == "Status OK"
        assert extract_text({"aria_label": "", "title": "tooltip"}) == "tooltip"
        assert extract_text({"child_text": "fallback"}) == "fallback"

    def test_no_sources_returns_none(self):
        assert extract_text({}) is None
        assert extract_text({"text_content": "", "aria_label": None}) is None

    def test_display_text_preserves_original(self):
        assert display_text("Custom Label", "success") == "Custom Label"

    def test_display_text_generates_fallback_per_brief_examples(self):
        assert display_text(None, "success") == "Success status"
        assert display_text(None, "warning") == "Warning indicator"
        assert display_text(None, "error") == "Error message"
