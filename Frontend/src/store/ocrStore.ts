// src/store/ocrStore.ts
import { create } from "zustand";
import type { OCRResult } from "../types/ocr";

/**
 * OCRState는 OCR 결과에 대한 전역 상태를 정의합니다.
 * - result: 서버에서 받은 OCR 변환 결과 (후리가나 or 단어 정보)
 * - setResult: 결과를 상태에 저장하는 함수
 * - clearResult: 결과를 초기화하는 함수
 */
interface OCRState {
    result: OCRResult; // 현재 저장된 OCR 결과
    setResult: (data: OCRResult) => void; // OCR 결과 저장 함수
    clearResult: () => void; // OCR 결과 초기화 함수
}

/**
 * useOCRStore는 OCR 결과 상태를 관리하기 위한 Zustand 스토어입니다.
 * - 전역에서 OCR 변환 결과를 공유하고 재사용할 수 있습니다.
 */
export const useOCRStore = create<OCRState>((set) => ({
    result: [], // 초기 상태는 빈 배열
    setResult: (data) => set({ result: data }), // OCR 결과 저장
    clearResult: () => set({ result: [] }), // OCR 결과 초기화
}));
