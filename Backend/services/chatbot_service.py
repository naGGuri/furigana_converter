# Backend/services/chatbot_service.py

import google.generativeai as genai
import asyncio
from typing import AsyncGenerator


async def stream_gemini_response(message: str) -> AsyncGenerator[str, None]:
    """
    Gemini API로부터 응답을 스트리밍하는 비동기 제너레이터 함수.
    이 함수는 Gemini 모델과의 대화를 관리하고, 응답을 청크(chunk) 단위로 클라이언트에 스트리밍합니다.

    Args:
        message (str): 사용자로부터 받은 채팅 메시지.

    Yields:
        str: 'data: ' 접두사가 붙은 Server-Sent Events (SSE) 형식의 응답 청크.
             각 청크는 Gemini 모델의 응답 텍스트 일부를 포함합니다.
    """
    try:
        # 시스템 프롬프트 설정 (챗봇의 역할과 페르소나를 정의합니다.)
        system_prompt = (
            "You are a friendly and helpful Japanese tutor. "
            "Your name is '가나'. "
            "You are an expert in Japanese language and culture. "
            "Your goal is to help users improve their Japanese skills through conversation. "
            "Please respond in Korean."
        )

        # Gemini 모델 인스턴스 생성 (main.py에서 genai.configure가 호출되었음을 가정)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Gemini 모델과의 대화 시작
        chat = model.start_chat(history=[])
        full_message = f"{system_prompt}\n\nUser: {message}"

        # Gemini 모델에 메시지를 전송하고 스트리밍 응답을 받습니다.
        response = await asyncio.to_thread(chat.send_message, full_message, stream=True)

        # 스트리밍 응답의 각 청크를 순회합니다.
        for chunk in response:
            # 청크에 텍스트 내용이 있다면
            if chunk.text:
                # SSE 형식으로 데이터를 yield합니다.
                yield f"data: {chunk.text}\n\n"
                # 클라이언트가 데이터를 처리할 시간을 주기 위해 잠시 대기합니다.
                await asyncio.sleep(0.1)

    except Exception as e:
        # 스트리밍 중 오류가 발생하면 콘솔에 오류를 출력하고 클라이언트에 오류 메시지를 전송합니다.
        print(f"Error during streaming: {e}")
        yield f"data: An error occurred.\n\n"