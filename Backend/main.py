# Backend/main.py

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 새로운 계층 구조에 맞춰 모듈들을 임포트합니다.
from database.database import SessionLocal, engine, Base  # Base 임포트 추가

# API 엔드포인트 라우터들을 임포트합니다.
from api.endpoints import ocr, chatbot, auth # auth 라우터 추가

# Prometheus 메트릭 수집을 위한 Instrumentator 임포트
from prometheus_fastapi_instrumentator import Instrumentator

# Google Generative AI (Gemini) 관련 라이브러리 임포트
import google.generativeai as genai

# 설정 파일에서 필요한 값들을 임포트합니다.
from config.settings import GEMINI_API_KEY

# Gemini API 키 설정
# 환경 변수에서 GEMINI_API_KEY를 가져옵니다. 키가 없으면 오류를 발생시킵니다.
genai.configure(api_key=GEMINI_API_KEY)

# 데이터베이스 테이블 생성
# 정의된 모든 SQLAlchemy 모델(Base)에 따라 데이터베이스 테이블을 생성합니다.
# 이미 테이블이 존재하면 이 작업은 무시됩니다.
Base.metadata.create_all(bind=engine)

# FastAPI 애플리케이션 인스턴스 생성
app = FastAPI()

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




# ✅ 라우터 등록
# 각 기능별 라우터(OCR, 챗봇, 인증)를 메인 FastAPI 애플리케이션에 포함시킵니다.
# 이렇게 하면 해당 라우터에 정의된 모든 엔드포인트가 애플리케이션에 등록됩니다.
app.include_router(ocr.router)
app.include_router(chatbot.router)
app.include_router(auth.router) # auth 라우터 포함

# ✅ Prometheus 메트릭 등록
# 애플리케이션의 성능 메트릭을 Prometheus 형식으로 노출하도록 설정합니다.
# /metrics 엔드포인트를 통해 메트릭을 확인할 수 있습니다.
Instrumentator().instrument(app).expose(app)