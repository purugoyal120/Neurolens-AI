from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import datetime

from app.db.session import get_db
from app.models.scan_history import ScanHistory

router = APIRouter(prefix="/history", tags=["history"])

class ScanItemIn(BaseModel):
    module_type: str
    result_text: str
    confidence_score: Optional[float] = None
    color_hex: Optional[str] = None
    user_id: str = "guest"

class SyncHistoryIn(BaseModel):
    scans: List[ScanItemIn]

@router.post("/sync")
def sync_history(payload: SyncHistoryIn, db: Session = Depends(get_db)):
    """
    Receives an array of scans from the mobile app and bulk inserts them.
    This fulfills the synchronization requirement.
    """
    inserted = 0
    for scan in payload.scans:
        new_scan = ScanHistory(
            user_id=scan.user_id,
            module_type=scan.module_type,
            result_text=scan.result_text,
            confidence_score=scan.confidence_score,
            color_hex=scan.color_hex,
            created_at=datetime.datetime.utcnow()
        )
        db.add(new_scan)
        inserted += 1
    
    db.commit()
    return {"status": "success", "synced_count": inserted}

@router.get("/{user_id}")
def get_history(user_id: str, limit: int = 20, db: Session = Depends(get_db)):
    """
    Returns recent history for a user, to be displayed in the ReportsScreen.
    """
    scans = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).order_by(ScanHistory.created_at.desc()).limit(limit).all()
    
    result = []
    for s in scans:
        result.append({
            "id": s.id,
            "module_type": s.module_type,
            "result_text": s.result_text,
            "confidence_score": s.confidence_score,
            "color_hex": s.color_hex,
            "created_at": s.created_at.isoformat()
        })
    return {"history": result}
