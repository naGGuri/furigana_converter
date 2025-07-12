from pydantic import BaseModel
from typing import List, Any
from datetime import datetime


class ConversionHistoryBase(BaseModel):
    conversion_type: str
    file_names: List[str]
    # 결과 데이터는 리스트[문자열] 또는 리스트[리스트[객체]]가 될 수 있어 Any 사용
    result_data: Any


class ConversionHistoryCreate(ConversionHistoryBase):
    pass


class ConversionHistory(ConversionHistoryBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
