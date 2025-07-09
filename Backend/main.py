# Backend/main.py

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import SessionLocal, engine, Base
from api.endpoints import ocr, chatbot, auth
from prometheus_fastapi_instrumentator import Instrumentator
import google.generativeai as genai
from config.settings import GEMINI_API_KEY


# 데이터베이스 테이블 생성
# 정의된 모든 SQLAlchemy 모델(Base)에 따라 데이터베이스 테이블을 생성합니다.
# 이미 테이블이 존재하면 이 작업은 무시됩니다.
Base.metadata.create_all(bind=engine)

# FastAPI 애플리케이션 인스턴스 생성
app = FastAPI(
    title="Hurigana Converter API",
    description="API for converting Japanese text and images with OCR.",
    version="1.0.0",
)

# ✅ CORS (Cross-Origin Resource Sharing) 설정
# 다른 도메인에서의 요청을 허용하기 위한 설정입니다.
# allow_origins=["*"]: 모든 오리진에서의 요청을 허용합니다. (개발 환경에서 유용, 프로덕션에서는 특정 도메인으로 제한 권장)
# allow_credentials=True: 쿠키, HTTP 인증 헤더 등을 포함한 요청을 허용합니다.
# allow_methods=["*"]: 모든 HTTP 메서드 (GET, POST, PUT, DELETE 등)를 허용합니다.
# allow_headers=["*"]: 모든 HTTP 헤더를 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocr.router, prefix="/api", tags=["OCR"])
app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
