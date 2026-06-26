# Transformation Engine — Input Contract & Algorithm Spec

This is the spec every platform integration (browser extension, Excel add-in,
JS SDK, React Native SDK, maps overlay) implements against. Read this before
touching `engine/python/transformer.py` or `engine/js/transformer.js` — they
are two language ports of the SAME documented algorithm, and must stay
behaviorally identical (see `engine/tests/` for the cross-language parity
tests that enforce this).

## 1. Why a normalized profile, not either existing VisionMap shape directly

This repo has two prior modules with two different vision-profile JSON
shapes (`per_hue_discrimination` from the 12-trial module vs.
`perception_scores`/`recommended_transformations` from the 10-question
module — see `README.md` "Two Vision Profile Test modules" section). The
Transformation Engine needs to work no matter which one produced the
profile, and needs to work for platforms that have nothing to do with either
module (e.g. a browser extension reading a profile cached from an API
response). So it defines its own minimal, stable input shape —
`NormalizedVisionProfile` — and each backend module is responsible for
mapping its own native shape into this one at the API boundary. The engine
itself never imports from either test module.

```ts
interface NormalizedVisionProfile {
  userId: string
  deficiencyType: 'red-green' | 'blue-yellow' | 'none' | 'unknown'
  severity: number        // 0.0 (none) – 1.0 (severe), continuous
  // Optional, used when available for finer-grained transforms; engine
  // degrades gracefully to deficiencyType+severity alone if absent.
  confusionAxis?: { hueADeg: number; hueBDeg: number }
}
```

Mapping from each existing module:
- 12-trial module: `cvd_type` → `deficiencyType` (protan/deutan both map to
  `'red-green'`), `severity` passes through directly, `confusion_axis`
  passes through directly.
- 10-question module: `deficiency_type` passes through directly (already
  uses the same string values), `severity` is a categorical label
  (none/mild/moderate/severe) that gets converted to a continuous value via
  `{none: 0, mild: 0.25, moderate: 0.55, severe: 0.85}` — see
  `engine/python/profile_adapter.py`.

## 2. Two transformation modes

### Mode A — Color Replacement

Input: a hex color + a `NormalizedVisionProfile`.
Output: a replacement hex color that sits farther from the user's confusion
axis than the original, while staying perceptually close in lightness so it
doesn't look jarring or change the element's visual weight.

Algorithm:
1. Convert input hex → CIE Lab (perceptually uniform — see
   `backend/app/core/color_space.py` for the conversion math this engine's
   Python port reuses directly).
2. Compute the color's hue angle on the Lab a*b* plane.
3. If `deficiencyType == 'none'` or `severity` is below a small threshold
   (0.15): return the color unchanged. Transforming colors a typical-vision
   or very-mild-deficiency user can already see fine adds visual noise for
   no benefit.
4. Red-green confusion is NOT "things near one midpoint hue" — red
   (~0°) and green (~130°) are far apart in raw hue angle but confused as a
   *pair*. So instead of one midpoint, the algorithm checks the color's hue
   distance to EACH of the two known confusable anchor hues for the user's
   axis (red-green: ~0°/~130°; blue-yellow: ~90°/~270°; or the profile's own
   measured `confusionAxis` if available) and finds whichever anchor it's
   nearest to.
5. If that nearest distance is within a severity-scaled "danger zone," blend
   the hue toward whichever hue on the *orthogonal* (safe) axis is closer to
   the color's current position — e.g. a red-green-deficient user's reds and
   greens both get pulled toward blue or yellow (whichever is the shorter
   hue-arc move), not toward each other and not toward a single fixed target.
   This is a blend (shortest-arc interpolation), not a fixed-degree rotation,
   so the further into the danger zone a color sits, the stronger the push.
6. L (lightness) and chroma (saturation) are preserved throughout — only
   hue changes — so the transformed color reads as "the same color, shifted,"
   not a different color entirely.
7. Convert back to sRGB hex.

This is a **rotation in hue space**, not a fixed lookup table, so it works
on arbitrary input colors (any hex a webpage/spreadsheet/dashboard happens
to use), not just a few hardcoded examples. The examples in the brief
(`#E74C3C → #3498DB`) are checked as test cases, not hardcoded as the
implementation.

### Mode B — Context Replacement

Input: a color (optionally with surrounding text/context hints like a CSS
class name or aria-label) + a `NormalizedVisionProfile`.
Output: `{ icon: string, label: string, semanticCategory: 'success' |
'warning' | 'error' | 'info' | 'neutral' }`.

Algorithm:
1. Classify the input color into a semantic category by hue + lightness
   bucket (see `SEMANTIC_COLOR_RANGES` in both ports) — green-family hues at
   moderate-to-high lightness → `success`; amber/orange-family → `warning`;
   red-family → `error`; blue-family → `info`; low-chroma/gray → `neutral`.
2. Look up the fixed icon+label for that category from `SEMANTIC_ICONS`.
3. Return both the icon and a human-readable label, so the CALLER (browser
   extension, Excel add-in, etc.) can decide how to render it — inject a
   `<span>`, prepend to cell text, overlay on a map marker, etc. The engine
   itself never touches the DOM/sheet/map directly; that's the platform
   layer's job, kept deliberately separate so the same classification logic
   works everywhere.

Context Replacement does NOT depend on severity or deficiency type at all
— if a color reads as semantically "error," everyone benefits from also
seeing "❌ Critical," not just colorblind users. This mode is the most
robust because it removes color from the decision path entirely, which is
why the brief calls it "next-level."

### Combined mode

`transformColor(hex, profile, mode)` accepts `mode: 'color' | 'context' |
'combined'`. Combined mode returns both a shifted color AND, if the color
is classified as semantic, an icon+label — used when `severity >= 0.4`
(matching the `recommended_strategy` thresholds already established in the
10-question module's analyzer).

## 3. Function signature (canonical, both languages mirror this)

Python (`engine/python/transformer.py`):
```python
def transform_color(
    hex_color: str,
    profile: NormalizedVisionProfile,
    mode: Literal["color", "context", "combined"] = "combined",
) -> TransformResult:
    ...
```

JavaScript (`engine/js/transformer.js`):
```js
function transformColor(hexColor, profile, mode = 'combined') { ... }
```

`TransformResult`:
```ts
interface TransformResult {
  originalHex: string
  transformedHex: string | null   // null if mode is 'context'-only and no color shift applied
  semantic: { icon: string; label: string; category: string } | null
  changed: boolean                 // true if anything was actually transformed
}
```

## 4. Performance constraints (why the JS port exists separately from a WASM call-out)

Browser extensions and dashboard SDKs need to transform potentially
thousands of DOM nodes on page load, synchronously, without blocking the
main thread for more than a frame or two. A round-trip to a Python backend
per-color is a non-starter. So:
- The JS port (`engine/js/transformer.js`) is the one that actually runs in
  browser extensions, the dashboard SDK, and (via React Native's JS engine)
  the mobile SDK.
- The Python port (`engine/python/transformer.py`) is canonical for
  anywhere JS can't run (Excel add-ins technically run JS too via Office.js,
  but a server-side batch-transform endpoint is still useful for e.g.
  pre-processing a spreadsheet upload) and as the reference implementation
  the JS port is tested against for parity.
- Both are pure functions with no I/O, so embedding either is just copying
  one file with no runtime dependencies beyond basic color math.
