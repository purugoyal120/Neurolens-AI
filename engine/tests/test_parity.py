"""
Cross-language parity tests: asserts engine/python/transformer.py and
engine/js/transformer.js produce IDENTICAL outputs for the same inputs.

This is the test that actually enforces docs/transformation-engine-spec.md
section 4's claim that both ports implement "the SAME documented algorithm."
Without this, the two files could silently drift apart over time and no
one would notice until a user got different behavior in the browser
extension vs. a server-side batch job.

Mechanism: write a small Node.js script that imports the JS module, runs it
against a JSON-encoded batch of test cases (read from stdin), and prints
JSON results to stdout. Python then runs both the Python function directly
and the Node script via subprocess, and diffs the two result sets.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from engine.python.profile_adapter import ConfusionAxis, NormalizedVisionProfile
from engine.python.transformer import classify_semantic, transform_color

ENGINE_JS_DIR = Path(__file__).resolve().parent.parent / "js"

NODE_AVAILABLE = shutil.which("node") is not None

# (hex_color, deficiency_type, severity, confusion_axis_or_None, mode)
TEST_CASES = [
    ("#E74C3C", "red-green", 0.9, None, "color"),
    ("#2ECC40", "red-green", 0.9, None, "color"),
    ("#DC3545", "red-green", 0.5, None, "color"),
    ("#FF0000", "red-green", 0.2, None, "color"),
    ("#3498DB", "red-green", 0.9, None, "color"),
    ("#F1C40F", "red-green", 0.9, None, "color"),
    ("#FFFF00", "red-green", 0.9, None, "color"),
    ("#17A2B8", "blue-yellow", 0.9, None, "color"),
    ("#3498DB", "blue-yellow", 0.9, None, "color"),
    ("#9B59B6", "blue-yellow", 0.9, None, "color"),
    ("#E74C3C", "none", 0.9, None, "color"),
    ("#E74C3C", "red-green", 0.1, None, "color"),  # below no-op threshold
    ("#E74C3C", "red-green", 0.9, (0.0, 130.0), "color"),  # measured axis matching curated
    ("#E74C3C", "red-green", 0.9, (10.0, 140.0), "color"),  # measured axis NOT matching curated
    ("#E74C3C", "red-green", 0.9, None, "context"),
    ("#2ECC40", "red-green", 0.9, None, "context"),
    ("#F39C12", "red-green", 0.9, None, "context"),
    ("#95A5A6", "red-green", 0.9, None, "context"),
    ("#E74C3C", "red-green", 0.9, None, "combined"),
    ("#E74C3C", "red-green", 0.2, None, "combined"),
]

SEMANTIC_TEST_COLORS = [
    "#E74C3C", "#DC3545", "#FF0000", "#2ECC40", "#28A745",
    "#F39C12", "#FFC107", "#3498DB", "#17A2B8", "#95A5A6", "#9B59B6",
]


def _run_js_batch(cases: list[dict]) -> list[dict]:
    script = """
    import { transformColor } from './transformer.js';
    let input = '';
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('end', () => {
      const cases = JSON.parse(input);
      const results = cases.map(c => {
        const profile = {
          userId: 'test',
          deficiencyType: c.deficiencyType,
          severity: c.severity,
          confusionAxis: c.confusionAxis
            ? { hueADeg: c.confusionAxis[0], hueBDeg: c.confusionAxis[1] }
            : null,
        };
        return transformColor(c.hex, profile, c.mode);
      });
      process.stdout.write(JSON.stringify(results));
    });
    """
    script_path = ENGINE_JS_DIR / "_parity_runner.mjs"
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


def _run_js_semantic_batch(hex_colors: list[str]) -> list[str]:
    script = """
    import { classifySemantic } from './transformer.js';
    let input = '';
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('end', () => {
      const colors = JSON.parse(input);
      process.stdout.write(JSON.stringify(colors.map(classifySemantic)));
    });
    """
    script_path = ENGINE_JS_DIR / "_parity_semantic_runner.mjs"
    script_path.write_text(script)
    try:
        proc = subprocess.run(
            ["node", str(script_path)],
            input=json.dumps(hex_colors),
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
def test_transform_color_parity_across_all_cases():
    js_cases = [
        {
            "hex": hex_color,
            "deficiencyType": deficiency_type,
            "severity": severity,
            "confusionAxis": list(axis) if axis else None,
            "mode": mode,
        }
        for hex_color, deficiency_type, severity, axis, mode in TEST_CASES
    ]
    js_results = _run_js_batch(js_cases)

    for (hex_color, deficiency_type, severity, axis, mode), js_result in zip(TEST_CASES, js_results):
        profile = NormalizedVisionProfile(
            user_id="test",
            deficiency_type=deficiency_type,
            severity=severity,
            confusion_axis=ConfusionAxis(hue_a_deg=axis[0], hue_b_deg=axis[1]) if axis else None,
        )
        py_result = transform_color(hex_color, profile, mode=mode).to_dict()

        case_desc = f"{hex_color} deficiency={deficiency_type} severity={severity} axis={axis} mode={mode}"
        assert py_result["originalHex"] == js_result["originalHex"], case_desc
        assert py_result["transformedHex"] == js_result["transformedHex"], (
            f"{case_desc}: python={py_result['transformedHex']} js={js_result['transformedHex']}"
        )
        assert py_result["semantic"] == js_result["semantic"], case_desc
        assert py_result["changed"] == js_result["changed"], case_desc


@pytest.mark.skipif(not NODE_AVAILABLE, reason="Node.js not available in this environment")
def test_classify_semantic_parity():
    js_results = _run_js_semantic_batch(SEMANTIC_TEST_COLORS)
    for hex_color, js_category in zip(SEMANTIC_TEST_COLORS, js_results):
        py_category = classify_semantic(hex_color)
        assert py_category == js_category, f"{hex_color}: python={py_category} js={js_category}"
