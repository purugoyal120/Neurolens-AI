/**
 * Curated lexicons for the rule-based Semantic Color Detector.
 * JS port of engine/python/semantic_lexicon.py — keep identical.
 */

export const TEXT_KEYWORDS = {
  success: [
    "good", "success", "successful", "passed", "pass", "ok", "okay",
    "complete", "completed", "done", "approved", "active", "healthy",
    "on track", "available", "verified", "confirmed", "resolved",
    "up to date", "valid", "compliant",
  ],
  warning: [
    "warning", "warn", "caution", "pending", "review", "needs review",
    "attention", "moderate", "degraded", "at risk", "expiring",
    "expiring soon", "delayed", "incomplete", "partial", "unstable",
    "outdated", "stale",
  ],
  error: [
    "error", "critical", "failed", "fail", "failure", "danger",
    "rejected", "blocked", "invalid", "expired", "down", "offline",
    "broken", "overdue", "over budget", "non-compliant", "unresolved",
    "denied", "cancelled", "canceled",
  ],
  info: [
    "info", "information", "note", "notice", "tip", "fyi", "details",
    "in progress", "processing", "queued", "scheduled", "draft",
  ],
};

export const GAIN_KEYWORDS = [
  "gain", "gained", "growth", "grew", "increase", "increased", "up",
  "profit", "surplus", "exceeded", "beat", "outperformed",
];

export const LOSS_KEYWORDS = [
  "loss", "lost", "decline", "declined", "decrease", "decreased", "down",
  "deficit", "shortfall", "missed", "underperformed",
];

export const FINANCIAL_CONTEXT_KEYWORDS = [
  "revenue", "profit", "sales", "earnings", "income", "budget",
  "financial", "finance", "quarterly", "p&l", "margin",
];

export const STATUS_BEARING_ELEMENT_TYPES = [
  "badge", "status", "chip", "tag", "alert", "banner", "pill",
];
