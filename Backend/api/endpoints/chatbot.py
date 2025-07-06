# Backend/api/endpoints/chatbot.py

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

# 챗봇 비즈니스 로직을 담당하는 서비스 모듈을 임포트합니다.
from services import chatbot_service
from schemas.chatbot import ChatRequest  # schemas.chatbot에서 ChatRequest 임포트

router = APIRouter()


@router.post("/chatbot/stream")
async def chat_stream(req: ChatRequest):
    """
    Gemini 모델과 스트리밍 방식으로 대화하는 API 엔드포인트.
    클라이언트로부터 메시지를 받아 챗봇 서비스로 전달하고, 모델의 응답을 스트리밍 방식으로 반환합니다.

    Args:
        req (ChatRequest): 사용자 메시지를 포함하는 요청 본문.

    Returns:
        StreamingResponse: Gemini 모델의 응답을 스트리밍하는 HTTP 응답.
                           'text/event-stream' 미디어 타입을 사용하여 Server-Sent Events (SSE)를 지원합니다.
    """
    # 챗봇 서비스의 스트리밍 함수를 호출하여 응답을 스트리밍합니다.
    return StreamingResponse(chatbot_service.stream_gemini_response(req.message), media_type="text/event-stream")
