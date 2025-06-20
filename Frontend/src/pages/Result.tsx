// src/pages/Result.tsx
import { useState } from "react";
import { useOCRStore } from "../store/ocrStore";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";

const Result = () => {
    const [toggle, setToggle] = useState<"Furigana" | "Vocabulary">("Furigana");
    const { result } = useOCRStore();
    const navigate = useNavigate();

    return (
        <MobileLayout title="Result" onClose={() => navigate("/")}>
            <div className="px-4 py-6">
                {/* 토글 */}
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

                {/* 결과 */}
                {toggle === "Furigana" ? (
                    <div className="w-[324px] h-[480px] rounded-md overflow-y-auto">
                        <div className="flex flex-col items-start justify-start p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                            {result.furigana.map((line, idx) => (
                                <p key={idx} className="font-bold text-[18px] text-dark1 mb-1">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-[324px] h-[480px] rounded-md overflow-y-auto">
                        <div className="flex flex-col p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                            {result.vocabulary.map((sentence, idx) => (
                                <div key={idx} className="w-full bg-white p-4 rounded shadow">
                                    {sentence.map((item, widx) => (
                                        <div
                                            key={widx}
                                            className="flex justify-between py-4 text-sm text-dark2 border-b"
                                        >
                                            <span className="text-dark1 text-[32px] font-bold text-start">
                                                {item.word}
                                            </span>
                                            <span className="text-dark2 font-semibold text-[12px] text-start">
                                                {item.reading}
                                            </span>
                                            <span className="text-right text-xs text-dark4">{item.translation}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
};

export default Result;
