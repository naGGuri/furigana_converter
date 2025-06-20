from pydantic import BaseModel
from typing import List


class OCRWord(BaseModel):
    word: str
    reading: str


class VocabularyResult(BaseModel):
    kanji_words_list: List[List[OCRWord]]


class FuriganaResult(BaseModel):
    furigana_texts: List[str]
