/**
 * Pattern library — subtle CSS background patterns for financial gain/loss
 * visualization (spec brief item 4, "Pattern Overlay System"). Patterns are
 * intentionally subtle (10-20% opacity per the brief) so they read as a
 * texture hint, not a loud decoration competing with the icon+text that
 * already carries the actual meaning.
 *
 * Returns CSS background-image values (not full stylesheets) so callers
 * can compose them with whatever else is already on the element.
 */

/**
 * Diagonal-stripe pattern angled upward — pairs with the "gain" (📈) icon.
 * @param {number} [opacity]
 * @returns {string} CSS background-image value
 */
export function gainPattern(opacity = 0.14) {
  return (
    `linear-gradient(135deg, rgba(34,197,94,${opacity}) 25%, transparent 25%, transparent 50%, ` +
    `rgba(34,197,94,${opacity}) 50%, rgba(34,197,94,${opacity}) 75%, transparent 75%, transparent)`
  );
}

/**
 * Diagonal-stripe pattern angled downward — pairs with the "loss" (📉) icon.
 * @param {number} [opacity]
 * @returns {string} CSS background-image value
 */
export function lossPattern(opacity = 0.14) {
  return (
    `linear-gradient(45deg, rgba(239,68,68,${opacity}) 25%, transparent 25%, transparent 50%, ` +
    `rgba(239,68,68,${opacity}) 50%, rgba(239,68,68,${opacity}) 75%, transparent 75%, transparent)`
  );
}

const PATTERN_BACKGROUND_SIZE = "16px 16px";

/**
 * @param {'gain'|'loss'} patternType
 * @param {number} [opacity]
 * @returns {{ backgroundImage: string, backgroundSize: string } | null}
 */
export function getPatternStyle(patternType, opacity = 0.14) {
  if (patternType === "gain") {
    return { backgroundImage: gainPattern(opacity), backgroundSize: PATTERN_BACKGROUND_SIZE };
  }
  if (patternType === "loss") {
    return { backgroundImage: lossPattern(opacity), backgroundSize: PATTERN_BACKGROUND_SIZE };
  }
  return null;
}
