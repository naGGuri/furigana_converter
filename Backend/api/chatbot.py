# api/chatbot.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
import asyncio

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# Gemini 모델 설정
model = genai.GenerativeModel('gemini-1.5-flash')


class ChatRequest(BaseModel):
    message: str


async def stream_generator(message: str):
    """Gemini API로부터 응답을 스트리밍하는 제너레이터 함수"""
    try:
        # 시스템 프롬프트 설정 (역할 부여)
        system_prompt = (
            "You are a friendly and helpful Japanese tutor. "
            "Your name is '가나'. "
            "You are an expert in Japanese language and culture. "
            "Your goal is to help users improve their Japanese skills through conversation. "
            "Please respond in Korean."
        )

        # 대화 시작
        chat = model.start_chat(history=[])
        full_message = f"{system_prompt}\n\nUser: {message}"

        response = await asyncio.to_thread(chat.send_message, full_message, stream=True)

        for chunk in response:
            if chunk.text:
                yield f"data: {chunk.text}\n\n"
                await asyncio.sleep(0.1)  # 클라이언트가 데이터를 처리할 시간을 줍니다.

    except Exception as e:
        print(f"Error during streaming: {e}")
        yield f"data: An error occurred.\n\n"


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """Gemini Pro 모델과 스트리밍 방식으로 대화합니다."""
    return StreamingResponse(stream_generator(req.message), media_type="text/event-stream")
