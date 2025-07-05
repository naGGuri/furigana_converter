from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from database.database import get_db # get_db 임포트 추가
from schemas.auth import User, UserCreate, Token # schemas.auth에서 스키마 임포트
from services import auth_service
from crud import user as crud_user
from utils import auth_utils

# ✅ FastAPI 라우터 생성
# 이 라우터는 인증 관련 API 엔드포인트를 정의하고 관리합니다.
router = APIRouter()

# OAuth2PasswordBearer를 사용하여 토큰을 가져옵니다.
# tokenUrl은 클라이언트가 토큰을 얻을 수 있는 URL을 지정합니다.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_utils.decode_access_token(token)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud_user.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


@router.post("/auth/signup", response_model=User)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """
    새로운 사용자를 등록하는 API 엔드포인트.
    인증 서비스의 `signup_user` 함수를 호출하여 비즈니스 로직을 처리합니다.

    Args:
        user (UserCreate): 사용자 이메일과 비밀번호를 포함하는 요청 본문.
        db (Session): 데이터베이스 세션 (의존성 주입).

    Returns:
        User: 생성된 사용자 정보 (ID, 이메일).
    """
    return auth_service.signup_user(db=db, user=user)


@router.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    사용자 로그인을 처리하고 JWT 액세스 토큰을 발급하는 API 엔드포인트.
    인증 서비스의 `login_user` 함수를 호출하여 비즈니스 로직을 처리합니다.

    Args:
        form_data (OAuth2PasswordRequestForm): 사용자 이름(이메일)과 비밀번호를 포함하는 폼 데이터.
        db (Session): 데이터베이스 세션 (의존성 주입).

    Returns:
        Token: 발급된 액세스 토큰과 토큰 타입.
    """
    return auth_service.login_user(db=db, form_data=form_data)


@router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    현재 로그인한 사용자 정보를 조회하는 API 엔드포인트.
    유효한 JWT 토큰을 통해 인증된 사용자만 접근할 수 있습니다.

    Args:
        current_user (User): 현재 인증된 사용자 객체 (get_current_user 의존성 주입).

    Returns:
        User: 현재 로그인한 사용자 정보.
    """
    return current_user