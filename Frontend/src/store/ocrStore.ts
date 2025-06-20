// src/store/ocrStore.ts
import { create } from "zustand";

export interface VocabularyWord {
    word: string;
    reading: string;
}

export interface OCRResult {
    furigana: string[];
    vocabulary: VocabularyWord[][];
}

interface OCRState {
    result: OCRResult;
    setResult: (result: OCRResult) => void;
}

export const useOCRStore = create<OCRState>((set) => ({
    result: { furigana: [], vocabulary: [] },
    setResult: (result) => set({ result }),
}));
