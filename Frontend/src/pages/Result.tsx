import { useLocation } from "react-router-dom";
import { useOCRStore } from "../store/ocrStore";
import MobileLayout from "../components/MobileLayout";
import type { VocabularyWord } from "../types/ocr"; // VocabularyWord 타입이 여기에 정의되어 있다고 가정

const Result = () => {
    const location = useLocation();
    const isFurigana = location.search.includes("mode=Furigana");
    const { result } = useOCRStore();

    console.log("🧪 OCR result in Result.tsx: ", result);

    return (
        <MobileLayout>
            <div className="px-4 py-6">
                {isFurigana ? (
                    <div>
                        <p>후리가나 결과</p>
                        {result}
                    </div>
                ) : (
                    <div>
                        <p>단어장 결과</p>
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
                )}
            </div>
        </MobileLayout>
    );
};

export default Result;
