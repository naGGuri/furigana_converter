from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.database import Base


class ConversionHistory(Base):
    __tablename__ = "conversion_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # 변환 타입: 'furigana' 또는 'vocabulary'
    conversion_type = Column(String, index=True, nullable=False)
    # 원본 파일 이름 목록
    file_names = Column(JSONB)
    # 변환 결과 데이터 (후리가나 텍스트 리스트 또는 단어장 리스트)
    result_data = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")
