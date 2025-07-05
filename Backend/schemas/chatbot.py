# Backend/schemas/chatbot.py

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """
    챗봇 요청을 위한 Pydantic 모델.
    사용자로부터 받은 메시지를 포함합니다.
    """
    message: str
