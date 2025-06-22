// src/store/ocrStore.ts
import { create } from "zustand";

export interface VocabularyWord {
    word: string;
    reading: string;
    translation: string;
}

export interface OCRResult {
    furigana: string[];
    vocabulary: VocabularyWord[][];
    fileNames: string[];
}

interface OCRState {
    result: OCRResult;
    setResult: (result: OCRResult) => void;
}

export const useOCRStore = create<OCRState>((set) => ({
    result: { furigana: [], vocabulary: [], fileNames: [] },
    setResult: (result) => set({ result }),
}));
