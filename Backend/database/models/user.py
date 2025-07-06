# Backend/database/models/user.py

from sqlalchemy import Column, Integer, String

# database.py에서 정의된 Base를 임포트합니다.
# 이 Base는 SQLAlchemy 모델들이 데이터베이스 테이블과 매핑될 수 있도록 하는 기본 클래스입니다.
from database.database import Base


class User(Base):
    """
    사용자 데이터베이스 모델
    'users' 테이블에 매핑됩니다.
    """
    __tablename__ = "users"

    # 사용자 ID: 기본 키, 자동 증가, 인덱스 설정
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    # 해시된 비밀번호: 보안을 위해 비밀번호는 해시되어 저장됩니다.
    hashed_password = Column(String)

    def __repr__(self):
        """
        객체를 문자열로 표현할 때 사용됩니다. 디버깅에 유용합니다.
        """
        return f"<User(id={self.id}, email='{self.email}')>"
