# Backend/services/ocr_service.py

from schemas.ocr_schema import OCRWord
from database.models.user_model import User
from database.models import ocr_job_model
from crud import ocr_crud as crud_ocr_job
from database.database import SessionLocal
from easyocr import Reader
from fugashi import Tagger
from pykakasi import kakasi
from PIL import Image
import numpy as np
import torch
import re
from io import BytesIO
from typing import Dict, List
from googletrans import Translator
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import os
import google.generativeai as genai

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# OCR 및 텍스트 변환기 초기화
USE_GPU = torch.cuda.is_available()
print(f"GPU 사용 여부: {USE_GPU}")

# EasyOCR Reader 초기화
reader = Reader(['ja'], gpu=USE_GPU)
# Fugashi Tagger 초기화
tagger = Tagger()
# Googletrans Translator 초기화
translator = Translator()

# Pykakasi 변환기 설정
kakasi_converter = kakasi()
kakasi_converter.setMode("J", "H")  # 한자(Kanji) → 히라가나(Hiragana)
kakasi_converter.setMode("K", "H")  # 가타카나(Katakana) → 히라가나(Hiragana)
kakasi_converter.setMode("H", "H")  # 히라가나(Hiragana) → 히라가나(Hiragana) (유지)
kakasi_converter.setMode("r", "Hepburn")  # 로마자(Romaji) 출력 방식: 헵번식
conv = kakasi_converter.getConverter()  # 설정된 변환기 인스턴스 가져오기


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    이미지 바이트로부터 텍스트를 추출합니다.
    EasyOCR을 사용하여 OCR을 수행하고, 추출된 모든 텍스트 라인을 결합하여 반환합니다.

    Args:
        image_bytes (bytes): 이미지 파일의 바이트 데이터.

    Returns:
        str: 이미지에서 추출된 모든 텍스트.
    """
    # 바이트 데이터를 PIL Image 객체로 변환
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    # PIL Image를 NumPy 배열로 변환
    image_np = np.array(image)
    # EasyOCR을 사용하여 텍스트 추출
    ocr_results = reader.readtext(image_np, detail=0)

    # 모든 텍스트 라인을 결합하여 반환
    return ''.join(ocr_results)


def extract_texts_from_images(image_bytes_list: List[bytes]) -> List[str]:
    """
    여러 이미지 바이트 리스트로부터 텍스트를 추출합니다.

    Args:
        image_bytes_list (List[bytes]): 이미지 파일의 바이트 데이터 리스트.

    Returns:
        List[str]: 각 이미지에서 추출된 텍스트 리스트.
    """
    return [extract_text_from_image(image_bytes) for image_bytes in image_bytes_list]


def create_ocr_job(db: Session, file_names: List[str], user: User) -> ocr_job_model.OcrJob:
    """
    데이터베이스에 새로운 OCR 작업을 생성합니다.

    Args:
        db (Session): 데이터베이스 세션.
        file_names (List[str]): OCR 처리할 파일 이름 목록.
        user (User): 현재 사용자 객체.

    Returns:
        ocr_job_model.OcrJob: 생성된 OCR 작업 객체.
    """
    return crud_ocr_job.create_ocr_job(db=db, file_names=file_names, user=user)


def get_validated_ocr_job(db: Session, job_id: int, user_id: int) -> ocr_job_model.OcrJob:
    """
    완료된 OCR 작업을 조회하고 후처리 유효성을 검사합니다.
    작업을 찾을 수 없거나 완료되지 않은 경우 HTTPException을 발생시킵니다.

    Args:
        db (Session): 데이터베이스 세션.
        job_id (int): OCR 작업 ID.
        user_id (int): 사용자 ID.

    Returns:
        ocr_job_model.OcrJob: 유효성 검사를 통과한 OCR 작업 객체.

    Raises:
        HTTPException: OCR 작업을 찾을 수 없거나 완료되지 않은 경우.
    """
    job = crud_ocr_job.get_ocr_job(db, job_id=job_id, user_id=user_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="OCR Job not found")
    if job.status != "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"OCR Job is not completed. Current status: {job.status}")
    return job


def correct_text_with_gemini(text: str) -> str:
    """
    Gemini API를 사용하여 OCR로 추출된 텍스트의 오탈자를 교정하고 문맥을 개선합니다.

    Args:
        text (str): 교정할 원본 텍스트.

    Returns:
        str: 교정된 텍스트. 오류 발생 시 원본 텍스트를 반환합니다.
    """
    if not text.strip():
        return text

    prompt = f"""OCR로 추출된 다음 일본어 텍스트의 오탈자를 교정하고, 문맥에 맞게 자연스러운 일본어 문장으로 수정해주세요. 
    오직 수정된 텍스트만 출력하세요. 다른 설명이나 추가적인 내용은 포함하지 마세요.
    {text}"""
    try:
        response = gemini_model.generate_content(prompt)
        corrected_text = response.text.strip()
        return corrected_text
    except Exception as e:
        print(f"❌ Gemini text correction failed: {e}")
        return text  # 오류 발생 시 원본 텍스트 반환


async def run_ocr_job(job_id: int, image_bytes_list: List[bytes]):
    """백그라운드에서 실행될 OCR 처리 함수"""
    # 백그라운드 작업은 자체 DB 세션을 생성
    db = SessionLocal()
    try:
        # 1. 이미지에서 텍스트 추출
        raw_texts = extract_texts_from_images(image_bytes_list)
        # 2. Gemini API를 사용하여 텍스트 교정
        corrected_texts = [correct_text_with_gemini(
            text) for text in raw_texts]
        # 3. DB에 결과 및 상태 업데이트
        crud_ocr_job.update_ocr_job_result(
            db, job_id=job_id, status="COMPLETED", raw_texts=corrected_texts)
    except Exception as e:
        print(f"❌ OCR Job {job_id} failed: {e}")
        crud_ocr_job.update_ocr_job_result(db, job_id=job_id, status="FAILED")
    finally:
        db.close()


def process_text_and_save(db: Session, job_id: int, text: str):
    """
    텍스트를 처리하고 결과를 DB에 저장하는 동기 함수.
    """
    try:
        # DB에 결과 및 상태 업데이트 (결과를 리스트 형태로 저장)
        crud_ocr_job.update_ocr_job_result(
            db, job_id=job_id, status="COMPLETED", raw_texts=[text])
    except Exception as e:
        print(f"❌ Text Processing Job {job_id} failed: {e}")
        crud_ocr_job.update_ocr_job_result(db, job_id=job_id, status="FAILED")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during text processing."
        )


def get_ocr_job_status(db: Session, job_id: int, user_id: int):
    """
    OCR 작업의 상태를 조회합니다.
    """
    job = crud_ocr_job.get_ocr_job(db, job_id=job_id, user_id=user_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="OCR Job not found")
    return {"job_id": job.id, "status": job.status}


# get_ocr_job_result 함수를 async로 변경
async def get_ocr_job_result(db: Session, job_id: int, user_id: int):
    """
    완료된 OCR 작업의 결과를 반환합니다.
    """
    job = get_validated_ocr_job(db, job_id=job_id, user_id=user_id)

    final_result = {
        "furigana": [],
        "vocabulary": [],
        "fileNames": job.file_names
    }

    conversion_type = job.conversion_type if hasattr(job, 'conversion_type') else None

    if conversion_type == "furigana":
        final_result["furigana"] = [make_furigana_from_text(text) for text in job.raw_texts]

    elif conversion_type == "vocabulary":
        final_result["vocabulary"] = await process_texts_for_vocabulary(job.raw_texts)

    return {
        "job_id": job.id,
        "status": job.status,
        "file_names": job.file_names,
        "raw_texts": job.raw_texts,
        "result": final_result,
        "conversion_type": conversion_type
    }


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


def make_vocabulary_from_text(text: str) -> List[OCRWord]:
    """
    일본어 텍스트에서 단어장(한자 단어 + 후리가나)을 생성합니다.
    형태소 분석을 통해 한자 단어를 식별하고 후리가나를 변환합니다.
    """
    # 이미 처리된 단어를 추적
    seen = set()
    # 최종 단어장 결과를 저장할 리스트
    result = []

    # Fugashi 형태소 분석기를 사용하여 텍스트의 각 단어를 순회
    for word in tagger(text):
        surface = word.surface  # 단어의 표면형

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
    if not vocabulary:
        return []

    words_to_translate = [w.word for w in vocabulary]
    new_vocabulary = []

    try:
        # 여러 단어를 한 번에 번역하여 API 호출 최소화
        translated_results = translator.translate(
            words_to_translate, src="ja", dest="en")

        for i, w in enumerate(vocabulary):
            translated_text = translated_results[i].text if translated_results[i] and hasattr(
                translated_results[i], "text") else ""
            new_vocabulary.append({
                "word": w.word,
                "reading": w.reading,
                "translation": translated_text
            })
    except Exception as e:
        print(f"❌ Translation failed for batch: {e}")
        # 번역 실패 시, 번역 필드를 비워두고 반환
        for w in vocabulary:
            new_vocabulary.append({
                "word": w.word,
                "reading": w.reading,
                "translation": ""
            })

    return new_vocabulary


async def process_texts_for_vocabulary(texts: List[str]) -> List[List[Dict[str, str]]]:
    """
    여러 텍스트 문자열 리스트를 받아 각 텍스트에서 단어를 추출하고 번역을 추가합니다.

    Args:
        texts (List[str]): 처리할 텍스트 문자열 리스트.

    Returns:
        List[List[Dict[str, str]]]: 각 이미지에서 추출된 단어 목록을 포함하는 2차원 리스트.
    """
    all_results = []
    for text in texts:
        words = make_vocabulary_from_text(text)
        enriched_words = add_translation(words)
        all_results.append(enriched_words)
    return all_results


def make_furigana_from_text(text: str) -> str:
    """
    이미지에서 추출된 일본어 문장 내의 한자에 후리가나를 삽입합니다.
    문장을 OCR로 추출하고, 형태소 분석을 통해 한자를 식별한 후,
    Pykakasi를 사용하여 해당 한자에 후리가나를 추가합니다.
    문장 단위로 줄바꿈을 처리하여 반환합니다.
    예: "日本語" → "日本語(にほんご)"

    Args:
        text (str): 후리가나를 추가할 원본 일본어 텍스트.

    Returns:
        str: 후리가나가 삽입된 문장들을 줄바꿈으로 연결한 문자열.
    """
    # 텍스트 정규화
    text = text.replace(";", "、").replace(",", "、").replace(".", "。")
    # 특수 문자 제거
    text = re.sub(r"[^\u3040-\u30FF\u4E00-\u9FAF。、0-9a-zA-Z\s]", "", text)
    # 문장을 일본어 구두점을 기준으로 분할
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
