# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import ocr, chatbot  # OCR 및 챗봇 라우터 import
from prometheus_fastapi_instrumentator import Instrumentator
import google.generativeai as genai
from dotenv import load_dotenv

# .env 파일로부터 환경 변수 로드
load_dotenv()

# Gemini API 키 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY 환경 변수를 설정해주세요.")
genai.configure(api_key=GEMINI_API_KEY)

# FastAPI 인스턴스 생성
app = FastAPI()

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 라우터 등록
app.include_router(ocr.router)
app.include_router(chatbot.router)

# ✅ Prometheus 메트릭 등록
Instrumentator().instrument(app).expose(app)
