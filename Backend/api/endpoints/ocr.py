# Backend/api/endpoints/ocr.py

from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session

# OCR 관련 서비스 함수들을 임포트합니다.
from services import ocr_service
# 응답 데이터 모델을 임포트합니다.
from schemas.ocr import TranslatedVocabularyResult, FuriganaResult, OcrJobCreateResponse, PostProcessingRequest, OcrJobStatusResponse, OcrResultResponse
# 인증 및 DB 관련 의존성 임포트
from ..endpoints.auth import get_current_user
from schemas.auth import User
from database.database import get_db
# History 저장을 위한 CRUD 및 스키마 임포트
from crud import history as crud_history
from schemas import history as history_schema

# ✅ FastAPI 라우터 생성
# 이 라우터는 OCR 관련 API 엔드포인트를 정의하고 관리합니다.
router = APIRouter()


@router.post("/ocr/jobs", response_model=OcrJobCreateResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_ocr_job(
    background_tasks: BackgroundTasks,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    1단계: 이미지들을 받아 OCR 작업을 생성하고 백그라운드에서 실행합니다.
    즉시 job_id를 반환하여 클라이언트가 오래 기다리지 않도록 합니다.
    """
    image_bytes_list = []
    file_names = []
    for image in images:
        image_bytes_list.append(await image.read())
        file_names.append(image.filename or "unknown_file")

    # DB에 OCR 작업 생성
    job = ocr_service.initiate_ocr_job(
        db=db, file_names=file_names, user=current_user)

    # 백그라운드에서 OCR 처리 실행
    background_tasks.add_task(ocr_service.run_ocr_job,
                              job.id, image_bytes_list)

    return {"job_id": job.id, "status": job.status}


@router.get("/ocr/jobs/{job_id}/status", response_model=OcrJobStatusResponse)
def get_ocr_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    OCR 작업의 현재 상태를 확인합니다.
    """
    return ocr_service.get_ocr_job_status(db=db, job_id=job_id, user_id=current_user.id)


@router.get("/ocr/jobs/{job_id}/result", response_model=OcrResultResponse)
def get_ocr_job_result(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    완료된 OCR 작업의 결과를 반환합니다.
    """
    return ocr_service.get_ocr_job_result(db=db, job_id=job_id, user_id=current_user.id)


@router.post("/ocr/voca", response_model=TranslatedVocabularyResult)
async def extract_vocabulary_from_job(
    req: PostProcessingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    2단계: 완료된 OCR job_id를 받아 단어장을 생성하고 번역합니다.
    """
    job = ocr_service.get_validated_ocr_job(
        db, job_id=req.job_id, user_id=current_user.id)

    # DB에 저장된 텍스트로 단어장 생성
    results = await ocr_service.process_texts_for_vocabulary(job.raw_texts)

    # 변환 기록 생성
    history_data = history_schema.ConversionHistoryCreate(
        conversion_type="vocabulary", file_names=job.file_names, result_data=results
    )
    crud_history.create_conversion_history(
        db=db, history=history_data, user=current_user)

    return {"kanji_words_list": results}


@router.post("/ocr/furigana", response_model=FuriganaResult)
async def get_furigana_from_job(
    req: PostProcessingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    2단계: 완료된 OCR job_id를 받아 후리가나를 생성합니다.
    """
    job = ocr_service.get_validated_ocr_job(
        db, job_id=req.job_id, user_id=current_user.id)

    results = []
    for text in job.raw_texts:
        furigana_text = ocr_service.make_furigana_from_text(text)
        results.append(furigana_text)

    # 변환 기록 생성
    history_data = history_schema.ConversionHistoryCreate(
        conversion_type="furigana", file_names=job.file_names, result_data=results
    )
    crud_history.create_conversion_history(
        db=db, history=history_data, user=current_user)

    return {"furigana_texts": results}
