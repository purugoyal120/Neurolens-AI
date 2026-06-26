/**
 * Adapts the two existing vision-profile JSON shapes in this repo into the
 * engine's own stable NormalizedVisionProfile. JS port of
 * engine/python/profile_adapter.py — see docs/transformation-engine-spec.md
 * section 1 for why this exists.
 */

/**
 * @typedef {'red-green'|'blue-yellow'|'none'|'unknown'} DeficiencyType
 * @typedef {{ hueADeg: number, hueBDeg: number }} ConfusionAxis
 * @typedef {{
 *   userId: string,
 *   deficiencyType: DeficiencyType,
 *   severity: number,
 *   confusionAxis: ConfusionAxis|null
 * }} NormalizedVisionProfile
 */

const CATEGORICAL_SEVERITY_TO_FLOAT = {
  none: 0.0,
  mild: 0.25,
  moderate: 0.55,
  severe: 0.85,
};

/**
 * Safe default — used when no profile is available yet, so callers never
 * need to special-case "no profile" vs "profile says no deficiency."
 * @param {string} [userId]
 * @returns {NormalizedVisionProfile}
 */
export function noDeficiencyProfile(userId = "anonymous") {
  return { userId, deficiencyType: "none", severity: 0.0, confusionAxis: null };
}

/**
 * Adapts the 12-trial module's VisionMapOut shape:
 * { cvd_type, severity, confusion_axis: {hue_a_deg, hue_b_deg}, ... }
 * @param {object} visionMap
 * @returns {NormalizedVisionProfile}
 */
export function fromExtendedModule(visionMap) {
  const cvdType = visionMap.cvd_type ?? "unknown";
  let deficiencyType;
  if (cvdType === "protan" || cvdType === "deutan") {
    deficiencyType = "red-green";
  } else if (cvdType === "tritan") {
    deficiencyType = "blue-yellow";
  } else if (cvdType === "none") {
    deficiencyType = "none";
  } else {
    deficiencyType = "unknown";
  }

  const axisRaw = visionMap.confusion_axis;
  const confusionAxis = axisRaw
    ? { hueADeg: axisRaw.hue_a_deg, hueBDeg: axisRaw.hue_b_deg }
    : null;

  return {
    userId: visionMap.user_id ?? "anonymous",
    deficiencyType,
    severity: Number(visionMap.severity ?? 0.0),
    confusionAxis,
  };
}

/**
 * Adapts the 10-question module's VisionProfileOut shape:
 * { deficiency_type: "red-green"|"blue-yellow"|"none", severity: "mild"|... }
 * @param {object} visionProfile
 * @returns {NormalizedVisionProfile}
 */
export function fromSimpleModule(visionProfile) {
  let deficiencyType = visionProfile.deficiency_type ?? "unknown";
  if (!["red-green", "blue-yellow", "none"].includes(deficiencyType)) {
    deficiencyType = "unknown";
  }

  const severityLabel = visionProfile.severity ?? "none";
  const severity = CATEGORICAL_SEVERITY_TO_FLOAT[severityLabel] ?? 0.0;

  return {
    userId: visionProfile.user_id ?? "anonymous",
    deficiencyType,
    severity,
    confusionAxis: null, // this module doesn't produce per-hue axis data
  };
}
