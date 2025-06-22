import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadStore } from "../store/uploadStore";
import { useOCRStore } from "../store/ocrStore";
import MobileLayout from "../components/MobileLayout";
import axios from "axios";
import Button from "../components/Button";
import CustomDialog from "../components/CustomDialog";

const Converting = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { files } = useUploadStore();
    const { setResult } = useOCRStore();

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (files.length === 0) {
            alert("업로드된 파일이 없습니다.");
            navigate("/upload");
            return;
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("images", file);
        });

        const controller = new AbortController();
        controllerRef.current = controller;

        const sendRequests = async () => {
            try {
                const [furiganaRes, vocabularyRes] = await Promise.all([
                    axios.post(`${BASE_URL}/api/ocr/furigana`, formData, {
                        signal: controller.signal,
                    }),
                    axios.post(`${BASE_URL}/api/ocr/voca`, formData, {
                        signal: controller.signal,
                    }),
                ]);

                const furiganaData = furiganaRes.data;
                const vocabData = vocabularyRes.data;

                setResult({
                    furigana: furiganaData.furigana_texts || [],
                    vocabulary: vocabData.kanji_words_list || [],
                    fileNames: [],
                });

                navigate("/result");
            } catch (err) {
                if (axios.isCancel(err) || (err instanceof Error && err.name === "CanceledError")) {
                    console.warn("❌ OCR 요청이 사용자에 의해 취소되었습니다.");
                } else {
                    alert("OCR 처리 중 오류가 발생했습니다.");
                    if (err instanceof Error) {
                        console.error(err.message);
                    } else {
                        console.error("Unknown error:", err);
                    }
                }
                navigate("/upload");
            }
        };

        sendRequests();
    }, [files, navigate, setResult]);

    return (
        <MobileLayout>
            <div className="flex flex-col justify-center items-center h-full">
                <p className="font-bold text-[24px]">Converting now</p>
                <p className="font-normal text-[16px] text-dark5">please wait...</p>
                <img
                    src="/src/assets/loading_spinner.svg"
                    alt="로딩 중"
                    className="w-[48px] h-[48px] animate-spin mt-[20px] mb-[30px]"
                />
                <Button size="large" variant="secondary" onClick={() => setOpen(true)}>
                    Stop
                </Button>
            </div>
            <CustomDialog
                title="Are you sure?"
                subtitle="This operation is irreversible"
                isOpen={open}
                onCancel={() => setOpen(false)}
                onConfirm={() => {
                    controllerRef.current?.abort();
                    setOpen(false);
                    navigate("/upload");
                }}
            />
        </MobileLayout>
    );
};

export default Converting;
