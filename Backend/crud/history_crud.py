# Backend/crud/history.py

from sqlalchemy.orm import Session
from database.models import history_model
from schemas import history_schema
from database.models.user_model import User


def create_conversion_history(
    db: Session, history: history_schema.ConversionHistoryCreate, user: User,
):
    """사용자의 OCR 변환 기록을 데이터베이스에 저장합니다."""
    db_history = history_model.ConversionHistory(
        **history.dict(), user_id=user.id)
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history


def get_conversion_histories_by_user(db: Session, user: User, skip: int = 0, limit: int = 100):
    """특정 사용자의 변환 기록 목록을 조회합니다."""
    return db.query(history_model.ConversionHistory).filter(history_model.ConversionHistory.user_id == user.id).order_by(history_model.ConversionHistory.created_at.desc()).offset(skip).limit(limit).all()
