# Vision Map — Data Model & Test Design

This is the spec the frontend test, backend scoring, and transformation engine
all implement against. Read this before touching `vision_model.py`,
`VisionTest/`, or `engine/src/transform.ts` — they all assume this shape.

## 1. What we're actually measuring

Color vision deficiency (CVD) varies along three independent axes. NeuroLens
measures approximations of all three instead of asking "are you red-green or
blue-yellow" as a single multiple-choice question (which is how most existing
tools work, and why their filters are so generic).

| Axis | What it means | How we estimate it |
|---|---|---|
| **Type** | Which cone class is anomalous/missing: L-cone (protan), M-cone (deutan), S-cone (tritan) | Which hue-pairs the user confuses |
| **Severity** | Anomalous trichromacy (mild shift) vs dichromacy (cone effectively absent) | How far off / how often confusions happen, and at what saturation they stop |
| **Per-hue confidence** | Confusion isn't uniform across the spectrum — someone might be fine at high saturation but lose discrimination in muddy/desaturated tones | Repeated trials at varying saturation/lightness per hue-pair |

This is a deliberately *lightweight, self-report* instrument — it is not a
clinical diagnostic (not a replacement for an Ishihara test administered by an
ophthalmologist, and we say so in the UI). Its job is to be good enough to
drive a personalized transform, in under 2 minutes, in a browser.

## 2. Test design (the 2-minute test)

12 trials. Each trial shows two colored shapes side-by-side (or a colored shape
on a neutral gray background) and asks one of two question types:

1. **Discrimination trial**: "Do these two look the same color, or different?"
   — pair is either an actual same-color pair (control) or a pair that sits on
   a known confusion line (protan/deutan/tritan) at a specific separation.
2. **Identification trial**: "Pick the word that best matches this color"
   (Red / Green / Yellow / Blue / Brown / Pink / Gray) — classic Ishihara-style
   naming, but using sRGB stimuli tuned to known confusion axes rather than
   printed pseudoisochromatic plates (we can't reproduce copyrighted plates
   anyway, and a digital test should be designed for digital stimuli).

Trial plan (`backend/app/core/test_stimuli.py`):
- 3 trials on the protan/deutan confusion line (red-green axis), at decreasing
  separation (easy → hard)
- 3 trials on the tritan confusion line (blue-yellow axis), decreasing separation
- 3 identification trials using colors specifically chosen to separate protan
  vs deutan (they confuse the *same* hues but in measurably different ways —
  protans see reds as darker, deutans don't)
- 2 control trials (obviously different colors — catches inattentive responses)
- 1 calibration trial (very large separation on red-green — establishes the
  user's baseline reaction time / care level)

Each response records: trial id, the two stimulus colors (as Lab values), the
user's answer, and response time. Response time matters: confident-fast-correct
vs slow-uncertain-correct are scored differently (the latter implies a "weak
spot" worth flagging even if technically answered right).

## 3. The Vision Map (output data model)

```python
VisionMap = {
  "user_id": str,
  "cvd_type": "protan" | "deutan" | "tritan" | "none" | "unknown",
  "severity": float,        # 0.0 (no deficiency) – 1.0 (full dichromacy)
  "confidence": float,      # 0.0–1.0, how reliable this map is (based on
                             # response consistency, not just answers)
  "confusion_axis": {       # the actual problematic hue pair(s), in degrees
    "hue_a_deg": float,     # e.g. ~0° (red) for protan/deutan
    "hue_b_deg": float,     # e.g. ~120° (green)
  },
  "per_hue_discrimination": {
     # 12 buckets around the hue wheel (every 30°), each 0-1:
     # how reliably the user discriminated colors in that hue range
     "0": 0.3, "30": 0.6, ..., "330": 0.9
  },
  "recommended_strategy": "shift_hue" | "increase_saturation" | "icon_replacement" | "combined",
  "created_at": datetime,
  "test_version": str,
}
```

`severity` and `cvd_type` drive the **color remapping** layer.
`per_hue_discrimination` drives *where* the engine should intervene and where
it can leave colors alone (don't transform what the user can already see fine).
`recommended_strategy` is a precomputed hint so the transformation engine
doesn't need to re-derive policy from raw numbers on every call.

## 4. Why this isn't just "pick red-green or blue-yellow from a dropdown"

A dropdown can't tell you:
- *How* severe — a mild deutan and a complete deuteranope need very different
  amounts of correction; over-correcting a mild case looks garish and erodes
  trust.
- *Where in the spectrum* — many real users report specific failure zones
  (e.g. "I'm fine with bright red vs green but totally lose it on dark
  red/brown vs olive"), which a single category can't represent but
  `per_hue_discrimination` captures directly.
- *Confidence* — letting the UI say "we're not fully sure yet, here's how to
  improve your profile" rather than confidently misclassifying someone after
  one ambiguous click.

## 5. Versioning

`test_version` is stored on every VisionMap. As the test/model improves, old
profiles remain valid and interpretable, and we can detect "this profile is
stale, retake the test" rather than silently reinterpreting old data under new
assumptions.
