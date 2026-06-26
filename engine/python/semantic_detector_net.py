"""
SemanticDetectorNet — a small neural net architecture for semantic color
detection, NOT currently the production detector.

See docs/semantic-detector-spec.md section 1 for the full rationale. Short
version: the brief asks for a model trained on "10,000+ labeled examples"
from "public UI datasets." No such ready-made dataset exists for me to
pull, and training on synthetic/fabricated data would produce a model that
looks like ML but is actually just memorizing whatever pattern the
synthetic generator encoded — false confidence dressed up as accuracy.

What's here instead: a real, small, trainable architecture (genuinely
runs, genuinely learns, genuinely under the 500KB budget) validated on
synthetic data so the training pipeline itself is proven correct. It is
wired up so that the MOMENT real labeled data exists (e.g. collected from
opted-in users correcting low-confidence SemanticColorDetector results),
training on it is a `train()` call away — not a research project.

`SemanticDetectorNet` and `SemanticColorDetector` (semantic_detector.py)
share the exact same `detect()`-shaped public contract on purpose, so a
caller can swap one for the other without touching anything else once the
neural model earns its place.
"""

from __future__ import annotations

from dataclasses import dataclass

import torch
import torch.nn as nn

from .semantic_detector import DetectionResult, SemanticLabel
from .transformer import classify_semantic, hex_to_lab

LABELS: list[SemanticLabel] = ["success", "warning", "error", "info", "neutral"]
LABEL_TO_IDX = {label: i for i, label in enumerate(LABELS)}

# Feature vector layout (see featurize() for exact construction):
#   [L, a, b, chroma_norm,                     4   color features (Lab, normalized)
#    color_onehot x 5,                          5   classify_semantic() one-hot
#    text_keyword_onehot x 5,                    5   simple keyword-bucket one-hot (reuses
#                                                     TEXT_KEYWORDS categories as weak features,
#                                                     NOT as a shortcut to the rule answer —
#                                                     see featurize() docstring)
#    has_text, text_len_norm,                    2   coarse text presence/length signal
#    is_status_element,                          1   element-type bit
#    is_financial_context]                       1   context bit
# = 18 total
FEATURE_DIM = 18


@dataclass(frozen=True)
class TrainingExample:
    color_hex: str | None
    text: str | None
    element_type: str | None
    parent_context: str | None
    label: SemanticLabel


def featurize(
    color_hex: str | None, text: str | None, element_type: str | None, parent_context: str | None,
) -> torch.Tensor:
    """
    Builds the FEATURE_DIM-length feature vector for one example.

    IMPORTANT: the "text_keyword_onehot" block deliberately reuses the same
    TEXT_KEYWORDS lexicon as the rule-based detector for the SAME reason
    classify_semantic() is reused for the color block — there's no point
    maintaining two separate keyword lists that are supposed to mean the
    same thing. This is NOT "the rule-based answer fed in as a feature";
    it's "is the word 'good' present," a fact about the input, not a
    prediction. The model still has to learn how to weigh that fact against
    color and context itself, including learning to override it — which is
    exactly the generalization a trained net would add beyond fixed rules,
    once real data justifies trusting that generalization.
    """
    from .semantic_lexicon import FINANCIAL_CONTEXT_KEYWORDS, STATUS_BEARING_ELEMENT_TYPES, TEXT_KEYWORDS

    color_features = torch.zeros(4)
    color_onehot = torch.zeros(5)
    if color_hex:
        lab = hex_to_lab(color_hex)
        color_features[0] = lab.L / 100.0
        color_features[1] = (lab.a + 128) / 256.0
        color_features[2] = (lab.b + 128) / 256.0
        color_features[3] = min(lab.chroma() / 150.0, 1.0)
        category = classify_semantic(color_hex)
        color_onehot[LABEL_TO_IDX[category]] = 1.0

    text_keyword_onehot = torch.zeros(5)
    has_text = 0.0
    text_len_norm = 0.0
    if text:
        has_text = 1.0
        text_len_norm = min(len(text) / 50.0, 1.0)
        lowered = text.lower()
        for label, keywords in TEXT_KEYWORDS.items():
            if any(kw in lowered for kw in keywords):
                text_keyword_onehot[LABEL_TO_IDX[label]] = 1.0

    is_status_element = 1.0 if (element_type and element_type.lower() in STATUS_BEARING_ELEMENT_TYPES) else 0.0
    is_financial_context = 0.0
    if parent_context:
        lowered_ctx = parent_context.lower()
        is_financial_context = 1.0 if any(kw in lowered_ctx for kw in FINANCIAL_CONTEXT_KEYWORDS) else 0.0

    return torch.cat([
        color_features,
        color_onehot,
        text_keyword_onehot,
        torch.tensor([has_text, text_len_norm, is_status_element, is_financial_context]),
    ])


class SemanticDetectorNet(nn.Module):
    """
    Small feed-forward classifier. Parameter count is deliberately tiny —
    with FEATURE_DIM=18 and a single 16-unit hidden layer, this is on the
    order of a few hundred parameters (~2-3KB as float32, far under the
    500KB budget even before any quantization), because the bottleneck for
    this task is real labeled data, not model capacity — an oversized net
    would just overfit the available (currently: zero real) data faster.
    """

    def __init__(self, hidden_dim: int = 16):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(FEATURE_DIM, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, len(LABELS)),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def make_synthetic_training_set(n: int = 200) -> list[TrainingExample]:
    """
    Generates synthetic (NOT real-user) training examples purely so the
    training loop is runnable/testable end-to-end before real labeled data
    exists. Built from the same curated lexicons the rule-based detector
    uses, with label noise injected, so this is useful for validating the
    PIPELINE (does training reduce loss? does the model learn anything at
    all?) — not for producing a model fit for real users. See module
    docstring.
    """
    import random

    from .semantic_lexicon import TEXT_KEYWORDS

    rng = random.Random(42)
    examples: list[TrainingExample] = []
    colors_by_label = {
        "success": ["#2ECC40", "#28A745", "#27AE60", "#22C55E"],
        "warning": ["#F39C12", "#FFC107", "#E67E22", "#F59E0B"],
        "error": ["#E74C3C", "#DC3545", "#FF0000", "#C0392B"],
        "info": ["#3498DB", "#17A2B8", "#2980B9"],
        "neutral": ["#95A5A6", "#7F8C8D", "#9B59B6"],
    }
    for _ in range(n):
        label = rng.choice(LABELS)
        use_color = rng.random() < 0.7
        use_text = rng.random() < 0.7
        color_hex = rng.choice(colors_by_label[label]) if use_color else None
        text = rng.choice(list(TEXT_KEYWORDS.get(label, {"status"}))) if use_text else None
        observed_label = label
        if rng.random() < 0.05:
            observed_label = rng.choice(LABELS)
        examples.append(TrainingExample(
            color_hex=color_hex, text=text, element_type=None, parent_context=None,
            label=observed_label,
        ))
    return examples


def train(
    model: SemanticDetectorNet, examples: list[TrainingExample], epochs: int = 50, lr: float = 0.01,
) -> list[float]:
    """
    Trains in-place on the given examples. Returns the per-epoch loss
    history so callers (or tests) can confirm the model is actually
    learning, not just running without crashing.
    """
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    loss_fn = nn.CrossEntropyLoss()

    features = torch.stack([
        featurize(ex.color_hex, ex.text, ex.element_type, ex.parent_context) for ex in examples
    ])
    targets = torch.tensor([LABEL_TO_IDX[ex.label] for ex in examples])

    history = []
    model.train()
    for _ in range(epochs):
        optimizer.zero_grad()
        logits = model(features)
        loss = loss_fn(logits, targets)
        loss.backward()
        optimizer.step()
        history.append(loss.item())
    return history


def predict(model: SemanticDetectorNet, color_hex, text, element_type, parent_context) -> DetectionResult:
    """Runs inference. Confidence is the softmax probability of the
    predicted class — calibration against real outcomes is unverified
    until real data exists, same caveat as everywhere else in this file."""
    model.eval()
    with torch.no_grad():
        features = featurize(color_hex, text, element_type, parent_context).unsqueeze(0)
        logits = model(features)
        probs = torch.softmax(logits, dim=-1).squeeze(0)
        idx = int(torch.argmax(probs).item())
        return DetectionResult(
            label=LABELS[idx], confidence=float(probs[idx].item()), pattern=None,
            matched_signals=("neural_net",),
        )


def save_model(model: SemanticDetectorNet, path: str) -> None:
    torch.save(model.state_dict(), path)


def load_model(path: str) -> SemanticDetectorNet:
    model = SemanticDetectorNet()
    model.load_state_dict(torch.load(path, weights_only=True))
    model.eval()
    return model
