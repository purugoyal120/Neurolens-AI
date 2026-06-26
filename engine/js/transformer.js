/**
 * Core Transformation Engine — JavaScript implementation.
 *
 * This is the port that actually RUNS in browser extensions, the dashboard
 * SDK, and (via React Native's JS engine) the mobile SDK — see
 * docs/transformation-engine-spec.md section 4. It must stay in exact
 * behavioral parity with engine/python/transformer.py; see
 * engine/tests/test_parity.py (Python) which calls this file via a
 * subprocess/Node bridge to compare outputs directly.
 *
 * transformColor(hex, profile, mode) is the single public entry point.
 */

import { chroma, hexToLab, hueDeg, labToHex, withHue } from "./color.js";

/** @typedef {'color'|'context'|'combined'} TransformMode */
/** @typedef {'success'|'warning'|'error'|'info'|'neutral'} SemanticCategory */
/** @typedef {{ icon: string, label: string, category: SemanticCategory }} SemanticInfo */
/**
 * @typedef {{
 *   originalHex: string,
 *   transformedHex: string|null,
 *   semantic: SemanticInfo|null,
 *   changed: boolean
 * }} TransformResult
 */

// Below this severity, color replacement is a no-op: a typical-vision or
// near-typical user gets no benefit and only visual noise from a shift.
export const SEVERITY_NO_OP_THRESHOLD = 0.15;

// Combined mode adds context replacement on top of color shift once severity
// crosses this bar — mirrors the 10-question module's recommended_strategy
// thresholds (shift_hue / combined / icon_replacement) for consistency.
export const COMBINED_MODE_SEVERITY_THRESHOLD = 0.4;

// Edge taper floor: at the exact zone boundary, push strength is multiplied
// by this floor (not all the way to 0) so there's no jarring cliff between
// "just inside" and "just outside" the zone, while still letting severity
// dominate the overall strength.
const EDGE_TAPER_FLOOR = 0.6;

// ---------------------------------------------------------------------------
// Semantic classification + icon lookup (Context Replacement)
// ---------------------------------------------------------------------------

const SEMANTIC_ICONS = {
  success: ["✅", "Good"],
  warning: ["⚠", "Warning"],
  error: ["❌", "Critical"],
  info: ["ℹ", "Info"],
  neutral: ["◻", "Neutral"],
};

/**
 * Buckets a color into a semantic category by hue + chroma. Boundaries are
 * calibrated against measured Lab hue angles of real status colors from
 * common UI frameworks (Bootstrap, Tailwind, Flat UI) — see the identical
 * comment in engine/python/transformer.py classify_semantic() for the
 * specific reference values used to calibrate each boundary.
 * @param {string} hexColor
 * @returns {SemanticCategory}
 */
export function classifySemantic(hexColor) {
  const lab = hexToLab(hexColor);
  const c = chroma(lab);

  if (c < 12) return "neutral";

  const hue = hueDeg(lab);
  if (hue < 48 || hue >= 345) return "error";
  if (hue >= 48 && hue < 118) return "warning";
  if (hue >= 118 && hue < 200) return "success";
  if (hue >= 200 && hue < 300) return "info";
  return "neutral";
}

/**
 * @param {string} hexColor
 * @returns {SemanticInfo}
 */
export function getSemanticInfo(hexColor) {
  const category = classifySemantic(hexColor);
  const [icon, label] = SEMANTIC_ICONS[category];
  return { icon, label, category };
}

// ---------------------------------------------------------------------------
// Color Replacement (hue-space blend toward a dedicated safe target)
// ---------------------------------------------------------------------------

// Per-anchor zone bounds are ASYMMETRIC — see the identical comment in
// engine/python/transformer.py for the real-world UI color calibration data
// behind these specific numbers. Each entry is
// anchorDeg -> [halfWidthTowardLowerHues, halfWidthTowardHigherHues].
const RED_GREEN_ZONE_BOUNDS = {
  0.0: [30.0, 45.0],
  130.0: [20.0, 35.0],
};
const BLUE_YELLOW_ZONE_BOUNDS = {
  90.0: [35.0, 20.0],
  270.0: [55.0, 35.0],
};
const SEVERITY_ZONE_BONUS_DEG = 12.0;

// Anchor hues (degrees) for each deficiency axis, matching
// PROTAN_DEUTAN_AXIS / TRITAN_AXIS in backend/app/core/test_stimuli.py.
export const RED_GREEN_ANCHORS_DEG = [0.0, 130.0];
export const BLUE_YELLOW_ANCHORS_DEG = [90.0, 270.0];

// Each confusable anchor hue is paired with its OWN dedicated target hue —
// see the identical comment in engine/python/transformer.py for the
// rationale (prevents two different anchors converging on the same target).
const ANCHOR_TO_TARGET_DEG = {
  [RED_GREEN_ANCHORS_DEG[0]]: BLUE_YELLOW_ANCHORS_DEG[0], // red -> "yellow" slot
  [RED_GREEN_ANCHORS_DEG[1]]: BLUE_YELLOW_ANCHORS_DEG[1], // green -> "blue" slot
  [BLUE_YELLOW_ANCHORS_DEG[0]]: RED_GREEN_ANCHORS_DEG[1], // "yellow" slot -> green
  [BLUE_YELLOW_ANCHORS_DEG[1]]: RED_GREEN_ANCHORS_DEG[0], // "blue" slot -> red
};

/**
 * @param {NormalizedVisionProfile} profile
 * @returns {[number, number]|null}
 */
function anchorsForProfile(profile) {
  if (profile.confusionAxis) {
    return [profile.confusionAxis.hueADeg, profile.confusionAxis.hueBDeg];
  }
  if (profile.deficiencyType === "red-green") return RED_GREEN_ANCHORS_DEG;
  if (profile.deficiencyType === "blue-yellow") return BLUE_YELLOW_ANCHORS_DEG;
  return null;
}

/** Signed shortest-arc distance: positive if toHue is "above" fromHue going
 * the short way around, negative if "below". */
function signedHueDistanceDeg(fromHue, toHue) {
  return (((toHue - fromHue + 540) % 360) + 360) % 360 - 180;
}

/**
 * Looks up the dedicated target hue for a known curated anchor, or falls
 * back to a +/-90deg rotation for a profile's own measured confusion_axis
 * (see identical fallback logic in the Python port for rationale).
 */
function targetForAnchor(anchorHue, profile) {
  if (anchorHue in ANCHOR_TO_TARGET_DEG) {
    return ANCHOR_TO_TARGET_DEG[anchorHue];
  }
  if (profile.confusionAxis) {
    const { hueADeg: a, hueBDeg: b } = profile.confusionAxis;
    const sign = anchorHue === Math.min(a, b) ? 1.0 : -1.0;
    return (anchorHue + sign * 90.0 + 360) % 360;
  }
  return (anchorHue + 90.0) % 360;
}

/** Returns [halfWidthLower, halfWidthUpper] for a curated anchor, or a
 * symmetric fallback for a measured/custom one. */
function zoneBoundsForAnchor(anchorHue, deficiencyType) {
  const table = deficiencyType === "red-green" ? RED_GREEN_ZONE_BOUNDS : BLUE_YELLOW_ZONE_BOUNDS;
  if (anchorHue in table) return table[anchorHue];
  return [30.0, 30.0];
}

/** Interpolates along the SHORTER arc between two hue angles. */
function slerpHueDeg(fromDeg, toDeg, t) {
  const diff = ((((toDeg - fromDeg + 540) % 360) + 360) % 360) - 180; // range (-180, 180]
  return (((fromDeg + diff * t) % 360) + 360) % 360;
}

/**
 * @param {string} hexColor
 * @param {NormalizedVisionProfile} profile
 * @returns {[string, boolean]} [newHex, changed]
 */
export function shiftColorForProfile(hexColor, profile) {
  if (
    profile.deficiencyType === "none" ||
    profile.deficiencyType === "unknown" ||
    profile.severity < SEVERITY_NO_OP_THRESHOLD
  ) {
    return [hexColor, false];
  }

  const anchors = anchorsForProfile(profile);
  if (!anchors) return [hexColor, false];

  const lab = hexToLab(hexColor);
  const hue = hueDeg(lab);

  // For each anchor, check the SIGNED distance against that anchor's own
  // asymmetric bounds rather than one symmetric width for all anchors.
  let best = null; // { normalized, anchor }
  for (const anchor of anchors) {
    const signed = signedHueDistanceDeg(anchor, hue);
    const [lowerBound, upperBound] = zoneBoundsForAnchor(anchor, profile.deficiencyType);
    const bound = signed < 0 ? lowerBound : upperBound;
    const bonus = SEVERITY_ZONE_BONUS_DEG * profile.severity;
    const effectiveBound = bound + bonus;
    if (effectiveBound <= 0) continue;
    const normalized = Math.abs(signed) / effectiveBound;
    if (normalized <= 1.0 && (best === null || normalized < best.normalized)) {
      best = { normalized, anchor };
    }
  }

  if (best === null) return [hexColor, false]; // not close enough to either confusable hue

  const targetHue = targetForAnchor(best.anchor, profile);

  // Blend strength is PRIMARILY severity, with only a gentle edge taper.
  const edgeTaper = EDGE_TAPER_FLOOR + (1 - EDGE_TAPER_FLOOR) * (1.0 - best.normalized);
  const blendAmount = profile.severity * edgeTaper;

  const newHue = slerpHueDeg(hue, targetHue, blendAmount);
  const newLab = withHue(lab, newHue);
  return [labToHex(newLab), true];
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * The single public entry point for the engine, per
 * docs/transformation-engine-spec.md section 3.
 * @param {string} hexColor
 * @param {NormalizedVisionProfile} profile
 * @param {TransformMode} [mode]
 * @returns {TransformResult}
 */
export function transformColor(hexColor, profile, mode = "combined") {
  if (mode === "color") {
    const [newHex, changed] = shiftColorForProfile(hexColor, profile);
    return { originalHex: hexColor, transformedHex: newHex, semantic: null, changed };
  }

  if (mode === "context") {
    const semantic = getSemanticInfo(hexColor);
    return { originalHex: hexColor, transformedHex: null, semantic, changed: true };
  }

  // combined
  const [newHex, colorChanged] = shiftColorForProfile(hexColor, profile);
  let semantic = null;
  if (profile.severity >= COMBINED_MODE_SEVERITY_THRESHOLD) {
    semantic = getSemanticInfo(hexColor);
  }
  return {
    originalHex: hexColor,
    transformedHex: newHex,
    semantic,
    changed: colorChanged || semantic !== null,
  };
}
