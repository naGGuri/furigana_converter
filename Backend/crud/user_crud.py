# Backend/crud/user.py

from sqlalchemy.orm import Session
from database.models.user_model import User
from schemas.auth_schema import UserCreate
from utils import auth_utils


def get_user_by_email(db: Session, email: str):
    """
    이메일을 사용하여 데이터베이스에서 사용자를 조회합니다.

    Args:
        db (Session): SQLAlchemy 데이터베이스 세션.
        email (str): 조회할 사용자의 이메일 주소.

    Returns:
        User: 이메일에 해당하는 사용자 객체 또는 None.
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate):
    """
    새로운 사용자를 데이터베이스에 생성합니다.
    비밀번호는 저장하기 전에 해싱됩니다.

    Args:
        db (Session): SQLAlchemy 데이터베이스 세션.
        user (UserCreate): 생성할 사용자 정보를 담은 Pydantic 스키마.

    Returns:
        User: 생성된 사용자 객체.
    """
    # 비밀번호를 해싱합니다.
    hashed_password = auth_utils.get_password_hash(user.password)
    # 새로운 User 모델 인스턴스를 생성합니다.
    db_user = User(email=user.email,
                   hashed_password=hashed_password, name=user.name)
    # 데이터베이스 세션에 사용자 객체를 추가합니다.
    db.add(db_user)
    # 변경사항을 데이터베이스에 커밋합니다.
    db.commit()
    # 데이터베이스에서 새로 생성된 사용자 객체를 새로고침하여 ID와 같은 자동 생성된 필드를 가져옵니다.
    db.refresh(db_user)
    return db_user
