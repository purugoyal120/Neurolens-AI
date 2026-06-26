/**
 * Icon library — JS port of engine/python/icon_library.py. Keep identical.
 */

export const BASE_ICONS = {
  success: "✅",
  warning: "⚠",
  error: "❌",
  info: "📘",
  neutral: "◻",
};

export const PATTERN_ICONS = {
  gain: "📈",
  loss: "📉",
};

export const DEFAULT_LABELS = {
  success: "Good",
  warning: "Warning",
  error: "Critical",
  info: "Info",
  neutral: "Neutral",
};

/**
 * @param {{ label: string, pattern: string|null }} result
 * @returns {{ icon: string, patternClass: string|null }}
 */
export function getIcon(result) {
  if (result.pattern && PATTERN_ICONS[result.pattern]) {
    return { icon: PATTERN_ICONS[result.pattern], patternClass: `nl-pattern-${result.pattern}` };
  }
  return { icon: BASE_ICONS[result.label] ?? BASE_ICONS.neutral, patternClass: null };
}

/** @param {string} label */
export function getDefaultLabel(label) {
  return DEFAULT_LABELS[label] ?? "Status";
}
