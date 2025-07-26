from pydantic import BaseModel, field_validator
from typing import List, Any, Optional
from datetime import datetime


class ConversionHistoryBase(BaseModel):
    conversion_type: str
    file_names: List[str]


class ConversionHistoryCreate(ConversionHistoryBase):
    result_data: Any


class ConversionHistory(ConversionHistoryBase):
    id: int
    user_id: int
    created_at: datetime
    furigana_result: Optional[List[str]] = None
    voca_result: Optional[List[Any]] = None

    

    class Config:
        from_attributes = True

