"""
SQLAlchemy model for the Vision Profile Test Module (simple 10-question version).

Per spec this stores (user_id, profile_json, created_at, updated_at) — the
whole VisionProfile is persisted as a single JSON blob rather than broken
into individual columns, which matches "Table: vision_profiles (user_id,
profile_json, created_at, updated_at)" from the request exactly.

NOTE ON TABLE NAME: the repo already has a richer, column-per-field
`vision_profiles` table (app/models/vision_profile.py) backing the other
12-trial Vision Profile Test module. To avoid a table-name collision while
both modules coexist in this codebase, this module's table is named
`simple_vision_profiles`. If/when the two test modules get consolidated,
this is the table to migrate away.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String
from sqlalchemy.types import JSON

from app.db.session import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class SimpleVisionProfile(Base):
    __tablename__ = "simple_vision_profiles"

    user_id = Column(String, primary_key=True)
    profile_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=_now, nullable=False)
    updated_at = Column(DateTime, default=_now, onupdate=_now, nullable=False)
