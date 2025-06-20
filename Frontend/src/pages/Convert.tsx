// src/pages/Convert.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadStore } from "../store/uploadStore";
import MobileLayout from "../components/MobileLayout";
import Button from "../components/Button";

const Convert = () => {
    const navigate = useNavigate();

    // Furigana 또는 Vocabulary 선택 토글 상태
    const [toggle, setToggle] = useState<"Furigana" | "Vocabulary">("Furigana");

    // 업로드된 파일 전역 상태에서 불러오기
    const files = useUploadStore((state) => state.files);

    // 뒤로가기 버튼 클릭 → Upload 페이지로 이동
    const goToUpload = () => navigate("/upload");

    // Convert 버튼 클릭 → 파일이 있어야만 /converting 페이지로 이동
    const goToConverting = () => {
        if (files.length === 0) {
            alert("파일을 먼저 업로드해 주세요.");
            return;
        }

        // 사용자가 선택한 모드에 따라 쿼리로 전달 (ex. /converting?mode=Furigana)
        navigate(`/converting?mode=${toggle}`);
    };

    return (
        <MobileLayout>
            {/* 상단 제목 */}
            <div className="flex flex-col justify-between items-center">
                <p className="font-bold text-[20px] mb-[70px]">
                    {toggle === "Furigana" ? "Convert Furigana" : "Convert Vocabulary"}
                </p>

                {/* 토글 버튼 */}
                <div className="flex w-[330px] h-[40px] p-[4px] mb-[70px] bg-light4 rounded-xl justify-center items-center gap-[2px]">
                    <button
                        onClick={() => setToggle("Furigana")}
                        className={`w-1/2 h-full rounded-xl font-semibold transition 
              ${toggle === "Furigana" ? "bg-light5 text-dark1" : "bg-light4 text-dark5"}
            `}
                    >
                        Furigana
                    </button>
                    <button
                        onClick={() => setToggle("Vocabulary")}
                        className={`w-1/2 h-full rounded-xl font-semibold transition 
              ${toggle === "Vocabulary" ? "bg-light5 text-dark1" : "bg-light4 text-dark5"}
            `}
                    >
                        Vocabulary
                    </button>
                </div>
            </div>

            {/* 미리보기 이미지 */}
            <div className="flex flex-col justify-center items-center">
                <div className="flex justify-center items-center h-[130px] relative p-4">
                    <div className="absolute inset-0 bg-primary4 opacity-30" />
                    {toggle === "Furigana" ? (
                        <img src="/src/assets/furigana_preview.svg" alt="후리가나 예시" className="relative" />
                    ) : (
                        <img src="/src/assets/voca_preview.svg" alt="단어장 예시" className="relative" />
                    )}
                </div>
                <p className="font-light text-light1 text-[12px] mt-[2px]">Output Sample</p>
            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-center items-center">
                <div className="w-[280px] mt-[28px] flex justify-between items-center">
                    <Button size="medium" variant="secondary" onClick={goToUpload}>
                        Back
                    </Button>
                    <Button size="medium" variant="primary" onClick={goToConverting}>
                        Convert
                    </Button>
                </div>
            </div>
        </MobileLayout>
    );
};

export default Convert;
