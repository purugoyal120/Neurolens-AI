"""
train_semantic_model.py — standalone training script for SemanticDetectorNet.

Usage (run from the repository root, as a module, since this file uses
relative imports like the rest of the engine package):
    python3 -m engine.python.train_semantic_model [--dataset path/to.csv] [--epochs 100] [--out model.pt]

IMPORTANT — read before running this for "real":
This script trains on `engine/python/semantic_color_dataset.csv` by
default, which is a small (~80-row) HAND-WRITTEN illustrative dataset, not
the "10,000+ labeled examples from public UI datasets" the original brief
asked for — no such ready-made dataset exists for me to source, and I'm
not going to fabricate 10,000 rows of fake-but-confident-looking data and
call it a training set. See docs/semantic-detector-spec.md section 1.

What this script IS good for: proving the train/evaluate/save/load
pipeline works end-to-end on real (if small) labeled data, so swapping in
a genuinely large real dataset later is a data-file change, not a code
change. The accuracy number this prints on 80 rows is not a meaningful
claim about production accuracy — see the test suite
(engine/tests/test_semantic_detector.py) for the metric that actually
matters right now, which is the rule-based detector's accuracy on a
broader hand-checked case set.
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

from .semantic_detector_net import (
    SemanticDetectorNet,
    TrainingExample,
    load_model,
    predict,
    save_model,
    train,
)

DEFAULT_DATASET = Path(__file__).parent / "semantic_color_dataset.csv"


def load_dataset(csv_path: Path) -> list[TrainingExample]:
    examples = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            examples.append(TrainingExample(
                color_hex=row["color_hex"] or None,
                text=row["text"] or None,
                element_type=row["element_type"] or None,
                parent_context=row["parent_context"] or None,
                label=row["semantic_label"],  # type: ignore[arg-type]
            ))
    return examples


def evaluate(model: SemanticDetectorNet, examples: list[TrainingExample]) -> float:
    correct = 0
    for ex in examples:
        result = predict(model, ex.color_hex, ex.text, ex.element_type, ex.parent_context)
        if result.label == ex.label:
            correct += 1
    return correct / len(examples) if examples else 0.0


def main() -> None:
    parser = argparse.ArgumentParser(description="Train SemanticDetectorNet")
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--epochs", type=int, default=150)
    parser.add_argument("--lr", type=float, default=0.01)
    parser.add_argument("--out", type=Path, default=Path(__file__).parent / "semantic_model.pt")
    parser.add_argument("--train-split", type=float, default=0.8)
    args = parser.parse_args()

    print(f"Loading dataset from {args.dataset} ...")
    examples = load_dataset(args.dataset)
    print(f"Loaded {len(examples)} labeled examples.")

    split_idx = int(len(examples) * args.train_split)
    train_examples = examples[:split_idx]
    test_examples = examples[split_idx:]
    print(f"Train: {len(train_examples)}  Test: {len(test_examples)}")

    model = SemanticDetectorNet()
    n_params = sum(p.numel() for p in model.parameters())
    print(f"Model parameter count: {n_params} (~{n_params * 4} bytes as float32)")

    print(f"Training for {args.epochs} epochs...")
    history = train(model, train_examples, epochs=args.epochs, lr=args.lr)
    print(f"Final training loss: {history[-1]:.4f} (started at {history[0]:.4f})")

    train_acc = evaluate(model, train_examples)
    test_acc = evaluate(model, test_examples) if test_examples else float("nan")
    print(f"Train accuracy: {train_acc:.1%}")
    print(f"Test accuracy:  {test_acc:.1%}" if test_examples else "Test accuracy:  N/A (no held-out rows)")

    save_model(model, str(args.out))
    saved_size = args.out.stat().st_size
    print(f"Saved model to {args.out} ({saved_size} bytes)")

    if test_examples and test_acc < 0.85:
        print(
            "\nNOTE: test accuracy is below the 85% target from the brief. "
            "This is EXPECTED on a small hand-written dataset — see this "
            "file's module docstring for why a real 10,000+ example dataset "
            "is needed before this number means anything in production."
        )


if __name__ == "__main__":
    main()
