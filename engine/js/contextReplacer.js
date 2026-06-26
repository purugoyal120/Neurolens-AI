/**
 * ContextReplacementEngine — applies SemanticColorDetector results to real
 * DOM elements. This is the brief's exact requested class shape:
 *   detectSemantic(element) -> semantic label
 *   replaceWithIcon(element, semantic) -> modified HTML
 *   addPattern(element, patternType) -> CSS pattern overlay
 *   applyToPage(document) -> transform entire page
 *
 * Works against the real DOM (browser extension content script) but is
 * structured so its core logic is testable in plain Node without a DOM —
 * `detectSemantic` only needs a plain {colorHex, text, elementType,
 * parentContext} shape, which `_readElementSignals` extracts from a real
 * element; tests can call `detectFromSignals` directly with plain objects
 * instead of constructing a DOM.
 */

import { SemanticColorDetector } from "./semanticDetector.js";
import { getIcon } from "./iconLibrary.js";
import { extractText, displayText } from "./textExtraction.js";
import { getPatternStyle } from "./patterns.js";

const MARKER_ATTR = "data-neurolens-applied";

export class ContextReplacementEngine {
  /**
   * @param {{ customMappings?: Record<string, {icon: string, label: string}>, confidenceThreshold?: number }} [options]
   */
  constructor({ customMappings = {}, confidenceThreshold = 0.5 } = {}) {
    this.detector = new SemanticColorDetector();
    // Custom mappings (brief item 7): keyed by lowercased color hex, e.g.
    // { "#9b59b6": { icon: "👑", label: "Premium" } }. Checked BEFORE the
    // standard detector, so a user's explicit override always wins.
    this.customMappings = customMappings;
    this.confidenceThreshold = confidenceThreshold;
    // Cache keyed by a signal fingerprint, so re-processing the same
    // element shape (e.g. on a DOM mutation re-scan) doesn't redo work —
    // see spec brief item 8, "memoization."
    this._cache = new Map();
  }

  /**
   * Reads the signals the detector needs from a real DOM element. Kept as
   * its own method so it's the ONLY place that touches `element.*` DOM
   * APIs directly — everything downstream works with plain data.
   * @param {Element} element
   * @returns {{ colorHex: string|null, text: string|null, elementType: string|null, parentContext: string|null }}
   */
  _readElementSignals(element) {
    const computed = typeof window !== "undefined" && window.getComputedStyle ? window.getComputedStyle(element) : null;
    const colorHex = computed ? this._rgbStringToHex(computed.backgroundColor) : null;

    const text = extractText({
      textContent: element.textContent,
      ariaLabel: element.getAttribute ? element.getAttribute("aria-label") : null,
      title: element.getAttribute ? element.getAttribute("title") : null,
      childText: element.firstChild ? element.firstChild.textContent : null,
    });

    const elementType = this._inferElementType(element);
    const parentContext = this._readParentContext(element);

    return { colorHex, text, elementType, parentContext };
  }

  _inferElementType(element) {
    const tag = element.tagName ? element.tagName.toLowerCase() : null;
    const className = element.className && typeof element.className === "string" ? element.className.toLowerCase() : "";
    const roleAttr = element.getAttribute ? (element.getAttribute("role") || "") : "";
    for (const hint of ["badge", "status", "chip", "tag", "alert", "banner", "pill"]) {
      if (className.includes(hint) || roleAttr.includes(hint)) return hint;
    }
    return tag;
  }

  _readParentContext(element) {
    // Walk up a few levels looking for a heading or a data attribute that
    // names the section — generous enough to catch common dashboard
    // patterns without an expensive full-tree walk.
    let node = element.parentElement;
    let depth = 0;
    while (node && depth < 4) {
      const sectionName = node.getAttribute && node.getAttribute("data-section");
      if (sectionName) return sectionName;
      const heading = node.querySelector && node.querySelector("h1,h2,h3,[data-section-title]");
      if (heading && heading.textContent) return heading.textContent;
      node = node.parentElement;
      depth += 1;
    }
    return null;
  }

  _rgbStringToHex(rgbString) {
    if (!rgbString) return null;
    const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    const [, r, g, b] = match;
    const toHex = (n) => Number(n).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * @param {Element} element
   * @returns {import('./semanticDetector.js').DetectionResult}
   */
  detectSemantic(element) {
    const signals = this._readElementSignals(element);
    return this.detectFromSignals(signals);
  }

  /**
   * Same detection logic as detectSemantic, but operating on plain data —
   * this is what's actually unit-testable without a DOM, and what
   * detectSemantic delegates to after reading the element.
   * @param {{ colorHex: string|null, text: string|null, elementType: string|null, parentContext: string|null }} signals
   */
  detectFromSignals(signals) {
    const cacheKey = JSON.stringify(signals);
    if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

    const customMatch = this._checkCustomMapping(signals);
    const result = customMatch ?? this.detector.detect(signals);

    this._cache.set(cacheKey, result);
    return result;
  }

  _checkCustomMapping(signals) {
    if (signals.colorHex && this.customMappings[signals.colorHex.toLowerCase()]) {
      const mapping = this.customMappings[signals.colorHex.toLowerCase()];
      return { label: "custom", confidence: 1.0, pattern: null, matchedSignals: ["custom_mapping"], _custom: mapping };
    }
    return null;
  }

  /**
   * Applies the icon+text replacement to a single element in place.
   * @param {Element} element
   * @param {import('./semanticDetector.js').DetectionResult} [semantic] - reuse a result from detectSemantic if already computed
   */
  replaceWithIcon(element, semantic = null) {
    const result = semantic ?? this.detectSemantic(element);
    if (result.confidence < this.confidenceThreshold) return false;
    if (element.getAttribute && element.getAttribute(MARKER_ATTR)) return false; // already applied

    const extracted = extractText({
      textContent: element.textContent,
      ariaLabel: element.getAttribute ? element.getAttribute("aria-label") : null,
      title: element.getAttribute ? element.getAttribute("title") : null,
    });

    let icon, label;
    if (result._custom) {
      icon = result._custom.icon;
      label = result._custom.label;
    } else {
      const assignment = getIcon(result);
      icon = assignment.icon;
      label = displayText(extracted, result.label);
      if (result.pattern) this.addPattern(element, result.pattern);
    }

    if (element.textContent !== undefined) {
      element.textContent = `${icon} ${label}`;
    }
    if (element.setAttribute) {
      element.setAttribute(MARKER_ATTR, result.label);
      if (element.style && element.style.removeProperty) {
        element.style.removeProperty("background-color");
      }
    }
    return true;
  }

  /**
   * Adds a subtle CSS pattern overlay (spec brief item 4) without removing
   * any icon/text already applied.
   * @param {Element} element
   * @param {'gain'|'loss'} patternType
   */
  addPattern(element, patternType) {
    const style = getPatternStyle(patternType);
    if (!style || !element.style) return false;
    element.style.backgroundImage = style.backgroundImage;
    element.style.backgroundSize = style.backgroundSize;
    return true;
  }

  /**
   * Transforms an entire document: finds candidate colored elements and
   * applies replaceWithIcon to each, batched (spec brief item 8: "batch
   * DOM processing, process 100 elements at once") so a huge page doesn't
   * block the main thread in one long synchronous pass.
   * @param {Document} doc
   * @param {{ batchSize?: number, selector?: string }} [options]
   * @returns {Promise<number>} number of elements actually transformed
   */
  async applyToPage(doc, { batchSize = 100, selector = "[style*=background],[class]" } = {}) {
    const candidates = Array.from(doc.querySelectorAll(selector));
    let transformedCount = 0;

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      for (const el of batch) {
        if (this.replaceWithIcon(el)) transformedCount += 1;
      }
      if (i + batchSize < candidates.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    return transformedCount;
  }

  clearCache() {
    this._cache.clear();
  }
}
