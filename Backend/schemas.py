# schemas.py
from pydantic import BaseModel
from typing import List


class OCRWord(BaseModel):
    """
    한 단어에 대한 OCR 분석 결과를 나타내는 모델
    - word: 원본 단어 (예: 漢字)
    - reading: 후리가나 또는 히라가나로 변환된 발음 (예: かんじ)
    """
    word: str
    reading: str


class TranslatedWord(BaseModel):
    """
    영어 번역이 포함된 단어 모델
    - word: 원본 단어 (예: 漢字)
    - reading: 후리가나 또는 히라가나 (예: かんじ)
    - translation: 영어 번역 (예: Chinese characters)
    """
    word: str
    reading: str
    translation: str


class VocabularyResult(BaseModel):
    """
    단어장 형식의 결과를 위한 응답 모델
    - kanji_words_list: 여러 문장 속의 한자 단어 목록을 2차원 배열로 표현
      예: [[{word: "漢字", reading: "かんじ"}, {...}], [...]]
    """
    kanji_words_list: List[List[OCRWord]]


class TranslatedVocabularyResult(BaseModel):
    """
    영어 번역이 포함된 단어장 결과 모델
    - kanji_words_list: 여러 문장 속의 번역된 단어 목록을 2차원 배열로 표현
      예: [[{word: "漢字", reading: "かんじ", translation: "Chinese characters"}, {...}], [...]]
    """
    kanji_words_list: List[List[TranslatedWord]]


class FuriganaResult(BaseModel):
    """
    후리가나 삽입이 완료된 문장을 포함하는 결과 모델
    - furigana_texts: 이미지당 한 문장씩 후리가나가 포함된 문장 리스트
      예: ["これは漢字(かんじ)の例です。", ...]
    """
    furigana_texts: List[str]
