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

export const createTextJob = async (text: string) => {
    const response = await api.post("/ocr/text-job", {
        text: text,
    });
    return response.data;
};

export const getOcrJobStatus = async (jobId: number) => {
    const response = await api.get(`/ocr/jobs/${jobId}/status`);
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

// TODO: 백엔드에 job_id로 결과를 가져오는 API 엔드포인트 구현 필요
// 현재는 컴파일 오류 해결을 위한 임시 함수
export const getOcrJobResult = async (jobId: number) => {
    console.warn(`getOcrJobResult 함수는 아직 구현되지 않았습니다. Job ID: ${jobId}`);
    // 임시로 빈 결과 반환 또는 오류 throw
    // 실제 구현 시에는 백엔드 API를 호출하여 결과 데이터를 반환해야 합니다.
    return {
        result: { furigana: [], vocabulary: [], fileNames: [] },
        conversion_type: "Furigana", // 또는 "Vocabulary"
    };
};
