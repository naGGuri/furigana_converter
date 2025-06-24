from easyocr import Reader            # OCR 처리를 위한 EasyOCR
from fugashi import Tagger           # 일본어 형태소 분석기
from pykakasi import kakasi          # 한자 → 히라가나 변환기
from PIL import Image                # 이미지 처리용
import numpy as np
import torch
import re
from io import BytesIO
from typing import Dict, List
from googletrans import Translator   # 영어 번역기

from schemas import OCRWord                    # 📌 공통 응답 스키마

# ✅ OCR 및 텍스트 변환기 초기화
USE_GPU = torch.cuda.is_available()
print(f"✅ GPU 사용 여부: {USE_GPU}")

reader = Reader(['ja'], gpu=USE_GPU)  # 일본어 OCR,
tagger = Tagger()                   # 형태소 분석기
translator = Translator()           # 구글 번역기

# 변환기 설정 (모두 히라가나로 변환)
kakasi_converter = kakasi()
kakasi_converter.setMode("J", "H")  # 한자 → 히라가나
kakasi_converter.setMode("K", "H")  # 가타카나 → 히라가나
kakasi_converter.setMode("H", "H")  # 히라가나 → 히라가나 (유지)
kakasi_converter.setMode("r", "Hepburn")  # 로마자 출력 방식
conv = kakasi_converter.getConverter()


def contains_kanji(text: str) -> bool:
    """📌 한자가 포함되어 있는지 확인하는 정규식 검사"""
    return bool(re.search(r'[\u4e00-\u9faf]', text))


def extract_japanese_from_image(image_bytes: bytes) -> str:
    """
    📌 이미지에서 텍스트 추출
    - OCR 수행 후 한자 포함 텍스트만 반환
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)
    ocr_results = reader.readtext(image_np, detail=0)  # 텍스트만 추출

    japanese_lines = [text for text in ocr_results if contains_kanji(text)]
    return ''.join(japanese_lines)


def make_vocabulary(image_bytes: bytes) -> List[OCRWord]:
    """
    📌 일본어 이미지에서 단어장 생성
    - OCR → 형태소 분석 → 히라가나 변환 → 중복 제거
    """
    text = extract_japanese_from_image(image_bytes)
    seen = set()
    result = []

    for word in tagger(text):
        surface = word.surface

        if surface not in seen and contains_kanji(surface):
            seen.add(surface)
            reading = conv.do(surface)
            result.append(OCRWord(word=surface, reading=reading))

    return result


def add_translation(vocabulary: List[OCRWord]) -> List[dict]:
    """
    📌 단어 목록에 영어 번역 추가
    - OCRWord 목록에 대해 번역된 dict 반환
    """
    new_vocabulary = []

    for w in vocabulary:
        try:
            result = translator.translate(w.word, src="ja", dest="en")
            translated = result.text if result and hasattr(
                result, "text") else ""
        except Exception as e:
            print(f"❌ Translation failed for {w.word}: {e}")
            translated = ""

        new_vocabulary.append({
            "word": w.word,
            "reading": w.reading,
            "translation": translated
        })

    return new_vocabulary


def make_furigana(image_bytes: bytes) -> str:
    """
    📌 문장 내 한자에 히라가나 삽입, 히라가나 만들기
    - 문장 단위로 줄바꿈 처리 포함
    - 예: 日本語 → 日本語(にほんご)
    """
    #  OCR 인식
    text = extract_japanese_from_image(image_bytes)
    #  정규화
    text = text.replace(";", "、").replace(",", "、").replace(".", "。")
    #  특수문자 제거
    text = re.sub(r"[^\u3040-\u30FF\u4E00-\u9FAF。、0-9a-zA-Z\s]", "", text)
    #  문장 단위 분할
    sentences = re.split(r'(?<=[。！？])', text)

    result = []
    for sentence in sentences:
        if sentence.strip() == "":
            continue

        sentence_result = []
        for word in tagger(sentence):
            surface = word.surface
            if surface.strip() == "":
                continue
            if re.search(r'[\u4e00-\u9faf]', surface):
                reading = conv.do(surface)
                sentence_result.append(f"{surface}({reading})")
            else:
                sentence_result.append(surface)

        result.append(''.join(sentence_result).strip())

    # 문장 단위 줄바꿈 반환
    return '\n'.join(result)
