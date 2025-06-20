import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUploadStore } from "../store/uploadStore";
import { useOCRStore } from "../store/ocrStore";
import MobileLayout from "../components/MobileLayout";
import axios from "axios";
import Button from "../components/Button";
import CustomDialog from "../components/CustomDialog";

const Converting = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "Furigana";

    const { files } = useUploadStore();
    const { setResult } = useOCRStore();

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const endpoint = mode === "Vocabulary" ? "voca" : "furigana";

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
        console.log(BASE_URL, endpoint);
        axios
            .post(`${BASE_URL}/api/ocr/${endpoint}`, formData, {
                signal: controller.signal,
            })
            .then((res) => {
                const data = res.data;
                if (mode === "Vocabulary") {
                    console.log("📦 Vocabulary Result:", data.kanji_words_list);
                    setResult(data.kanji_words_list || []);
                } else {
                    setResult(data.furigana_texts || []);
                    console.log("📦 Furigana Result:", data.furigana_texts);
                }
                navigate(`/result?mode=${mode}`);
            })
            .catch((err) => {
                if (axios.isCancel(err) || err.name === "CanceledError") {
                    console.warn("❌ OCR 요청이 사용자에 의해 취소되었습니다.");
                } else {
                    alert("OCR 처리 중 오류가 발생했습니다.");
                    console.error(err);
                }
                navigate("/upload");
            });
    }, [files, navigate, mode, setResult]);

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
                    controllerRef.current?.abort(); // ✅ 진짜 취소는 여기서만!
                    setOpen(false);
                    navigate("/upload");
                }}
            />
        </MobileLayout>
    );
};

export default Converting;
