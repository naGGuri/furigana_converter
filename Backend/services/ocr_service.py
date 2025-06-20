from easyocr import Reader
from fugashi import Tagger
from pykakasi import kakasi
from PIL import Image
import numpy as np
import re
from io import BytesIO

reader = Reader(['ja'], gpu=False)
tagger = Tagger()
kakasi_converter = kakasi()
kakasi_converter.setMode("J", "H")  # 일본어 한자 → 히라가나
kakasi_converter.setMode("K", "H")  # 가타카나 → 히라가나
kakasi_converter.setMode("H", "H")  # 히라가나 → 히라가나 (유지)
kakasi_converter.setMode("r", "Hepburn")
conv = kakasi_converter.getConverter()


def contains_kanji(text: str) -> bool:
    """한자 포함 여부"""
    return bool(re.search(r'[\u4e00-\u9faf]', text))


def extract_kanji_words(image_bytes: bytes) -> list[dict]:
    """이미지에서 한자 추출 후 알맞은 히라가나도 추출"""
    image = Image.open(BytesIO(image_bytes))
    image_np = np.array(image)
    ocr_results = reader.readtext(image_np, detail=0)
    combined_text = ''.join(ocr_results)

    result = []
    for word in tagger(combined_text):
        surface = word.surface
        if contains_kanji(surface):
            reading = conv.do(surface)  # 히라가나 변환
            result.append({
                "word": surface,
                "reading": reading
            })
    return result


def insert_furigana_text(image_bytes: bytes) -> str:
    """전체 문장에서 후리가나 삽입"""
    image = Image.open(BytesIO(image_bytes))
    image_np = np.array(image)
    ocr_results = reader.readtext(image_np, detail=0)
    combined_text = ''.join(ocr_results)

    result = []
    for word in tagger(combined_text):
        surface = word.surface
        if contains_kanji(surface):
            reading = conv.do(surface)
            result.append(f"{surface}({reading})")
        else:
            result.append(surface)
    return ''.join(result)
