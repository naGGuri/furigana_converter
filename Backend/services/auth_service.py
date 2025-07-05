from datetime import timedelta
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from utils import auth_utils
from crud import user as crud_user # crud.user 모듈을 crud_user로 임포트
from schemas.auth import UserCreate, Token # schemas.auth에서 스키마 임포트
from config.settings import ACCESS_TOKEN_EXPIRE_MINUTES


def signup_user(db: Session, user: UserCreate):
    """
    새로운 사용자를 등록하는 비즈니스 로직.
    이메일 중복을 확인하고, 비밀번호를 해싱하여 데이터베이스에 저장합니다.

    Args:
        db (Session): 데이터베이스 세션.
        user (UserCreate): 사용자 이메일과 비밀번호를 포함하는 Pydantic 스키마.

    Raises:
        HTTPException: 이메일이 이미 등록된 경우 400 Bad Request.

    Returns:
        models.User: 생성된 사용자 객체.
    """
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)


def login_user(db: Session, form_data: OAuth2PasswordRequestForm) -> Token:
    """
    사용자 로그인을 처리하고 JWT 액세스 토큰을 발급하는 비즈니스 로직.
    사용자 이름(이메일)과 비밀번호를 검증하고, 유효한 경우 토큰을 생성합니다.

    Args:
        db (Session): 데이터베이스 세션.
        form_data (OAuth2PasswordRequestForm): 사용자 이름(이메일)과 비밀번호를 포함하는 폼 데이터.

    Raises:
        HTTPException: 이메일 또는 비밀번호가 잘못된 경우 401 Unauthorized.

    Returns:
        Token: 발급된 액세스 토큰과 토큰 타입.
    """
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}