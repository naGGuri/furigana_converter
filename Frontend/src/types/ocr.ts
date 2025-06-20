// src/types/ocr.ts

/**
 * OCRWord는 Vocabulary 모드에서 사용되는 단어 단위의 정보를 정의합니다.
 * - word: 원본 텍스트 (한자 등)
 * - reading: 해당 단어의 후리가나 (히라가나 발음)
 */
export type VocabularyWord = {
    word: string;
    reading: string;
};

/**
 * VocabularyResult는 단어 정보(OCRWord)의 2차원 배열입니다.
 * - 각 배열은 한 문장을 나타냅니다.
 * - 각 문장 안에는 단어 객체들이 배열로 나열됩니다.
 */
export type VocabularyResult = VocabularyWord[][];

/**
 * FuriganaResult는 후리가나 변환된 문장 전체를 문자열로 나타내는 1차원 배열입니다.
 * - 문장 단위로 분리된 문자열들이 포함됩니다.
 * - 예: ["私(わたし)は本(ほん)が好き(すき)です"]
 */
export type FuriganaResult = string[];

/**
 * OCRResult는 FuriganaResult 또는 VocabularyResult 두 가지 중 하나입니다.
 * - 변환 모드(Furigana 또는 Vocabulary)에 따라 달라집니다.
 */
export type OCRResult = VocabularyResult | FuriganaResult;
