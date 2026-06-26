/**
 * SemanticColorDetector — rule-based signal fusion, the production detector.
 * JS port of engine/python/semantic_detector.py — see
 * docs/semantic-detector-spec.md for the design rationale. Must stay in
 * exact behavioral parity with the Python version (see
 * engine/tests/test_semantic_parity.py).
 *
 * This is the version that actually runs in the browser extension,
 * dashboard SDK, and React Native SDK.
 */

import { classifySemantic } from "./transformer.js";
import {
  FINANCIAL_CONTEXT_KEYWORDS,
  GAIN_KEYWORDS,
  LOSS_KEYWORDS,
  STATUS_BEARING_ELEMENT_TYPES,
  TEXT_KEYWORDS,
} from "./semanticLexicon.js";

/** @typedef {'success'|'warning'|'error'|'info'|'neutral'} SemanticLabel */
/**
 * @typedef {{
 *   label: SemanticLabel,
 *   confidence: number,
 *   pattern: 'gain'|'loss'|null,
 *   matchedSignals: string[]
 * }} DetectionResult
 */

const wordBoundaryCache = new Map();

/** Compiles (and caches) a word-boundary regex for a keyword/phrase. */
function phrasePattern(phrase) {
  if (!wordBoundaryCache.has(phrase)) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    wordBoundaryCache.set(phrase, new RegExp(`\\b${escaped}\\b`, "i"));
  }
  return wordBoundaryCache.get(phrase);
}

function findMatchingKeywords(text, keywordList) {
  if (!text) return [];
  return keywordList.filter((kw) => phrasePattern(kw).test(text));
}

export class SemanticColorDetector {
  /**
   * @param {{ colorHex?: string|null, text?: string|null, elementType?: string|null, parentContext?: string|null }} input
   * @returns {DetectionResult}
   */
  detect({ colorHex = null, text = null, elementType = null, parentContext = null } = {}) {
    const [textLabel, textConfidence, textMatched] = this._textSignal(text);
    const [colorLabel, colorConfidence] = this._colorSignal(colorHex);
    const contextBonus = this._contextSignal(elementType, parentContext);

    const { label, confidence, matchedSignals } = this._fuse(
      textLabel, textConfidence, textMatched,
      colorLabel, colorConfidence,
      contextBonus,
    );

    const pattern = this._financialRefinement(label, text, parentContext);

    return { label, confidence, pattern, matchedSignals };
  }

  _textSignal(text) {
    if (!text) return [null, 0.0, []];

    let bestLabel = null;
    let bestMatch = "";
    for (const [label, keywords] of Object.entries(TEXT_KEYWORDS)) {
      for (const m of findMatchingKeywords(text, keywords)) {
        if (m.length > bestMatch.length) {
          bestMatch = m;
          bestLabel = label;
        }
      }
    }

    for (const kw of findMatchingKeywords(text, GAIN_KEYWORDS)) {
      if (kw.length > bestMatch.length) {
        bestMatch = kw;
        bestLabel = "success";
      }
    }
    for (const kw of findMatchingKeywords(text, LOSS_KEYWORDS)) {
      if (kw.length > bestMatch.length) {
        bestMatch = kw;
        bestLabel = "error";
      }
    }

    if (bestLabel === null) return [null, 0.0, []];
    return [bestLabel, 0.85, [bestMatch]];
  }

  _colorSignal(colorHex) {
    if (!colorHex) return [null, 0.0];
    const category = classifySemantic(colorHex);
    if (category === "neutral") return ["neutral", 0.3];
    return [category, 0.6];
  }

  _contextSignal(elementType, parentContext) {
    let bonus = 0.0;
    if (elementType && STATUS_BEARING_ELEMENT_TYPES.includes(elementType.toLowerCase())) {
      bonus += 0.05;
    }
    if (parentContext) {
      const lowered = parentContext.toLowerCase();
      if (FINANCIAL_CONTEXT_KEYWORDS.some((kw) => phrasePattern(kw).test(lowered))) {
        bonus += 0.05;
      }
    }
    return bonus;
  }

  _fuse(textLabel, textConfidence, textMatched, colorLabel, colorConfidence, contextBonus) {
    const matchedSignals = [];

    if (textLabel !== null) {
      matchedSignals.push(`text:${textMatched[0]}`);
      if (colorLabel !== null && colorLabel === textLabel) {
        matchedSignals.push(`color:${colorLabel}`);
        return { label: textLabel, confidence: Math.min(1.0, textConfidence + 0.1 + contextBonus), matchedSignals };
      }
      if (colorLabel !== null && colorLabel !== "neutral" && colorLabel !== textLabel) {
        matchedSignals.push(`color_conflict:${colorLabel}`);
        return {
          label: textLabel,
          confidence: Math.max(0.0, textConfidence - 0.15 + contextBonus),
          matchedSignals,
        };
      }
      return { label: textLabel, confidence: Math.min(1.0, textConfidence + contextBonus), matchedSignals };
    }

    if (colorLabel !== null && colorLabel !== "neutral") {
      matchedSignals.push(`color:${colorLabel}`);
      return { label: colorLabel, confidence: Math.min(1.0, colorConfidence + contextBonus), matchedSignals };
    }

    if (contextBonus > 0) matchedSignals.push("context_only");
    return { label: "neutral", confidence: Math.min(0.3 + contextBonus, 0.4), matchedSignals };
  }

  _financialRefinement(label, text, parentContext) {
    if (label !== "success" && label !== "error") return null;

    const combined = `${text || ""} ${parentContext || ""}`.toLowerCase();
    const isFinancialContext = FINANCIAL_CONTEXT_KEYWORDS.some((kw) => phrasePattern(kw).test(combined));
    const hasGainWord = GAIN_KEYWORDS.some((kw) => phrasePattern(kw).test(combined));
    const hasLossWord = LOSS_KEYWORDS.some((kw) => phrasePattern(kw).test(combined));

    if (hasGainWord && label === "success") return "gain";
    if (hasLossWord && label === "error") return "loss";
    if (isFinancialContext) return label === "success" ? "gain" : "loss";
    return null;
  }
}
