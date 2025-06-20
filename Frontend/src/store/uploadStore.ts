// src/store/uploadStore.ts

import { create } from "zustand";

interface UploadStore {
    files: File[];
    addFiles: (newFiles: File[]) => void;
    removeFile: (index: number) => void;
    clearFiles: () => void; // 전체삭제 미구현
}

export const useUploadStore = create<UploadStore>((set) => ({
    files: [],
    addFiles: (newFiles) =>
        set((state) => ({
            files: [...state.files, ...newFiles],
        })),
    removeFile: (index) =>
        set((state) => ({
            files: state.files.filter((_, i) => i !== index),
        })),
    clearFiles: () => set({ files: [] }),
}));
