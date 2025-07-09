import api from "./config";

export const createOcrJob = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("images", file);
    });

    const response = await api.post("/ocr/jobs", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const convertToFurigana = async (jobId: number) => {
    const response = await api.post("/ocr/furigana", { job_id: jobId });
    return response.data;
};

export const convertToVocabulary = async (jobId: number) => {
    const response = await api.post("/ocr/voca", { job_id: jobId });
    return response.data;
};
