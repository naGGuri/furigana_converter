import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import Button from "../components/Button";
import { useLayoutStore } from "../store/layoutStore";
import { useOCRStore } from "../store/ocrStore"; // ocrStore 임포트 추가
import { convertToFurigana, convertToVocabulary } from "../api/ocr";
import ConvertingDialog from "../components/ConvertingDialog";

const Convert = () => {
    const navigate = useNavigate();
    const { hideBottomNav, showHeader, showBottomNav } = useLayoutStore();
    const [isConverting, setIsConverting] = useState(false);

    // ocrStore에서 jobId와 setMode 가져오기
    const { jobId, setMode, setResult } = useOCRStore();

    useEffect(() => {
        hideBottomNav();
        return () => {
            showHeader();
            showBottomNav();
        };
    }, [hideBottomNav, showHeader, showBottomNav]);

    // Furigana 또는 Vocabulary 선택 토글 상태
    const [toggle, setToggle] = useState<"Furigana" | "Vocabulary">("Furigana");

    // Convert 버튼 클릭
    const handleConvert = async () => {
        // jobId가 없으면 변환 불가
        if (jobId === null) {
            alert("OCR 작업 정보가 없습니다. 파일을 다시 업로드해 주세요.");
            navigate("/"); // 또는 적절한 페이지로 이동
            return;
        }

        setIsConverting(true);
        try {
            // 2단계: 후처리 (후리가나 또는 단어장 생성) - jobId 사용
            if (toggle === "Furigana") {
                const furiganaResult = await convertToFurigana(jobId);
                setResult({
                    furigana: furiganaResult.furigana_texts,
                    vocabulary: [], // 후리가나 변환 시 단어장은 비워둠
                    fileNames: furiganaResult.fileNames || [], // 파일 이름도 함께 저장
                });
                setMode("Furigana");
            } else {
                const vocabularyResult = await convertToVocabulary(jobId);
                setResult({
                    furigana: [], // 단어장 변환 시 후리가나는 비워둠
                    vocabulary: vocabularyResult.kanji_words_list,
                    fileNames: vocabularyResult.fileNames || [], // 파일 이름도 함께 저장
                });
                setMode("Vocabulary");
            }

            navigate(`/result`);
        } catch (error) {
            console.error("Error during conversion:", error);
            alert("변환 중 오류가 발생했습니다.");
        } finally {
            setIsConverting(false);
        }
    };

    // 취소 버튼 클릭 시 홈으로 이동
    const goToHome = () => navigate("/");

    return (
        <MobileLayout title="Convert" onBack={() => navigate(-1)} onClose={goToHome}>
            <ConvertingDialog isOpen={isConverting} />
            {/* 상단 제목 */}
            <div className="flex flex-col justify-between items-center">
                {/* 토글 버튼 */}
                <div className="flex w-[330px] h-[40px] p-[4px] mt-[100px] mb-[70px] bg-light4 rounded-xl justify-center items-center gap-[2px]">
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
            <div className="flex flex-col justify-center items-center mb-[100px]">
                <div className="flex justify-center items-center h-[130px] relative p-4">
                    <div className="absolute inset-0 bg-primary4 opacity-30" />
                    {toggle === "Furigana" ? (
                        <img src="assets/furigana_preview.svg" alt="후리가나 예시" className="relative" />
                    ) : (
                        <img src="assets/voca_preview.svg" alt="단어장 예시" className="relative" />
                    )}
                </div>
                <p className="font-light text-light1 text-[12px] mt-[2px]">Output Sample</p>
            </div>

            {/* 버튼 */}
            <div className="flex w-full justify-center items-center">
                <Button size="large" variant="primary" onClick={handleConvert}>
                    Convert
                </Button>
            </div>
        </MobileLayout>
    );
};

export default Convert;
