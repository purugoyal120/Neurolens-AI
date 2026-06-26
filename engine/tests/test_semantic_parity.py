"""
Cross-language parity tests for the semantic detector: asserts
engine/python/semantic_detector.py and engine/js/semanticDetector.js
produce IDENTICAL outputs for the same inputs. Same mechanism as
test_parity.py (Node subprocess bridge) — see that file's docstring for
the rationale.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from engine.python.semantic_detector import SemanticColorDetector

ENGINE_JS_DIR = Path(__file__).resolve().parent.parent / "js"
NODE_AVAILABLE = shutil.which("node") is not None

detector = SemanticColorDetector()

# (color_hex, text, element_type, parent_context)
TEST_CASES = [
    ("#2ECC40", "Good", None, None),
    ("#E74C3C", "Critical", "badge", "System Status"),
    ("#F1C40F", "Warning", None, None),
    (None, "Failed", None, None),
    ("#95A5A6", "Critical", "badge", None),
    ("#2ECC40", "Failed", None, None),
    ("#9B59B6", None, None, None),
    (None, None, None, None),
    ("#2ECC40", "Revenue Gain", None, "Quarterly Revenue"),
    ("#E74C3C", "Revenue Loss", None, "Quarterly Revenue"),
    ("#2ECC40", None, None, "Revenue"),
    (None, "Revenue Gain", None, None),
    ("#95A5A6", "Revenue Loss", None, None),
    (None, "Failed to gain market share", None, None),
    (None, "Goodbye for now", None, None),
    (None, "This needs review before shipping", None, None),
    ("#3498DB", "In Progress", "status", None),
    ("#17A2B8", None, "badge", "Audit"),
]


def _run_js_batch(cases: list[dict]) -> list[dict]:
    script = """
    import { SemanticColorDetector } from './semanticDetector.js';
    let input = '';
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('end', () => {
      const detector = new SemanticColorDetector();
      const cases = JSON.parse(input);
      const results = cases.map(c => detector.detect({
        colorHex: c.colorHex, text: c.text, elementType: c.elementType, parentContext: c.parentContext,
      }));
      process.stdout.write(JSON.stringify(results));
    });
    """
    script_path = ENGINE_JS_DIR / "_semantic_parity_runner.mjs"
    script_path.write_text(script)
    try:
        proc = subprocess.run(
            ["node", str(script_path)],
            input=json.dumps(cases),
            capture_output=True,
            text=True,
            cwd=str(ENGINE_JS_DIR),
            timeout=15,
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Node script failed: {proc.stderr}")
        return json.loads(proc.stdout)
    finally:
        script_path.unlink(missing_ok=True)


@pytest.mark.skipif(not NODE_AVAILABLE, reason="Node.js not available in this environment")
def test_semantic_detector_parity_across_all_cases():
    js_cases = [
        {"colorHex": color, "text": text, "elementType": etype, "parentContext": parent}
        for color, text, etype, parent in TEST_CASES
    ]
    js_results = _run_js_batch(js_cases)

    for (color, text, etype, parent), js_result in zip(TEST_CASES, js_results):
        py_result = detector.detect(color_hex=color, text=text, element_type=etype, parent_context=parent)
        case_desc = f"color={color} text={text!r} etype={etype} parent={parent!r}"

        assert py_result.label == js_result["label"], (
            f"{case_desc}: python={py_result.label} js={js_result['label']}"
        )
        assert abs(py_result.confidence - js_result["confidence"]) < 1e-6, (
            f"{case_desc}: python={py_result.confidence} js={js_result['confidence']}"
        )
        assert py_result.pattern == js_result["pattern"], case_desc
        assert list(py_result.matched_signals) == js_result["matchedSignals"], (
            f"{case_desc}: python={py_result.matched_signals} js={js_result['matchedSignals']}"
        )
