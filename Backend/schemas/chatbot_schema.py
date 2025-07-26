# Backend/schemas/chatbot.py

from pydantic import BaseModel
from typing import List, Dict, Any

class ChatRequest(BaseModel):
    """
    챗봇 요청을 위한 Pydantic 모델.
    사용자로부터 받은 메시지와 이전 대화 기록을 포함합니다.
    """
    message: str
    history: List[Dict[str, Any]] = []


class ChatResponse(BaseModel):
    """
    챗봇 응답을 위한 Pydantic 모델.
    챗봇이 생성한 응답 메시지를 포함합니다.
    """
    response: str
