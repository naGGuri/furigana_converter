# src/routes/ocr.py

from typing import List
from fastapi import APIRouter, UploadFile, File
from googletrans import Translator
from services.ocr_service import extract_kanji_words, insert_furigana_text

router = APIRouter()
translator = Translator()


@router.post("/api/ocr/voca")
async def extract_vocabulary(images: List[UploadFile] = File(...)):
    """OCR + 단어장 추출 + 중복 제거 + 영어 번역"""
    results = []

    for image in images:
        bytes_data = await image.read()
        words = extract_kanji_words(bytes_data)

        # ✅ 중복 제거: word 기준
        unique_words = {}
        for w in words:
            if w["word"] not in unique_words:
                unique_words[w["word"]] = w["reading"]

        # ✅ 영어 번역 추가 (googletrans는 동기 → await 쓰면 안됨)
        enriched_words = []
        for word, reading in unique_words.items():
            try:
                translation_result = translator.translate(
                    word, src="ja", dest="en")
                # print(f"🔤 Translating: {word} → {translation_result.text}")
                translated = translation_result.text
            except Exception as e:
                print(f"❌ Translation failed for {word}: {e}")
                translated = ""
            enriched_words.append({
                "word": word,
                "reading": reading,
                "translation": translated
            })

        results.append(enriched_words)

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
