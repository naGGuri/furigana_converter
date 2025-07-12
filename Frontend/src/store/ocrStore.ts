import { create } from "zustand";

interface OCRWord {
    word: string;
    reading: string;
    translation: string;
}

interface OCRResult {
    furigana: string[];
    vocabulary: OCRWord[][];
    fileNames: string[];
}

interface OCRState {
    result: OCRResult;
    setResult: (result: OCRResult) => void;
    jobId: number | null;
    setJobId: (jobId: number | null) => void;
    mode: "Furigana" | "Vocabulary";
    setMode: (mode: "Furigana" | "Vocabulary") => void;
}

export const useOCRStore = create<OCRState>((set) => ({
    result: { furigana: [], vocabulary: [], fileNames: [] },
    setResult: (result) => set({ result }),
    jobId: null,
    setJobId: (jobId) => set({ jobId }),
    mode: "Furigana",
    setMode: (mode) => set({ mode }),
}));
