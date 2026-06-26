from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, String
from sqlalchemy.types import JSON

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class VisionProfile(Base):
    """
    One row per user's current vision map. We keep test_version and
    raw_responses around so the profile can be audited/recomputed if the
    scoring model improves, without forcing the user to retake the test.
    """
    __tablename__ = "vision_profiles"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, index=True, nullable=False)

    cvd_type = Column(String, nullable=False)
    severity = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)

    hue_a_deg = Column(Float, nullable=False)
    hue_b_deg = Column(Float, nullable=False)

    # JSON-serialized dict[str, float] — per-30deg-bucket discrimination score
    per_hue_discrimination = Column(JSON, nullable=False)

    recommended_strategy = Column(String, nullable=False)

    # Raw test responses, stored for re-scoring / debugging / model improvement.
    raw_responses = Column(JSON, nullable=False)

    test_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=_now)
    updated_at = Column(DateTime, default=_now, onupdate=_now)
