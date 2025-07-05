# Backend/database/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config.settings import SQLALCHEMY_DATABASE_URL

# SQLAlchemy 엔진 생성
# connect_args={"check_same_thread": False}는 SQLite가 단일 스레드에서만 작동하도록 강제하는 것을 비활성화하여
# 여러 스레드에서 동시에 데이터베이스에 접근할 수 있도록 합니다.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

# 데이터베이스 세션 클래스 생성
# SessionLocal 인스턴스는 데이터베이스 세션입니다.
# autocommit=False: 트랜잭션이 자동으로 커밋되지 않도록 설정합니다.
# autoflush=False: 세션에 추가된 객체가 자동으로 데이터베이스에 플러시되지 않도록 설정합니다.
# bind=engine: 생성된 엔진에 세션을 바인딩합니다.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모든 SQLAlchemy 모델의 기본 클래스
# 이 Base 클래스를 상속받아 데이터베이스 테이블과 매핑되는 클래스를 정의합니다.
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()