# Backend/api/endpoints/ocr.py

from typing import List
from fastapi import APIRouter, UploadFile, File

# OCR 관련 서비스 함수들을 임포트합니다.
from services import ocr_service

# 응답 데이터 모델을 임포트합니다.
# schemas.ocr에서 스키마 임포트
from schemas.ocr import TranslatedVocabularyResult, FuriganaResult

# ✅ FastAPI 라우터 생성
# 이 라우터는 OCR 관련 API 엔드포인트를 정의하고 관리합니다.
router = APIRouter()


@router.post("/ocr/voca", response_model=TranslatedVocabularyResult)
async def extract_vocabulary(images: List[UploadFile] = File(...)):
    """
    한자 단어 추출 + 중복 제거 + 영어 번역 API

    여러 이미지 파일로부터 한자 단어를 추출하고, 중복을 제거한 후,
    각 단어에 대한 후리가나와 영어 번역을 추가하여 반환합니다.
    이 엔드포인트는 OCR 서비스의 `process_images_for_vocabulary` 함수를 호출하여
    모든 비즈니스 로직을 위임합니다.

    Args:
        images (List[UploadFile]): 업로드된 이미지 파일들의 리스트.
                                   각 파일은 OCR 처리를 위해 바이트 형태로 읽혀집니다.

    Returns:
        TranslatedVocabularyResult: 처리된 각 이미지에서 추출된 단어 목록을 포함하는 객체.
                                    각 단어는 원본, 후리가나, 영어 번역을 포함합니다.
    """
    image_bytes_list = []
    for image in images:
        image_bytes_list.append(await image.read())

    # OCR 서비스의 비즈니스 로직 함수를 호출하여 단어 추출 및 번역을 수행합니다.
    results = await ocr_service.process_images_for_vocabulary(image_bytes_list)

    # 최종 결과를 TranslatedVocabularyResult 스키마에 맞춰 반환
    return {"kanji_words_list": results}


@router.post("/ocr/furigana", response_model=FuriganaResult)
async def get_furigana_text(images: List[UploadFile] = File(...)):
    """
    후리가나 문장 생성 API

    업로드된 각 이미지에 포함된 텍스트에 대해 후리가나를 삽입한 문장을 생성하여 반환합니다.
    예: "日本語" → "日本語(にほんご)"
    이 엔드포인트는 OCR 서비스의 `make_furigana` 함수를 호출하여 비즈니스 로직을 위임합니다.

    Args:
        images (List[UploadFile]): 업로드된 이미지 파일들의 리스트.
                                   각 파일은 OCR 처리를 위해 바이트 형태로 읽혀집니다.

    Returns:
        FuriganaResult: 후리가나가 삽입된 문장들의 리스트를 포함하는 객체.
                        각 문자열은 원본 텍스트에 후리가나가 추가된 형태입니다.
    """
    results = []

    # 업로드된 각 이미지에 대해 처리
    for image in images:
        # 이미지 파일을 비동기적으로 바이트로 읽기
        image_bytes = await image.read()
        # OCR 서비스를 통해 이미지에서 후리가나 텍스트를 생성
        furigana_text = ocr_service.make_furigana(image_bytes)
        # 생성된 후리가나 텍스트를 결과 리스트에 추가
        results.append(furigana_text)

    # 최종 결과를 FuriganaResult 스키마에 맞춰 반환
    return {"furigana_texts": results}
