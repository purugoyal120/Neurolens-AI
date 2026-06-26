"""
Vision Mapping Model
=====================

Turns a list of raw test responses into a VisionMap (see
docs/vision-map-spec.md for the full data model).

This module intentionally ships TWO scoring paths:

1. `RuleBasedScorer` — deterministic, explainable, needs zero training data.
   This is what actually runs in this deliverable and in production at
   launch. Every CVD-screening heuristic here is grounded in real color
   science (confusion-line geometry, protan/deutan luminance differences),
   not a black box. For an accessibility tool, being able to explain "why
   does my profile say X" matters as much as raw accuracy.

2. `VisionMapNet` — a small PyTorch model with the architecture this product
   *grows into* once we have enough (user_responses -> clinically-verified
   profile) pairs to train on, e.g. from users who also report a doctor's
   diagnosis, or from a larger Ishihara-validated dataset. It is wired up
   and trainable today on synthetic data so the team can validate the
   pipeline, but it is NOT yet the production scorer — there isn't real
   training data yet, and shipping an undertrained net instead of the
   rule-based scorer would make profiles *less* trustworthy, not more.

`VisionModel` is the public interface other code should import; it currently
delegates to RuleBasedScorer and exposes a `use_neural=True` flag for later.
"""

from __future__ import annotations

from dataclasses import dataclass

import torch
import torch.nn as nn

from app.core.test_stimuli import CVDType, build_test_battery, Trial, TrialType


# ---------------------------------------------------------------------------
# 1. Rule-based scorer — the production path
# ---------------------------------------------------------------------------

@dataclass
class ScoredResponse:
    trial: Trial
    answer: str
    response_time_ms: int
    correct: bool | None  # None for trials with no single right answer


class RuleBasedScorer:
    """
    Scores a completed test battery into a VisionMap.

    Approach:
    - For each discrimination trial probing the red-green or blue-yellow
      axis, record whether the user correctly said "different" (they were
      always actually different — see test_stimuli.py). Failing on LOW
      difficulty trials is a strong signal; failing only on HIGH difficulty
      trials suggests mild/no deficiency.
    - Identification trials disambiguate protan vs deutan: protans
      systematically under-report red/brown due to reduced perceived
      luminance of long wavelengths; deutans confuse red/green/brown more
      symmetrically without the luminance cue.
    - Control trials gate confidence: if a user fails an obvious control,
      we lower confidence rather than trusting the rest of the battery.
    """

    def __init__(self):
        self.battery_by_id = {t.id: t for t in build_test_battery()}

    def score(self, responses: list[dict]) -> dict:
        scored = self._match_responses(responses)

        rg_severity = self._earliest_failed_difficulty(scored, axis_prefix="rg_discrim")
        by_severity = self._earliest_failed_difficulty(scored, axis_prefix="by_discrim")

        control_pass_rate = self._control_pass_rate(scored)

        cvd_type, severity, type_disambig_confidence = self._infer_type_and_severity(
            rg_severity, by_severity, scored
        )

        confidence = self._estimate_confidence(scored, control_pass_rate, type_disambig_confidence)

        per_hue = self._build_per_hue_discrimination(scored, cvd_type)

        confusion_axis = self._confusion_axis_for_type(cvd_type)

        strategy = self._recommend_strategy(cvd_type, severity)

        return {
            "cvd_type": cvd_type.value,
            "severity": round(severity, 3),
            "confidence": round(confidence, 3),
            "confusion_axis": confusion_axis,
            "per_hue_discrimination": per_hue,
            "recommended_strategy": strategy,
        }

    # -- internals --------------------------------------------------------

    def _match_responses(self, responses: list[dict]) -> list[ScoredResponse]:
        out = []
        for r in responses:
            trial = self.battery_by_id.get(r["trial_id"])
            if trial is None:
                continue  # ignore unknown trial ids defensively
            correct: bool | None
            if trial.type in (TrialType.DISCRIMINATION, TrialType.CONTROL, TrialType.CALIBRATION):
                correct = (r["answer"].strip().lower() == "different") == bool(
                    trial.same_for_normal_vision is False
                )
            elif trial.type == TrialType.IDENTIFICATION:
                correct = r["answer"].strip().lower() == (trial.correct_label or "").lower()
            else:
                correct = None
            out.append(ScoredResponse(
                trial=trial, answer=r["answer"],
                response_time_ms=r.get("response_time_ms", 0),
                correct=correct,
            ))
        return out

    def _earliest_failed_difficulty(self, scored: list[ScoredResponse], axis_prefix: str) -> float | None:
        """
        Returns the LOWEST difficulty (0=easiest/largest hue separation,
        1=hardest/smallest separation) among trials of this axis that the
        user got WRONG. None if they got all of them right on this axis.

        This is the right severity signal: someone who fails only the
        HARDEST (smallest-separation) trial has a mild deficiency — most
        people would struggle there too. Someone who fails the EASIEST
        (largest-separation) trial has a severe deficiency, since that gap
        is normally trivial to see. So severity tracks the easiest trial
        failed, not the hardest.
        """
        failed_difficulties = [
            s.trial.difficulty for s in scored
            if s.trial.id.startswith(axis_prefix) and s.correct is False
        ]
        if not failed_difficulties:
            return None
        # Map "easiest failed" (low difficulty value) to HIGH severity:
        # severity = 1 - (easiest difficulty failed)
        return 1.0 - min(failed_difficulties)

    def _control_pass_rate(self, scored: list[ScoredResponse]) -> float:
        controls = [s for s in scored if s.trial.type == TrialType.CONTROL]
        if not controls:
            return 1.0
        return sum(1 for s in controls if s.correct) / len(controls)

    def _infer_type_and_severity(
        self, rg_severity: float | None, by_severity: float | None,
        scored: list[ScoredResponse],
    ) -> tuple[CVDType, float, float]:
        """Returns (cvd_type, severity, type_disambiguation_confidence)."""
        # No failures at all on either axis -> no detected deficiency.
        if rg_severity is None and by_severity is None:
            return CVDType.NONE, 0.0, 1.0

        # Red-green failures dominate (far more common clinically: ~99% of CVD).
        if rg_severity is not None and (by_severity is None or rg_severity >= by_severity):
            cvd_type, disambig_confidence = self._disambiguate_protan_deutan(scored)
            return cvd_type, rg_severity, disambig_confidence

        # Blue-yellow failures dominate. No protan/deutan-style ambiguity here.
        return CVDType.TRITAN, by_severity, 1.0

    def _disambiguate_protan_deutan(self, scored: list[ScoredResponse]) -> tuple[CVDType, float]:
        """
        Best-effort protan vs deutan split, plus a [0-1] disambiguation
        confidence (NOT the same as overall profile confidence — this one is
        specifically about how sure we are of protan-vs-deutan, since that
        split is genuinely hard to make from a short identification task
        without a luminance-matching paradigm).

        Heuristic, weak by design: protans lose long-wavelength (red)
        brightness, so they disproportionately mis-name PURE red as
        brown/dark/black, while still often naming desaturated brown
        correctly (it doesn't rely on red being bright). Deutans don't get
        that brightness cue, so they tend to mis-name both red and brown
        with similar frequency, often as green.

        If the evidence doesn't clearly point one way, we default to deutan
        (the more clinically prevalent red-green subtype) but flag low
        disambiguation confidence so callers/UI can be honest that the
        protan/deutan label is a best guess, not a certainty.
        """
        red_trial = next((s for s in scored if s.trial.id == "ident_red"), None)
        brown_trial = next((s for s in scored if s.trial.id == "ident_brownish"), None)

        red_failed = bool(red_trial and red_trial.correct is False)
        brown_failed = bool(brown_trial and brown_trial.correct is False)

        if red_failed and not brown_failed:
            # Strong protan signal: lost the bright pure red, but desaturated
            # brown (no brightness cue) still read correctly.
            return CVDType.PROTAN, 0.7
        if brown_failed and not red_failed:
            # Pure red was fine, but the desaturated trap-zone color wasn't —
            # consistent with deutan's hue-only (not brightness) confusion.
            return CVDType.DEUTAN, 0.6
        if red_failed and brown_failed:
            # Both failed: can't cleanly separate the two from this alone.
            # Default to deutan (more prevalent) with low confidence.
            return CVDType.DEUTAN, 0.3
        # Neither identification trial failed, but a discrimination trial on
        # this axis did (e.g. only caught at the hardest separation) — type
        # is genuinely ambiguous.
        return CVDType.DEUTAN, 0.2

    def _estimate_confidence(
        self, scored: list[ScoredResponse], control_pass_rate: float, type_disambig_confidence: float = 1.0,
    ) -> float:
        if not scored:
            return 0.0
        answered = [s for s in scored if s.correct is not None]
        consistency = sum(1 for s in answered if s.correct is not None) / max(len(answered), 1)
        # Penalize heavily if controls were missed — suggests inattention, not CVD.
        base = 0.5 + 0.5 * consistency
        # A shaky protan/deutan call should pull overall confidence down too,
        # even if the rest of the battery was answered cleanly.
        return max(0.05, min(1.0, base * control_pass_rate * (0.6 + 0.4 * type_disambig_confidence)))

    def _build_per_hue_discrimination(self, scored: list[ScoredResponse], cvd_type: CVDType) -> dict[str, float]:
        """
        12 buckets, every 30deg. We only have direct evidence at the angles we
        tested (~0/130 for rg, ~90/270 for by); everywhere else we interpolate
        a smooth curve centered on the detected confusion axis, since
        discrimination loss falls off gradually away from the confusion line
        rather than being a sharp cutoff.
        """
        buckets = [i * 30 for i in range(12)]
        if cvd_type == CVDType.NONE:
            return {str(h): 1.0 for h in buckets}

        axis = self._confusion_axis_for_type(cvd_type)
        center = (axis["hue_a_deg"] + axis["hue_b_deg"]) / 2

        rg_trials = [s for s in scored if s.trial.id.startswith("rg_discrim")]
        by_trials = [s for s in scored if s.trial.id.startswith("by_discrim")]
        relevant = rg_trials if cvd_type in (CVDType.PROTAN, CVDType.DEUTAN) else by_trials
        pass_rate = (
            sum(1 for s in relevant if s.correct) / len(relevant) if relevant else 0.5
        )

        result = {}
        for h in buckets:
            dist = min(abs(h - center), 360 - abs(h - center))
            # Gaussian-ish falloff: low discrimination near the axis, recovers further away.
            falloff = pass_rate + (1 - pass_rate) * min(1.0, dist / 90)
            result[str(h)] = round(min(1.0, falloff), 3)
        return result

    def _confusion_axis_for_type(self, cvd_type: CVDType) -> dict[str, float]:
        from app.core.test_stimuli import PROTAN_DEUTAN_AXIS, TRITAN_AXIS
        if cvd_type in (CVDType.PROTAN, CVDType.DEUTAN):
            return {"hue_a_deg": PROTAN_DEUTAN_AXIS[0], "hue_b_deg": PROTAN_DEUTAN_AXIS[1]}
        if cvd_type == CVDType.TRITAN:
            return {"hue_a_deg": TRITAN_AXIS[0], "hue_b_deg": TRITAN_AXIS[1]}
        return {"hue_a_deg": 0.0, "hue_b_deg": 0.0}

    def _recommend_strategy(self, cvd_type: CVDType, severity: float) -> str:
        if cvd_type == CVDType.NONE:
            return "none"
        if severity >= 0.75:
            # Severe/dichromatic: color shifting alone won't be reliable enough.
            return "icon_replacement"
        if severity >= 0.4:
            return "combined"
        return "shift_hue"


# ---------------------------------------------------------------------------
# 2. Trainable neural model — future path, not used in production yet
# ---------------------------------------------------------------------------

class VisionMapNet(nn.Module):
    """
    Small feed-forward net mapping a fixed-length feature vector (derived from
    test responses: per-trial correctness + normalized response time) to:
      - cvd_type logits (4 classes: none/protan/deutan/tritan)
      - severity (regression, 0-1, via sigmoid)

    Input feature vector layout (len = 12 trials * 2 features = 24):
      [trial_1_correct(0/1), trial_1_rt_norm(0-1), trial_2_correct, trial_2_rt_norm, ...]

    This is deliberately small — the bottleneck for this task is dataset size
    and label quality (verified diagnoses), not model capacity. A bigger net
    would just overfit faster on a small calibration dataset.
    """

    NUM_TRIALS = 12
    INPUT_DIM = NUM_TRIALS * 2
    NUM_CVD_CLASSES = 4  # none, protan, deutan, tritan

    def __init__(self, hidden_dim: int = 32):
        super().__init__()
        self.shared = nn.Sequential(
            nn.Linear(self.INPUT_DIM, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        )
        self.type_head = nn.Linear(hidden_dim, self.NUM_CVD_CLASSES)
        self.severity_head = nn.Linear(hidden_dim, 1)

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        h = self.shared(x)
        type_logits = self.type_head(h)
        severity = torch.sigmoid(self.severity_head(h)).squeeze(-1)
        return type_logits, severity


def make_synthetic_training_batch(batch_size: int = 64) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
    """
    Generates synthetic (not real-user) training examples purely so the
    VisionMapNet training loop is runnable/testable end-to-end before real
    labeled data exists. Random ground-truth severity/type, with trial
    correctness probabilistically consistent with that ground truth
    (higher severity => more likely to fail red-green trials specifically).
    Useful for unit-testing the training loop, NOT for producing a model
    fit for real users.
    """
    cvd_labels = torch.randint(0, VisionMapNet.NUM_CVD_CLASSES, (batch_size,))
    severities = torch.rand(batch_size)

    features = torch.zeros(batch_size, VisionMapNet.INPUT_DIM)
    for i in range(batch_size):
        is_cvd = cvd_labels[i].item() != 0
        sev = severities[i].item() if is_cvd else 0.0
        for t in range(VisionMapNet.NUM_TRIALS):
            fail_prob = sev if t < 6 else sev * 0.3  # first 6 trials ~ rg/by discrimination
            correct = 0.0 if torch.rand(1).item() < fail_prob else 1.0
            rt_norm = torch.rand(1).item() * (1.5 if correct == 0.0 else 0.7)
            features[i, t * 2] = correct
            features[i, t * 2 + 1] = min(rt_norm, 1.0)

    return features, cvd_labels, severities


# ---------------------------------------------------------------------------
# 3. Public interface
# ---------------------------------------------------------------------------

class VisionModel:
    """
    Entry point used by services/profile_builder.py. Delegates to the
    rule-based scorer today. The `use_neural` flag exists so we can swap in
    VisionMapNet later without changing any caller code, once it's trained
    on real labeled data and validated against the rule-based scorer.
    """

    def __init__(self, use_neural: bool = False):
        self.use_neural = use_neural
        self.rule_based = RuleBasedScorer()
        if use_neural:
            raise NotImplementedError(
                "VisionMapNet has no trained weights yet — there is no real "
                "labeled dataset to train on. Falling back silently would "
                "produce untrustworthy profiles, so this raises instead."
            )

    def score(self, responses: list[dict]) -> dict:
        return self.rule_based.score(responses)
