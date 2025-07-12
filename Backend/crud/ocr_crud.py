# Backend/crud/ocr_crud.py

from sqlalchemy.orm import Session
from typing import List
from database.models import ocr_job_model as models
from database.models.user_model import User


def create_ocr_job(db: Session, file_names: List[str], user: User) -> models.OcrJob:
    db_job = models.OcrJob(file_names=file_names,
                           user_id=user.id, status="PENDING")
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def get_ocr_job(db: Session, job_id: int, user_id: int) -> models.OcrJob:
    return db.query(models.OcrJob).filter(models.OcrJob.id == job_id, models.OcrJob.user_id == user_id).first()


def update_ocr_job_result(db: Session, job_id: int, status: str, raw_texts: List[str] = None):
    db_job = db.query(models.OcrJob).filter(models.OcrJob.id == job_id).first()
    if db_job:
        db_job.status = status
        if raw_texts is not None:
            db_job.raw_texts = raw_texts
        db.commit()
        db.refresh(db_job)
    return db_job

def get_ocr_job_by_id(db: Session, job_id: int) -> models.OcrJob:
    return db.query(models.OcrJob).filter(models.OcrJob.id == job_id).first()
