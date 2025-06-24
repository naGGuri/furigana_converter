# 베이스 이미지: 가볍고 Python 3.11 포함
FROM python:3.11-slim

# 시스템 패키지 설치 (OCR, MeCab 등 의존성)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    mecab libmecab-dev mecab-ipadic-utf8 \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY requirements.txt .

# pip 업그레이드 및 fugashi+unidic-lite 설치 후 나머지 설치
RUN pip install --upgrade pip && \
    pip install --no-cache-dir fugashi[unidic-lite] && \
    pip install --no-cache-dir -r requirements.txt

# 전체 소스 복사
COPY . .

# FastAPI 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]