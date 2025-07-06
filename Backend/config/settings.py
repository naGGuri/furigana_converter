# Backend/config/settings.py

import os
from dotenv import load_dotenv

# .env 파일로부터 환경 변수 로드
load_dotenv()

# JWT 토큰 서명에 사용될 비밀 키
# 환경 변수에서 SECRET_KEY를 가져오거나 기본값을 사용합니다.
# TODO: 실제 배포 시 강력한 키로 변경
SECRET_KEY = os.getenv("SECRET_KEY")

# JWT 토큰 서명에 사용될 알고리즘
ALGORITHM = "HS256"

# 액세스 토큰 만료 시간 (분)
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Gemini API 키 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY 환경 변수를 설정해주세요.")

# 데이터베이스 URL
# Docker Compose에서 설정된 DATABASE_URL 환경 변수를 사용합니다.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL 환경 변수를 설정해주세요.")
