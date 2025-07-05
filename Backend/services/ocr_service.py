# Backend/services/ocr_service.py

from easyocr import Reader            # OCR 처리를 위한 EasyOCR 라이브러리
from fugashi import Tagger           # 일본어 형태소 분석을 위한 Fugashi 라이브러리
from pykakasi import kakasi          # 한자-히라가나 변환을 위한 Pykakasi 라이브러리
from PIL import Image                # 이미지 처리를 위한 Pillow 라이브러리
import numpy as np                   # 이미지 데이터를 다루기 위한 NumPy
import torch                         # GPU 사용 여부 확인을 위한 PyTorch
import re                            # 정규 표현식 사용
from io import BytesIO               # 바이트 스트림 처리를 위한 BytesIO
from typing import Dict, List        # 타입 힌트를 위한 Dict, List
from googletrans import Translator   # 영어 번역을 위한 Googletrans 라이브러리

from schemas.ocr import OCRWord          # OCR 결과를 위한 공통 응답 스키마 임포트

# ✅ OCR 및 텍스트 변환기 초기화
# GPU 사용 가능 여부 확인 및 출력
USE_GPU = torch.cuda.is_available()
print(f"✅ GPU 사용 여부: {USE_GPU}")

# EasyOCR Reader 초기화: 일본어 모델 로드, GPU 사용 여부 설정
reader = Reader(['ja'], gpu=USE_GPU)
# Fugashi Tagger 초기화: 일본어 형태소 분석기 로드
tagger = Tagger()
# Googletrans Translator 초기화: 텍스트 번역을 위한 인스턴스 생성
translator = Translator()

# Pykakasi 변환기 설정
# 한자, 가타카나를 히라가나로 변환하고, 로마자 출력 방식을 Hepburn으로 설정합니다.
kakasi_converter = kakasi()
kakasi_converter.setMode("J", "H")  # 한자(Kanji) → 히라가나(Hiragana)
kakasi_converter.setMode("K", "H")  # 가타카나(Katakana) → 히라가나(Hiragana)
kakasi_converter.setMode("H", "H")  # 히라가나(Hiragana) → 히라가나(Hiragana) (유지)
kakasi_converter.setMode("r", "Hepburn")  # 로마자(Romaji) 출력 방식: 헵번식
conv = kakasi_converter.getConverter() # 설정된 변환기 인스턴스 가져오기


def contains_kanji(text: str) -> bool:
    """
    주어진 텍스트에 한자가 포함되어 있는지 확인합니다.
    유니코드 범위(U+4E00부터 U+9FAF)를 사용하여 한자를 검색합니다.

    Args:
        text (str): 검사할 문자열.

    Returns:
        bool: 텍스트에 한자가 하나라도 포함되어 있으면 True, 그렇지 않으면 False.
    """
    return bool(re.search(r'[\u4e00-\u9faf]', text))


def extract_japanese_from_image(image_bytes: bytes) -> str:
    """
    이미지 바이트로부터 일본어 텍스트를 추출합니다.
    EasyOCR을 사용하여 OCR을 수행하고, 한자가 포함된 텍스트 라인만 결합하여 반환합니다.

    Args:
        image_bytes (bytes): 이미지 파일의 바이트 데이터.

    Returns:
        str: 이미지에서 추출된 일본어 텍스트 (한자 포함).
    """
    # 바이트 데이터를 PIL Image 객체로 변환하고 RGB 모드로 변환
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    # PIL Image를 NumPy 배열로 변환 (EasyOCR 입력 형식에 맞춤)
    image_np = np.array(image)
    # EasyOCR을 사용하여 텍스트 추출 (detail=0은 텍스트만 반환하도록 설정)
    ocr_results = reader.readtext(image_np, detail=0)

    # OCR 결과에서 한자가 포함된 일본어 라인만 필터링하여 결합
    japanese_lines = [text for text in ocr_results if contains_kanji(text)]
    return ''.join(japanese_lines)


def make_vocabulary(image_bytes: bytes) -> List[OCRWord]:
    """
    일본어 이미지에서 단어장(한자 단어 + 후리가나)을 생성합니다.
    OCR로 텍스트를 추출한 후 형태소 분석을 통해 한자 단어를 식별하고,
    Pykakasi를 사용하여 해당 한자의 히라가나 읽는 법을 변환합니다.
    중복된 단어는 결과에 포함되지 않습니다.

    Args:
        image_bytes (bytes): 이미지 파일의 바이트 데이터.

    Returns:
        List[OCRWord]: 중복이 제거된 OCRWord 객체(원본 단어, 히라가나 읽는 법) 리스트.
    """
    # 이미지에서 일본어 텍스트 추출
    text = extract_japanese_from_image(image_bytes)
    # 이미 처리된 단어를 추적하기 위한 집합(set)
    seen = set()
    # 최종 단어장 결과를 저장할 리스트
    result = []

    # Fugashi 형태소 분석기를 사용하여 텍스트의 각 단어를 순회
    for word in tagger(text):
        surface = word.surface  # 단어의 표면형 (원본 형태)

        # 단어가 이전에 처리되지 않았고 한자를 포함하고 있다면
        if surface not in seen and contains_kanji(surface):
            seen.add(surface)  # 처리된 단어로 추가
            # Pykakasi를 사용하여 한자 단어를 히라가나로 변환
            reading = conv.do(surface)
            # OCRWord 스키마에 맞춰 결과 리스트에 추가
            result.append(OCRWord(word=surface, reading=reading))

    return result


def add_translation(vocabulary: List[OCRWord]) -> List[Dict[str, str]]:
    """
    주어진 OCRWord 단어 목록에 영어 번역을 추가합니다.
    Googletrans를 사용하여 각 단어를 일본어에서 영어로 번역합니다.

    Args:
        vocabulary (List[OCRWord]): OCRWord 객체(원본 단어, 히라가나 읽는 법) 리스트.

    Returns:
        List[Dict[str, str]]: 원본 단어, 히라가나 읽는 법, 영어 번역을 포함하는 딕셔너리 리스트.
    """
    new_vocabulary = []

    # 각 단어에 대해 번역 수행
    for w in vocabulary:
        try:
            # Googletrans를 사용하여 일본어(ja)에서 영어(en)로 번역
            result = translator.translate(w.word, src="ja", dest="en")
            # 번역 결과가 유효하면 텍스트를 가져오고, 아니면 빈 문자열
            translated = result.text if result and hasattr(
                result, "text") else ""
        except Exception as e:
            # 번역 실패 시 오류 메시지 출력 및 빈 문자열 할당
            print(f"❌ Translation failed for {w.word}: {e}")
            translated = ""

        # 번역된 단어 정보를 딕셔너리 형태로 추가
        new_vocabulary.append({
            "word": w.word,
            "reading": w.reading,
            "translation": translated
        })

    return new_vocabulary


async def process_images_for_vocabulary(image_bytes_list: List[bytes]) -> List[List[Dict[str, str]]]:
    """
    여러 이미지 바이트 리스트를 받아 각 이미지에서 단어를 추출하고 번역을 추가합니다.
    이 함수는 OCR, 단어 추출, 번역 추가의 전체 비즈니스 로직을 캡슐화합니다.

    Args:
        image_bytes_list (List[bytes]): 이미지 파일들의 바이트 데이터 리스트.

    Returns:
        List[List[Dict[str, str]]]: 각 이미지에서 추출된 단어 목록을 포함하는 2차원 리스트.
                                     각 단어는 원본, 후리가나, 영어 번역을 포함합니다.
    """
    all_results = []
    for image_bytes in image_bytes_list:
        # 1. 한자 + 히라가나 단어 목록 생성 (중복 제거 포함)
        words = make_vocabulary(image_bytes)
        # 2. 번역 추가된 단어 리스트 생성
        enriched_words = add_translation(words)
        # 3. 결과 리스트에 추가
        all_results.append(enriched_words)
    return all_results


def make_furigana(image_bytes: bytes) -> str:
    """
    이미지에서 추출된 일본어 문장 내의 한자에 후리가나를 삽입합니다.
    문장을 OCR로 추출하고, 형태소 분석을 통해 한자를 식별한 후,
    Pykakasi를 사용하여 해당 한자에 후리가나를 추가합니다.
    문장 단위로 줄바꿈을 처리하여 반환합니다.
    예: "日本語" → "日本語(にほんご)"

    Args:
        image_bytes (bytes): 이미지 파일의 바이트 데이터.

    Returns:
        str: 후리가나가 삽입된 문장들을 줄바꿈으로 연결한 문자열.
    """
    # OCR을 통해 이미지에서 텍스트 추출
    text = extract_japanese_from_image(image_bytes)
    # 텍스트 정규화: 특정 구두점을 일본어 구두점으로 대체
    text = text.replace(";", "、").replace(",", "、").replace(".", "。")
    # 특수 문자 제거: 일본어, 숫자, 알파벳, 특정 구두점(。,、)만 남김
    text = re.sub(r"[^\u3040-\u30FF\u4E00-\u9FAF。、0-9a-zA-Z\s]", "", text)
    # 문장을 일본어 구두점(。,！？)을 기준으로 분할
    sentences = re.split(r'(?<=[。！？])', text)

    result = []
    # 분할된 각 문장에 대해 처리
    for sentence in sentences:
        # 빈 문자열이거나 공백만 있는 문장은 건너뛰기
        if sentence.strip() == "":
            continue

        sentence_result = []
        # Fugashi 형태소 분석기를 사용하여 문장의 각 단어를 순회
        for word in tagger(sentence):
            surface = word.surface  # 단어의 표면형
            # 단어가 공백만 있는 경우 건너뛰기
            if surface.strip() == "":
                continue
            # 단어에 한자가 포함되어 있다면
            if re.search(r'[\u4e00-\u9faf]', surface):
                # Pykakasi를 사용하여 한자를 히라가나로 변환
                reading = conv.do(surface)
                # "원본(후리가나)" 형식으로 추가
                sentence_result.append(f"{surface}({reading})")
            else:
                # 한자가 없으면 원본 단어 그대로 추가
                sentence_result.append(surface)

        # 처리된 단어들을 결합하여 문장으로 만들고, 양쪽 공백 제거 후 결과 리스트에 추가
        result.append(''.join(sentence_result).strip())

    # 모든 문장을 줄바꿈 문자로 연결하여 반환
    return '\n'.join(result)