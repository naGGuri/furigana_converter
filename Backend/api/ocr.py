# src/routes/ocr.py 또는 기존 라우터 파일

from typing import List
from fastapi import APIRouter, UploadFile, File
from services.ocr_service import extract_kanji_words, insert_furigana_text

router = APIRouter()


@router.post("/api/ocr/voca")
async def get_kanji_words(images: List[UploadFile] = File(...)):
    """이미지에서 한자 단어 리스트 추출"""
    results = []

    for file in images:
        image_bytes = await file.read()
        kanji_words = extract_kanji_words(image_bytes)
        results.append(kanji_words)

    return {"kanji_words_list": results}


@router.post("/api/ocr/furigana")
async def get_furigana_text(images: List[UploadFile] = File(...)):
    """이미지를 문장 형태로 변환하고 후리가나 삽입"""
    results = []

    for file in images:
        image_bytes = await file.read()
        furigana_text = insert_furigana_text(image_bytes)
        results.append(furigana_text)

    return {"furigana_texts": results}
