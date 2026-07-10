from sqlalchemy import Column, String, Integer, Float, DateTime
import datetime
import uuid

from app.db.session import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, default="guest")
    module_type = Column(String, index=True) # e.g., "clothes", "traffic"
    result_text = Column(String) # e.g., "Navy Blue Shirt"
    confidence_score = Column(Float, nullable=True) # e.g., 0.92
    color_hex = Column(String, nullable=True) # e.g., "#000080"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
