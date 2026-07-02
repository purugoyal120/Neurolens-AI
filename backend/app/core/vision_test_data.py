"""
Sample data for the Vision Profile Test Module (10-question version).

Two things live here:
1. `QUESTIONS` — the fixed 10-question battery with unique, non-repeating prompts
   and colors to ensure an engaging and accurate diagnostic experience.
2. `CONFUSION_MATRIX` — a predefined color-confusion lookup the rule-based
   analysis algorithm uses to decide which wrong answer indicates red-green
   confusion vs blue-yellow confusion vs inattention.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class QuestionAxis(str, Enum):
    RED_GREEN = "red_green"
    BLUE_YELLOW = "blue_yellow"
    MIXED = "mixed"
    REAL_WORLD = "real_world"


class Difficulty(str, Enum):
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    REAL_WORLD = "real_world"


@dataclass(frozen=True)
class AnswerOption:
    id: str
    label: str
    hex: str
    category: str


@dataclass(frozen=True)
class Question:
    id: str
    index: int  # 1-10
    axis: QuestionAxis
    difficulty: Difficulty
    prompt: str
    stimulus_hex: str
    stimulus_category: str
    options: list[AnswerOption]
    correct_option_id: str


def _opt(id_: str, label: str, hex_: str, category: str) -> AnswerOption:
    return AnswerOption(id=id_, label=label, hex=hex_, category=category)


QUESTIONS: list[Question] = [
    # --- Q1-3: Red-Green & Brown discrimination (Unique prompts & shades) ---
    Question(
        id="q1",
        index=1,
        axis=QuestionAxis.RED_GREEN,
        difficulty=Difficulty.BASIC,
        prompt="Which color matches the displayed patch above?",
        stimulus_hex="#E74C3C",
        stimulus_category="red",
        options=[
            _opt("q1_a", "Red", "#E74C3C", "red"),
            _opt("q1_b", "Green", "#2ECC40", "green"),
            _opt("q1_c", "Orange", "#E67E22", "orange"),
            _opt("q1_d", "Brown", "#8B5E3C", "brown"),
        ],
        correct_option_id="q1_a",
    ),
    Question(
        id="q2",
        index=2,
        axis=QuestionAxis.RED_GREEN,
        difficulty=Difficulty.BASIC,
        prompt="Select the exact color category for this status indicator:",
        stimulus_hex="#2ECC40",
        stimulus_category="green",
        options=[
            _opt("q2_a", "Red", "#E74C3C", "red"),
            _opt("q2_b", "Green", "#2ECC40", "green"),
            _opt("q2_c", "Yellow", "#F1C40F", "yellow"),
            _opt("q2_d", "Gray", "#95A5A6", "gray"),
        ],
        correct_option_id="q2_b",
    ),
    Question(
        id="q3",
        index=3,
        axis=QuestionAxis.RED_GREEN,
        difficulty=Difficulty.BASIC,
        prompt="How would you identify this deep shade?",
        stimulus_hex="#8B5E3C",
        stimulus_category="brown",
        options=[
            _opt("q3_a", "Brown", "#8B5E3C", "brown"),
            _opt("q3_b", "Red", "#C0392B", "red"),
            _opt("q3_c", "Green", "#27AE60", "green"),
            _opt("q3_d", "Purple", "#8E44AD", "purple"),
        ],
        correct_option_id="q3_a",
    ),
    # --- Q4-6: Blue-Yellow discrimination (Unique prompts & shades) ---
    Question(
        id="q4",
        index=4,
        axis=QuestionAxis.BLUE_YELLOW,
        difficulty=Difficulty.BASIC,
        prompt="Choose the correct primary color tone:",
        stimulus_hex="#3498DB",
        stimulus_category="blue",
        options=[
            _opt("q4_a", "Yellow", "#F1C40F", "yellow"),
            _opt("q4_b", "Blue", "#3498DB", "blue"),
            _opt("q4_c", "Purple", "#8E44AD", "purple"),
            _opt("q4_d", "Gray", "#95A5A6", "gray"),
        ],
        correct_option_id="q4_b",
    ),
    Question(
        id="q5",
        index=5,
        axis=QuestionAxis.BLUE_YELLOW,
        difficulty=Difficulty.BASIC,
        prompt="Which hue best describes this bright patch?",
        stimulus_hex="#F1C40F",
        stimulus_category="yellow",
        options=[
            _opt("q5_a", "Blue", "#3498DB", "blue"),
            _opt("q5_b", "Yellow", "#F1C40F", "yellow"),
            _opt("q5_c", "Orange", "#E67E22", "orange"),
            _opt("q5_d", "White", "#ECF0F1", "gray"),
        ],
        correct_option_id="q5_b",
    ),
    Question(
        id="q6",
        index=6,
        axis=QuestionAxis.BLUE_YELLOW,
        difficulty=Difficulty.BASIC,
        prompt="Identify this deep background color:",
        stimulus_hex="#2980B9",
        stimulus_category="blue",
        options=[
            _opt("q6_a", "Yellow", "#F4D03F", "yellow"),
            _opt("q6_b", "Green", "#27AE60", "green"),
            _opt("q6_c", "Blue", "#2980B9", "blue"),
            _opt("q6_d", "Purple", "#8E44AD", "purple"),
        ],
        correct_option_id="q6_c",
    ),
    # --- Q7-8: Mixed colors (intermediate) ---
    Question(
        id="q7",
        index=7,
        axis=QuestionAxis.MIXED,
        difficulty=Difficulty.INTERMEDIATE,
        prompt="This mixed shade sits between green and blue. What does it look like to you?",
        stimulus_hex="#16A085",  # teal
        stimulus_category="green",
        options=[
            _opt("q7_a", "Blue", "#2980B9", "blue"),
            _opt("q7_b", "Teal/Green", "#16A085", "green"),
            _opt("q7_c", "Purple", "#8E44AD", "purple"),
            _opt("q7_d", "Gray", "#7F8C8D", "gray"),
        ],
        correct_option_id="q7_b",
    ),
]


RED_GREEN_CONFUSION_PAIRS: set[tuple[str, str]] = {
    ("red", "green"), ("green", "red"),
    ("red", "brown"), ("brown", "red"),
    ("green", "brown"), ("brown", "green"),
    ("red", "orange"), ("orange", "red"),
    ("green", "gray"), ("gray", "green"),
}

BLUE_YELLOW_CONFUSION_PAIRS: set[tuple[str, str]] = {
    ("blue", "yellow"), ("yellow", "blue"),
    ("blue", "purple"), ("purple", "blue"),
    ("yellow", "gray"), ("gray", "yellow"),
    ("blue", "green"), ("green", "blue"),
}


def classify_confusion(stimulus_category: str, chosen_category: str) -> str | None:
    if stimulus_category == chosen_category:
        return None
    pair = (stimulus_category, chosen_category)
    if pair in RED_GREEN_CONFUSION_PAIRS:
        return "red_green"
    if pair in BLUE_YELLOW_CONFUSION_PAIRS:
        return "blue_yellow"
    return None


TEST_VERSION = "simple-v1.2"
TIME_LIMIT_SECONDS = 60
