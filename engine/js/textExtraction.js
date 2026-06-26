/**
 * Smart text extraction — JS port of engine/python/text_extraction.py.
 * Keep identical. Operates on a plain object, not a real DOM node, so the
 * caller (content script, Excel add-in, RN SDK) is responsible for pulling
 * textContent/ariaLabel/title/childText out of whatever host environment
 * it's running in and handing them here as plain strings.
 */

import { getDefaultLabel } from "./iconLibrary.js";

const SOURCE_PRIORITY = ["textContent", "ariaLabel", "title", "childText"];

/**
 * @param {Record<string, string|null|undefined>} sources
 * @returns {string|null}
 */
export function extractText(sources) {
  for (const key of SOURCE_PRIORITY) {
    const value = sources[key];
    if (value && value.trim()) return value.trim();
  }
  return null;
}

const FALLBACK_PHRASING = {
  success: "Success status",
  warning: "Warning indicator",
  error: "Error message",
  info: "Information",
};

/**
 * @param {string|null} extractedText
 * @param {string} label
 * @returns {string}
 */
export function displayText(extractedText, label) {
  if (extractedText) return extractedText;
  return FALLBACK_PHRASING[label] ?? `${getDefaultLabel(label)} status`;
}
