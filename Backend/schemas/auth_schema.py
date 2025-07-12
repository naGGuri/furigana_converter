# Backend/schemas/auth.py

from pydantic import BaseModel
from typing import Optional


class User(BaseModel):
    """
    사용자 정보를 위한 Pydantic 모델 (응답용).
    데이터베이스에서 조회된 사용자 정보를 클라이언트에 반환할 때 사용됩니다.
    """
    id: int
    name: str
    email: str

    class Config:
        """
        ORM 모드 설정을 위한 내부 클래스.
        이 설정을 통해 SQLAlchemy 모델 인스턴스를 Pydantic 모델로 변환할 수 있습니다.
        """
        from_attributes = True


class UserCreate(BaseModel):
    """
    새로운 사용자 생성을 위한 Pydantic 모델 (요청용).
    클라이언트로부터 회원가입 요청을 받을 때 사용됩니다.
    """
    name: str
    email: str
    password: str


class Token(BaseModel):
    """
    인증 토큰 응답을 위한 Pydantic 모델.
    로그인 성공 시 클라이언트에 반환될 액세스 토큰과 토큰 타입을 정의합니다.
    """
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    토큰 페이로드 데이터를 위한 Pydantic 모델.
    JWT 토큰에서 추출된 사용자 이름(email)을 저장합니다.
    """
    username: Optional[str] = None
