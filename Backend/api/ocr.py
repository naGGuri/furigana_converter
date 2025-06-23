# api/ocr.py

from typing import List
from fastapi import APIRouter, UploadFile, File

from services.ocr_service import (
    make_furigana,
    make_vocabulary,
    add_translation,
)

from schemas import TranslatedVocabularyResult, FuriganaResult

# ✅ FastAPI 라우터 생성
router = APIRouter()


@router.post("/api/ocr/voca", response_model=TranslatedVocabularyResult)
async def extract_vocabulary(images: List[UploadFile] = File(...)):
    """
    📌 한자 단어 추출 + 중복 제거 + 영어 번역 API
    - 여러 이미지를 받아 각각에 대해 처리
    - make_vocabulary(): 한자 단어 + 후리가나 추출 및 중복 제거
    - add_translation(): 영어 번역 추가
    """
    results = []

    for image in images:
        # 1. 이미지 파일을 바이트로 읽기
        image_bytes = await image.read()

        # 2. 한자 + 히라가나 단어 목록 생성 (중복 제거 포함)
        words = make_vocabulary(image_bytes)

        # 3. 번역 추가된 단어 리스트 생성
        enriched_words = add_translation(words)

        # 4. 결과 리스트에 추가
        results.append(enriched_words)

    return {"kanji_words_list": results}


@router.post("/api/ocr/furigana", response_model=FuriganaResult)
async def get_furigana_text(images: List[UploadFile] = File(...)):
    """
    📌 후리가나 문장 생성 API
    - 각 이미지에 대해 후리가나가 포함된 텍스트 생성
    - 예: 日本語 → 日本語(にほんご)
    """
    results = []

    for image in images:
        image_bytes = await image.read()
        furigana_text = make_furigana(image_bytes)
        results.append(furigana_text)

    return {"furigana_texts": results}
