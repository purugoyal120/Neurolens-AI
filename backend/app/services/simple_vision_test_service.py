from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.vision_test_data import QUESTIONS, TEST_VERSION, TIME_LIMIT_SECONDS
from app.ml.vision_test_analyzer import analyze_vision_profile
from app.models.simple_vision_profile import SimpleVisionProfile
from app.schemas.vision_test import (
    AnswerOptionOut,
    QuestionOut,
    ScoreSummaryOut,
    SubmitVisionTestIn,
    SubmitVisionTestOut,
    VisionProfileOut,
    VisionTestConfigOut,
)


def build_test_config() -> VisionTestConfigOut:
    questions_out = [
        QuestionOut(
            id=q.id,
            index=q.index,
            axis=q.axis.value,
            difficulty=q.difficulty.value,
            prompt=q.prompt,
            stimulus_hex=q.stimulus_hex,
            options=[AnswerOptionOut(id=o.id, label=o.label, hex=o.hex) for o in q.options],
            correct_option_id=q.correct_option_id,
        )
        for q in QUESTIONS
    ]
    return VisionTestConfigOut(
        test_id=str(uuid.uuid4()),
        version=TEST_VERSION,
        time_limit_seconds=TIME_LIMIT_SECONDS,
        questions=questions_out,
    )


def submit_and_score(db: Session, payload: SubmitVisionTestIn) -> SubmitVisionTestOut:
    raw_answers = [a.model_dump() for a in payload.answers]
    analysis = analyze_vision_profile(payload.user_id, raw_answers)
    score_summary = analysis.pop("_score_summary")

    now = datetime.now(timezone.utc)
    existing = db.get(SimpleVisionProfile, payload.user_id)
    if existing:
        existing.profile_json = {**analysis, "created_at": existing.created_at.isoformat(), "updated_at": now.isoformat()}
        existing.updated_at = now
        row = existing
    else:
        profile_json = {**analysis, "created_at": now.isoformat(), "updated_at": now.isoformat()}
        row = SimpleVisionProfile(user_id=payload.user_id, profile_json=profile_json, created_at=now, updated_at=now)
        db.add(row)

    # Automatically maintain a crystal-clear audit log table in SQLite so the user can easily see exactly what happened!
    try:
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS vision_test_audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                deficiency_type TEXT,
                percent_accuracy INTEGER,
                color_confusion_detected TEXT,
                transformations_applied TEXT,
                ai_explanation TEXT,
                timestamp TEXT
            )
        """))
        
        transformations_summary = ", ".join([
            f"{t.get('original_color_name', '')} -> {t.get('meaning_label', '')}" 
            for t in analysis.get("meaning_based_transformations", [])
        ])
        
        db.execute(text("""
            INSERT INTO vision_test_audit_log (
                user_id, deficiency_type, percent_accuracy, color_confusion_detected, transformations_applied, ai_explanation, timestamp
            ) VALUES (:uid, :dtype, :acc, :conf, :trans, :exp, :ts)
        """), {
            "uid": payload.user_id,
            "dtype": analysis.get("deficiency_type", "None"),
            "acc": analysis.get("percent_accuracy", 0),
            "conf": analysis.get("color_confusion_status", "None"),
            "trans": transformations_summary,
            "exp": analysis.get("ai_explanation", ""),
            "ts": now.isoformat()
        })
    except Exception as e:
        print("Audit log insertion error:", e)

    db.commit()
    db.refresh(row)

    profile_out = _row_to_profile_out(row)
    return SubmitVisionTestOut(
        profile=profile_out,
        score_summary=ScoreSummaryOut(**score_summary),
    )


def get_profile(db: Session, user_id: str) -> VisionProfileOut | None:
    row = db.get(SimpleVisionProfile, user_id)
    if row is None:
        row = db.query(SimpleVisionProfile).order_by(SimpleVisionProfile.updated_at.desc()).first()
    if row is None:
        return None
    return _row_to_profile_out(row)


def _row_to_profile_out(row: SimpleVisionProfile) -> VisionProfileOut:
    pj = row.profile_json
    return VisionProfileOut(
        user_id=pj["user_id"],
        deficiency_type=pj["deficiency_type"],
        deficiency_name=pj.get("deficiency_name"),
        clinical_diagnosis=pj.get("clinical_diagnosis"),
        severity=pj["severity"],
        percent_accuracy=pj.get("percent_accuracy"),
        color_confusion_status=pj.get("color_confusion_status"),
        perception_scores=pj["perception_scores"],
        recommended_transformations=pj.get("recommended_transformations", []),
        meaning_based_transformations=pj.get("meaning_based_transformations", []),
        risk_areas=pj.get("risk_areas", []),
        personal_impact=pj.get("personal_impact"),
        ai_explanation=pj.get("ai_explanation"),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )
