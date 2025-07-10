from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from schemas import history_schema
from crud import history_crud
from .auth_router import get_current_user
from schemas.auth_schema import User

router = APIRouter()


@router.get(
    "/history/recent",
    response_model=List[history_schema.ConversionHistory],
    summary="Get Recent Conversion History",
)
def get_recent_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    로그인한 사용자의 최근 변환 기록을 최대 5개까지 조회합니다.
    """
    return history_crud.get_conversion_histories_by_user(db=db, user=current_user, limit=5)
