# Backend/utils/auth_utils.py

# 이 파일은 인증 및 권한 부여와 관련된 유틸리티 함수들을 제공합니다.
# 비밀번호 해싱, JWT 토큰 생성 및 검증 등의 기능을 포함합니다.

from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from database.database import get_db
from sqlalchemy.orm import Session
from crud import user_crud
from schemas.auth_schema import TokenData


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# 비밀번호 해싱을 위한 CryptContext 설정
# bcrypt 스키마를 사용하여 비밀번호를 안전하게 해싱하고 검증합니다.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    평문 비밀번호와 해시된 비밀번호를 비교하여 일치하는지 확인합니다.

    Args:
        plain_password (str): 사용자가 입력한 평문 비밀번호.
        hashed_password (str): 데이터베이스에 저장된 해시된 비밀번호.

    Returns:
        bool: 비밀번호가 일치하면 True, 그렇지 않으면 False.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    주어진 평문 비밀번호를 해싱합니다.

    Args:
        password (str): 해싱할 평문 비밀번호.

    Returns:
        str: 해시된 비밀번호 문자열.
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    JWT 액세스 토큰을 생성합니다.

    Args:
        data (dict): 토큰에 포함될 페이로드 데이터 (예: {"sub": user.email}).
        expires_delta (Optional[timedelta]): 토큰의 만료 시간. 지정되지 않으면 기본값(15분)이 사용됩니다.

    Returns:
        str: 인코딩된 JWT 액세스 토큰 문자열.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    """
    JWT 액세스 토큰을 디코딩하고 페이로드를 반환합니다.

    Args:
        token (str): 디코딩할 JWT 토큰.

    Returns:
        dict: 토큰의 페이로드 (예: {"sub": user.email, "exp": ...}).

    Raises:
        JWTError: 토큰이 유효하지 않거나 만료된 경우.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(f"[DEBUG] Token received: {token}")
        payload = decode_access_token(token)
        print(f"[DEBUG] Decoded payload: {payload}")
        username: str = payload.get("sub")
        if username is None:
            print("[DEBUG] Username is None in payload")
            raise credentials_exception
        token_data = TokenData(username=username)
        print(f"[DEBUG] TokenData: {token_data.username}")
    except JWTError as e:
        print(f"[DEBUG] JWTError: {e}")
        raise credentials_exception
    user = user_crud.get_user_by_email(db, email=token_data.username)
    if user is None:
        print("[DEBUG] User not found in DB")
        raise credentials_exception
    print(f"[DEBUG] User found: {user.email}")
    return user
