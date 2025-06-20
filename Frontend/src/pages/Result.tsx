import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useOCRStore } from "../store/ocrStore";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import type { VocabularyWord } from "../types/ocr"; // VocabularyWord 타입이 여기에 정의되어 있다고 가정

const Result = () => {
    const location = useLocation();
    const isFurigana = location.search.includes("mode=Furigana");
    const { result } = useOCRStore();
    const [toggle, setToggle] = useState<"Furigana" | "Vocabulary">("Furigana"); // Furigana 또는 Vocabulary 선택 토글 상태
    const navigate = useNavigate();

    const goToHome = () => {
        navigate("/");
    };

    // console.log("🧪 OCR result in Result.tsx: ", result);

    return (
        <MobileLayout title="Result" onClose={goToHome}>
            <div className="px-4 py-6">
                {/* 토글 버튼 */}
                <div className="flex w-[330px] h-[40px] p-[4px] mb-8 bg-light4 rounded-xl justify-center items-center gap-[2px]">
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
                {/* 내보내기 */}
                <div className="flex justify-end mb-2 cursor-pointer">
                    <img src="src/assets/export.svg" alt="내보내기" className="h-[24px] w-[24px]" />
                </div>
                {/* 출력결과 */}
                {isFurigana ? (
                    <div className="w-[324px] h-[480px] rounded-md overflow-y-auto">
                        <div className="flex flex-col items-start justify-start p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                            {(result as string[]).map((line, idx) => (
                                <p key={idx} className="font-bold text-[18px] text-dark1 mb-1">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p>단어장 결과</p>
                        <div className="w-[324px] h-[480px] rounded-md overflow-y-auto">
                            <div className="flex flex-col items-start justify-start p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                                {(result as VocabularyWord[][]).map((sentence, idx) => (
                                    <div key={idx} className="mb-4 bg-white p-4 rounded shadow">
                                        {sentence.map((item, widx) => {
                                            return (
                                                <div
                                                    key={widx}
                                                    className="flex justify-between py-1 text-sm text-dark2 border-b"
                                                >
                                                    <span>{item.word}</span>
                                                    <span className="text-gray-500">{item.reading}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
};

export default Result;
