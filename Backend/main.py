# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import ocr  # OCR 관련 API 라우터 import
from prometheus_fastapi_instrumentator import Instrumentator  # 프로메테우스 메트릭 수집기

# FastAPI 인스턴스 생성
app = FastAPI()

# ✅ CORS 설정
# 프론트엔드(예: React, 모바일 앱 등)에서 이 서버에 요청할 수 있도록 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # 모든 도메인에서 요청 허용 (운영 환경에서는 제한 필요)
    allow_credentials=True,         # 인증 정보 포함 요청 허용 (쿠키 등)
    allow_methods=["*"],            # 모든 HTTP 메서드 허용 (GET, POST 등)
    allow_headers=["*"],            # 모든 헤더 허용 (Authorization 등)
)

# ✅ OCR 라우터 등록
# /api/ocr 경로 이하의 요청들을 ocr.py 라우터로 위임
app.include_router(ocr.router)

# ✅ Prometheus 메트릭 등록
Instrumentator().instrument(app).expose(app)
