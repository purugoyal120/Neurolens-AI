"""
Core color science constants for the Vision Profile Test.

This module defines WHERE in color space we probe the user, based on
real CVD confusion-line geometry, not arbitrary colors. The confusion
lines below are approximations of the standard protan/deutan/tritan
confusion loci projected into CIE Lab space, good enough for a
browser-based screening test (not a clinical instrument).

All stimulus colors are defined in Lab space then converted to sRGB at
generation time, because perceptual distance (how "different" two colors
look) is far more uniform in Lab than in raw RGB. This matters a lot for
this app specifically: we need to control *exactly* how hard each trial is,
which requires a perceptually-even space.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class CVDType(str, Enum):
    PROTAN = "protan"      # L-cone (red) deficiency
    DEUTAN = "deutan"      # M-cone (green) deficiency
    TRITAN = "tritan"      # S-cone (blue) deficiency
    NONE = "none"
    UNKNOWN = "unknown"


class TrialType(str, Enum):
    DISCRIMINATION = "discrimination"   # "same or different?"
    IDENTIFICATION = "identification"   # "name this color"
    CONTROL = "control"
    CALIBRATION = "calibration"


@dataclass(frozen=True)
class LabColor:
    L: float  # lightness 0-100
    a: float  # green(-) <-> red(+)
    b: float  # blue(-) <-> yellow(+)

    def hue_deg(self) -> float:
        """Hue angle on the a*b* plane, 0-360."""
        import math
        return (math.degrees(math.atan2(self.b, self.a)) + 360) % 360

    def chroma(self) -> float:
        import math
        return math.hypot(self.a, self.b)


@dataclass(frozen=True)
class Stimulus:
    """One colored shape shown to the user in a trial."""
    id: str
    lab: LabColor
    label_hint: str | None = None  # only used for identification trials' answer key


@dataclass(frozen=True)
class Trial:
    id: str
    type: TrialType
    stimuli: list[Stimulus]
    # For discrimination trials: are these actually the same perceptual color
    # for a *normal* trichromat? Used purely for scoring, never sent to client.
    same_for_normal_vision: bool | None = None
    # For identification trials: the "correct" canonical name a normal
    # trichromat would give.
    correct_label: str | None = None
    options: list[str] = field(default_factory=list)
    # Which confusion axis this trial is designed to probe.
    probes_axis: CVDType = CVDType.UNKNOWN
    difficulty: float = 0.5  # 0 = easiest (huge separation), 1 = hardest


# ---------------------------------------------------------------------------
# Confusion line anchors.
#
# These are simplified anchors (not the literally precise MacAdam confusion
# loci, which depend on the specific illuminant/observer) for the purpose of
# generating *relatively* meaningful trial stimuli. Good enough to separate
# "this person reliably confuses red/green" from "this person is fine."
# ---------------------------------------------------------------------------

PROTAN_DEUTAN_AXIS = (0.0, 130.0)   # red <-> green hue angles (a*b* degrees)
TRITAN_AXIS = (90.0, 270.0)         # yellow <-> blue hue angles

# Base chroma/lightness for test stimuli — mid-saturation, mid-lightness,
# so we're not relying on extreme colors that even mild CVD handles fine.
BASE_LIGHTNESS = 55.0
BASE_CHROMA = 45.0


def _lab_from_hue(hue_deg: float, chroma: float = BASE_CHROMA, lightness: float = BASE_LIGHTNESS) -> LabColor:
    import math
    rad = math.radians(hue_deg)
    return LabColor(L=lightness, a=chroma * math.cos(rad), b=chroma * math.sin(rad))


def build_test_battery() -> list[Trial]:
    """
    Builds the fixed 12-trial battery described in docs/vision-map-spec.md.
    Deterministic (no randomness) so test results are comparable across users
    and we can reason about/debug specific trial outcomes.
    """
    trials: list[Trial] = []

    # --- 3 discrimination trials on red-green axis, decreasing separation ---
    # Stimulus A stays anchored at the "red" anchor hue. Stimulus B starts at
    # the "green" anchor hue and is rotated TOWARD red as separation shrinks,
    # so at large separation the pair is easy (true red vs true green) and at
    # small separation B sits close enough to the red/green confusion line
    # that someone with red-green CVD is likely to call them "the same."
    red_hue, green_hue = PROTAN_DEUTAN_AXIS
    for i, sep_deg in enumerate([40, 22, 10]):  # easy -> hard (smaller gap = harder)
        a_hue = red_hue
        b_hue = red_hue + sep_deg  # B pulled toward red as sep_deg shrinks
        trials.append(Trial(
            id=f"rg_discrim_{i+1}",
            type=TrialType.DISCRIMINATION,
            stimuli=[
                Stimulus(id="A", lab=_lab_from_hue(a_hue)),
                Stimulus(id="B", lab=_lab_from_hue(b_hue)),
            ],
            same_for_normal_vision=False,
            probes_axis=CVDType.DEUTAN,  # red-green axis implicates both protan & deutan
            difficulty=round(i / 2, 2),
        ))

    # --- 3 discrimination trials on blue-yellow axis, decreasing separation ---
    yellow_hue, blue_hue = TRITAN_AXIS
    for i, sep_deg in enumerate([40, 22, 10]):
        a_hue = yellow_hue
        b_hue = yellow_hue + sep_deg  # B pulled toward yellow as sep_deg shrinks
        trials.append(Trial(
            id=f"by_discrim_{i+1}",
            type=TrialType.DISCRIMINATION,
            stimuli=[
                Stimulus(id="A", lab=_lab_from_hue(a_hue)),
                Stimulus(id="B", lab=_lab_from_hue(b_hue)),
            ],
            same_for_normal_vision=False,
            probes_axis=CVDType.TRITAN,
            difficulty=round(i / 2, 2),
        ))

    # --- 3 identification trials: separate protan vs deutan ---
    # Protans see long-wavelength (red) light as dimmer than deutans do at
    # matched luminance, so a darker, more saturated red is the differentiator.
    ident_specs = [
        ("ident_red", 0.0, "Red", BASE_CHROMA, 40.0),       # darker red -> protans struggle more
        ("ident_green", 130.0, "Green", BASE_CHROMA, 55.0),
        ("ident_brownish", 35.0, "Brown", BASE_CHROMA * 0.6, 45.0),  # classic protan/deutan trap zone
    ]
    options = ["Red", "Green", "Yellow", "Blue", "Brown", "Pink", "Gray"]
    for trial_id, hue, label, chroma, lightness in ident_specs:
        trials.append(Trial(
            id=trial_id,
            type=TrialType.IDENTIFICATION,
            stimuli=[Stimulus(id="A", lab=_lab_from_hue(hue, chroma, lightness), label_hint=label)],
            correct_label=label,
            options=options,
            probes_axis=CVDType.UNKNOWN,  # disambiguated during scoring, not generation
            difficulty=0.5,
        ))

    # --- 2 control trials: obviously different colors ---
    for i, (h1, h2) in enumerate([(0.0, 200.0), (60.0, 280.0)]):
        trials.append(Trial(
            id=f"control_{i+1}",
            type=TrialType.CONTROL,
            stimuli=[
                Stimulus(id="A", lab=_lab_from_hue(h1)),
                Stimulus(id="B", lab=_lab_from_hue(h2)),
            ],
            same_for_normal_vision=False,
            probes_axis=CVDType.NONE,
            difficulty=0.0,
        ))

    # --- 1 calibration trial: huge red-green separation, establishes baseline ---
    trials.append(Trial(
        id="calibration_1",
        type=TrialType.CALIBRATION,
        stimuli=[
            Stimulus(id="A", lab=_lab_from_hue(0.0, chroma=60.0)),
            Stimulus(id="B", lab=_lab_from_hue(130.0, chroma=60.0)),
        ],
        same_for_normal_vision=False,
        probes_axis=CVDType.NONE,
        difficulty=0.0,
    ))

    return trials
