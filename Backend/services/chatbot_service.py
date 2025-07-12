# Backend/services/chatbot_service.py

import google.generativeai as genai
import asyncio
from typing import AsyncGenerator, List, Dict, Any
from services import rag_service  # rag_service 임포트


async def stream_gemini_response(message: str, history: List[Dict[str, Any]], user_id: str) -> AsyncGenerator[str, None]:
    """
    Gemini API로부터 응답을 스트리밍하는 비동기 제너레이터 함수.
    이 함수는 Gemini 모델과의 대화를 관리하고, 응답을 청크(chunk) 단위로 클라이언트에 스트리밍합니다.
    이전 대화 기록을 기반으로 연속적인 대화를 지원합니다.

    Args:
        message (str): 사용자로부터 받은 현재 채팅 메시지.
        history (List[Dict[str, Any]]): 이전 대화 기록. 각 요소는 {'role': 'user'/'model', 'parts': '메시지'} 형태.

    Yields:
        str: 'data: ' 접두사가 붙은 Server-Sent Events (SSE) 형식의 응답 청크.
             각 청크는 Gemini 모델의 응답 텍스트 일부를 포함합니다.
    """
    try:
        # 시스템 프롬프트 설정 (JLPT 전문 튜터로서의 역할과 페르소나를 정의합니다.)
        system_prompt = (
            "You are '가나', a friendly and highly knowledgeable Japanese tutor specializing in JLPT (Japanese Language Proficiency Test). "
            "Your goal is to help users improve their Japanese skills, especially for JLPT preparation, through interactive conversation. "
            "You should provide clear, concise, and accurate explanations. "
            "When asked for examples or practice, generate content relevant to JLPT levels (N5 to N1). "
            "Avoid lengthy self-introductions or conversational filler. Focus on providing direct and helpful answers. "
            "Respond primarily in Korean, but use Japanese when providing examples, vocabulary, or grammar explanations. "
            "Maintain context from previous turns in the conversation."
        )

        # Gemini 모델 인스턴스 생성 (main.py에서 genai.configure가 호출되었음을 가정)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Gemini 모델과의 대화 시작. 이전 대화 기록을 사용하여 연속성을 유지합니다.
        # 시스템 프롬프트를 history의 첫 부분에 추가하여 모델이 항상 역할을 인지하도록 합니다.
        # Gemini API의 history는 role과 parts로 구성된 딕셔너리 리스트를 기대합니다.
        # 시스템 프롬프트는 'user' 역할로 시작하고, 모델이 이에 대해 응답하는 형태로 구성합니다.

        # 시스템 프롬프트를 대화 기록의 시작 부분에 추가
        # 모델이 시스템 프롬프트를 'user' 메시지로 인식하고, 이에 대한 'model' 응답이 없으므로
        # 실제 대화 시작 전에 시스템 프롬프트에 대한 모델의 '응답'을 비워두는 것이 일반적입니다.
        # 하지만 여기서는 시스템 프롬프트 자체를 모델의 행동 지침으로 사용하므로,
        # history에 직접 추가하기보다는 모델의 초기 설정에 가깝게 사용합니다.
        # 실제 대화 기록은 사용자 메시지부터 시작합니다.

        # Gemini API의 history는 'user'와 'model'의 턴이 번갈아 나타나야 합니다.
        # 따라서, history를 구성할 때 이 규칙을 따라야 합니다.
        # 현재 history는 클라이언트에서 넘어오는 그대로 사용합니다.

        # 시스템 프롬프트를 모델의 초기 설정으로 사용하고, 실제 대화는 history 인자로 전달합니다.
        # Gemini API는 start_chat의 history에 시스템 프롬프트를 직접 넣는 것을 권장하지 않습니다.
        # 대신, 모델의 행동을 지시하는 방식으로 사용합니다.

        # history를 Gemini API 형식에 맞게 변환 (role과 parts)
        # 클라이언트에서 넘어오는 history가 이미 Gemini API 형식이라고 가정합니다.

        chat = model.start_chat(history=history)

        # RAG: 사용자 질문과 관련된 OCR 문서 검색
        retrieved_docs = rag_service.retrieve_documents(message, user_id)
        context = "".join(retrieved_docs)

        # 검색된 문맥을 포함하여 Gemini 모델에 전달할 전체 메시지 구성
        if context:
            full_message_with_system_prompt = f"{system_prompt}Context from OCR documents:{context}User: {message}"
        else:
            full_message_with_system_prompt = f"{system_prompt}User: {message}"

        # Gemini 모델에 메시지를 전송하고 스트리밍 응답을 받습니다.
        response = await asyncio.to_thread(chat.send_message, full_message_with_system_prompt, stream=True)

        # 스트리밍 응답의 각 청크를 순회합니다.
        for chunk in response:
            # 청크에 텍스트 내용이 있다면
            if chunk.text:
                # SSE 형식으로 데이터를 yield합니다.
                # print(f"[DEBUG] Gemini chunk: {chunk.text}")
                yield chunk.text
                # 클라이언트가 데이터를 처리할 시간을 주기 위해 잠시 대기합니다.
                await asyncio.sleep(0.05)  # 응답 속도 개선을 위해 sleep 시간 단축

    except Exception as e:
        # 스트리밍 중 오류가 발생하면 콘솔에 오류를 출력하고 클라이언트에 오류 메시지를 전송합니다.
        print(f"Error during streaming: {e}")
        yield f"data: An error occurred."
