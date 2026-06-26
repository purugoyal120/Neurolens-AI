"""
Curated lexicons for the rule-based Semantic Color Detector.

These are the "training data" in the sense that matters for this detector:
hand-curated, auditable word lists rather than opaque model weights. Every
entry here was chosen because it's a common, unambiguous status word in
real UI copy (dashboards, status badges, build/CI output, financial
reports) — not scraped or synthesized.

Word-boundary matching (not substring) is used by the detector when
applying these lists — see semantic_detector.py — so "good" doesn't match
inside "goodbye" and "warning" doesn't match inside "Early Warning System".
"""

from __future__ import annotations

# Each category maps to a set of lowercase keywords. Multi-word phrases are
# allowed and matched as exact phrases within the text.
TEXT_KEYWORDS: dict[str, set[str]] = {
    "success": {
        "good", "success", "successful", "passed", "pass", "ok", "okay",
        "complete", "completed", "done", "approved", "active", "healthy",
        "on track", "available", "verified", "confirmed", "resolved",
        "up to date", "valid", "compliant",
    },
    "warning": {
        "warning", "warn", "caution", "pending", "review", "needs review",
        "attention", "moderate", "degraded", "at risk", "expiring",
        "expiring soon", "delayed", "incomplete", "partial", "unstable",
        "outdated", "stale",
    },
    "error": {
        "error", "critical", "failed", "fail", "failure", "danger",
        "rejected", "blocked", "invalid", "expired", "down", "offline",
        "broken", "overdue", "over budget", "non-compliant", "unresolved",
        "denied", "cancelled", "canceled",
    },
    "info": {
        "info", "information", "note", "notice", "tip", "fyi", "details",
        "in progress", "processing", "queued", "scheduled", "draft",
    },
}

# Financial/revenue-specific refinement keywords (see spec section 4) —
# checked SEPARATELY from the base TEXT_KEYWORDS, as a label-refinement
# step applied after a success/error label is already determined.
GAIN_KEYWORDS: set[str] = {
    "gain", "gained", "growth", "grew", "increase", "increased", "up",
    "profit", "surplus", "exceeded", "beat", "outperformed",
}
LOSS_KEYWORDS: set[str] = {
    "loss", "lost", "decline", "declined", "decrease", "decreased", "down",
    "deficit", "shortfall", "missed", "underperformed",
}
FINANCIAL_CONTEXT_KEYWORDS: set[str] = {
    "revenue", "profit", "sales", "earnings", "income", "budget",
    "financial", "finance", "quarterly", "p&l", "margin",
}

# Element types that bias toward certain interpretations when other
# signals are weak/absent. Deliberately small and conservative — these are
# tie-breakers, not primary signal (see spec section 2, "context signal is
# weakest alone").
STATUS_BEARING_ELEMENT_TYPES: set[str] = {
    "badge", "status", "chip", "tag", "alert", "banner", "pill",
}
