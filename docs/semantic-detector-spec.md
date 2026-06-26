# Semantic Color Detector & Context Replacement — Spec

This extends the existing Context Replacement mode (`classify_semantic()` in
`engine/python/transformer.py` and `engine/js/transformer.js`), which
classifies color ALONE. That's a reasonable fallback, but color alone is
genuinely insufficient: a gray "Critical" badge is `neutral` by hue but
obviously `error` by meaning. This module adds **text and DOM-context
signal** on top of the color signal, which is strictly more accurate.

## 1. Why rule-based is the real "AI model" here, not an untrained neural net

The brief asks for a TensorFlow.js model trained on "10,000+ labeled
examples" from "public UI datasets." No such ready-made, semantically-labeled
dataset of colored-UI-elements exists for me to actually pull and train on —
inventing one (or training on synthetic noise dressed up as data) would
produce a model that LOOKS like ML but is actually just memorizing whatever
arbitrary pattern the synthetic generator happened to encode, which is worse
than not having a model at all, because it would carry false confidence.

So, mirroring the decision already made for `backend/app/ml/vision_model.py`
(rule-based scorer as the real production path, neural net architecture
present but explicitly not used until real labeled data exists), this module
ships:

1. **`SemanticColorDetector`** (rule-based, production path) — combines
   three signals (text keywords, color hue/chroma bucket, DOM/parent
   context) into a weighted semantic label + confidence score. Fully
   explainable: every decision traces to a specific rule. This is what
   `detect()` actually runs.
2. **`SemanticDetectorNet`** (PyTorch architecture, NOT trained on real
   data) — wired up, trainable on synthetic data so the pipeline is
   validated end-to-end, with a `load_model()`/`save_model()` contract
   ready for when real labeled data exists. `train()` runs and produces a
   real (if synthetically-fit) model; the class never silently claims to be
   production-ready.

This is not a downgrade from "real AI" — text-keyword + color + context
fusion with calibrated confidence IS the right tool for this problem at this
data scale, the same way the rule-based vision scorer was the right call
earlier. A neural net's main advantage (generalizing beyond hand-written
rules) only pays off with real training data, which doesn't exist yet.

## 2. Signal fusion model

```
detect(color_hex, text, element_type, parent_context) -> (label, confidence)
```

Three independent signals, each producing a candidate label + a signal-level
confidence:

1. **Text signal** (strongest when present): keyword match against curated
   word lists per category (`"critical"`, `"error"`, `"failed"` → error;
   `"good"`, `"success"`, `"passed"` → success; etc.) using word-boundary
   matching, not substring containment (so "warning" doesn't match inside
   "Early Warning System Inc." differently than intended, and "good" doesn't
   spuriously match inside "goodbye"). Numeric/percentage patterns get
   light heuristic treatment (e.g. a bare percentage isn't inherently
   semantic without a color/context anchor).
2. **Color signal**: delegates to the existing `classify_semantic(hex)` —
   reused, not reimplemented, so the two modules never drift apart on what
   "red" means.
3. **Context signal** (weakest alone, but disambiguates ties): parent
   section name / element type contributes a small bias — e.g. inside a
   "Revenue" or "Financial" parent context, an unlabeled green/red cell is
   more confidently gain/loss-oriented than generic success/error.

Fusion rule: if text signal fires with a confident keyword match, it WINS
outright (text is the most direct evidence of intended meaning a human
wrote). Otherwise, color and context signals are combined: color sets the
base label, context can shift confidence up (agrees) or down (conflicts)
but does not override color alone, since context bias without any text or
color signal is too weak to assert a label on its own — it returns `neutral`
with low confidence instead of guessing.

## 3. Confidence scoring (not just a label)

Every detection returns `(label, confidence)`, confidence in [0, 1]:
- Exact keyword match + agreeing color: ~0.95
- Keyword match alone, no color signal (e.g. transparent background): ~0.85
- Color signal alone, no text: ~0.55-0.65 (matches `classify_semantic`'s
  inherent uncertainty — color alone is a weak signal, as the brief's own
  premise states)
- Color and text disagree (e.g. green background, text says "Failed"): text
  wins, but confidence is reduced (~0.7) to flag the ambiguity for review
- Nothing fires: `neutral`, confidence ~0.3

Callers (browser extension, Excel add-in, etc.) can threshold on confidence
— e.g. only auto-apply Context Replacement above 0.6, and flag low-confidence
elements for the user to review/correct via custom mappings (section 7 of
the original brief).

## 4. Revenue/financial pattern extension

The brief's "Revenue Gain → 📈 + Green Pattern" examples are a specialized
case of the same fusion model: when parent_context matches a financial
keyword set (`revenue`, `profit`, `sales`, `earnings`) AND the detected
label is success/error, the engine emits a DIFFERENT icon (📈/📉 instead of
✅/❌) and flags `pattern: 'gain'|'loss'` for the rendering layer to apply a
subtle gradient overlay. This is a label REFINEMENT step after the base
success/error detection, not a separate detector.

## 5. Performance budget

The brief asks for <100ms per page, <50ms per inference, <500KB model. The
rule-based detector trivially meets this (it's word-list lookups and a
handful of comparisons — microseconds per element, no model to load at
all), which is a real practical advantage over shipping and loading even a
small TF.js model for every page view.
