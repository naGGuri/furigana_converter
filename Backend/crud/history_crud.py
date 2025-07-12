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


def get_conversion_histories_by_user(db: Session, user: User, skip: int = 0, limit: int = None):
    """특정 사용자의 변환 기록 목록을 조회합니다."""
    results = db.query(history_model.ConversionHistory).filter(history_model.ConversionHistory.user_id == user.id).offset(skip).limit(limit)
    histories = results.all()
    
    # 여기서 데이터를 매핑합니다.
    formatted_histories = []
    for h in histories:
        history_dict = h.__dict__
        if history_dict['conversion_type'] == 'furigana':
            history_dict['furigana_result'] = history_dict['result_data']
            history_dict['voca_result'] = None
        elif history_dict['conversion_type'] == 'vocabulary':
            history_dict['voca_result'] = history_dict['result_data']
            history_dict['furigana_result'] = None
        formatted_histories.append(history_schema.ConversionHistory.model_validate(history_dict)) # Pydantic v2에서는 .from_orm 대신 .model_validate 사용
    return formatted_histories


def get_conversion_history(db: Session, history_id: int, user: User):
    """특정 변환 기록을 조회합니다."""
    history = db.query(history_model.ConversionHistory).filter(history_model.ConversionHistory.id == history_id, history_model.ConversionHistory.user_id == user.id).first()
    if history:
        print(f"DEBUG: Raw history object from DB: {history.__dict__}")
        # 여기서 데이터를 매핑합니다.
        history_dict = history.__dict__
        if history_dict['conversion_type'] == 'furigana':
            history_dict['furigana_result'] = history_dict['result_data']
            history_dict['voca_result'] = None
        elif history_dict['conversion_type'] == 'vocabulary':
            history_dict['voca_result'] = history_dict['result_data']
            history_dict['furigana_result'] = None
        return history_schema.ConversionHistory.model_validate(history_dict) # Pydantic v2에서는 .from_orm 대신 .model_validate 사용
    return None
