import { useState, useEffect } from "react";
import { useOCRStore } from "../store/ocrStore";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import ExportDialog from "../components/ExportDialog";
import { useLayoutStore } from "../store/layoutStore";
import { exportToPDF } from "../utils/ExportToPDF";
import { copyToClipboard } from "../utils/CopyToClipboard";
import { getOcrJobResult } from "../api/ocr"; // OCR 결과를 가져오는 새로운 API 함수 임포트 (가정)

const Result = () => {
    const [openExport, setOpenExport] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const [error, setError] = useState<string | null>(null); // 오류 상태 추가
    const { jobId, result, mode, setResult, setMode } = useOCRStore(); // jobId, result, mode, setResult, setMode 가져옴
    const navigate = useNavigate();
    const { showHeader, showBottomNav } = useLayoutStore();

    useEffect(() => {
        showHeader();
        return () => {
            showBottomNav();
        };
    }, [showHeader, showBottomNav]);

    // jobId 변경 감지 및 결과 로딩 로직
    useEffect(() => {
        const fetchResult = async () => {
            // jobId가 있고, 현재 result 상태가 비어있을 때만 결과를 가져옴
            if (jobId !== null && result.furigana.length === 0 && result.vocabulary.length === 0) {
                setIsLoading(true);
                setError(null);
                try {
                    // TODO: 백엔드에 job_id로 결과를 가져오는 API 엔드포인트 구현 필요
                    // getOcrJobResult 함수는 해당 API를 호출한다고 가정
                    const jobResultData = await getOcrJobResult(jobId); // OCR 결과 데이터 가져오는 API 호출 (가정)

                    // API 응답 구조에 따라 결과 및 모드 설정
                    if (jobResultData && jobResultData.result && jobResultData.conversion_type) {
                        setResult(jobResultData.result); // 결과 데이터 설정
                        setMode(jobResultData.conversion_type === "furigana" ? "Furigana" : "Vocabulary"); // 모드 설정
                    } else {
                        setError("결과 데이터를 불러오는데 실패했습니다.");
                    }
                } catch (err) {
                    console.error("Failed to fetch OCR result:", err);
                    setError("결과를 불러오는 중 오류가 발생했습니다.");
                } finally {
                    setIsLoading(false);
                }
            } else if (jobId === null && result.furigana.length === 0 && result.vocabulary.length === 0) {
                // jobId도 없고 result도 비어있으면 표시할 결과가 없음
                setIsLoading(false);
                setError("표시할 결과가 없습니다.");
            } else {
                // jobId가 없거나 result가 이미 채워져 있으면 로딩 상태 해제
                setIsLoading(false);
                setError(null);
            }
        };

        fetchResult();
    }, [jobId, result.furigana.length, result.vocabulary.length, setResult, setMode, navigate]); // 의존성 배열 업데이트

    // 결과 데이터가 없을 경우 로딩 또는 오류 메시지 표시
    if (isLoading) {
        return (
            <MobileLayout title="Result" onClose={() => navigate("/home")}>
                <div className="mt-4 text-center text-dark4">Loading result...</div>
            </MobileLayout>
        );
    }

    if (error) {
        return (
            <MobileLayout title="Result" onClose={() => navigate("/home")}>
                <div className="mt-4 text-center text-red-500">{error}</div>
            </MobileLayout>
        );
    }

    // 결과 데이터가 있을 때만 결과 화면 렌더링
    // result 객체가 비어있지 않은지 추가 확인
    if (result.furigana.length === 0 && result.vocabulary.length === 0) {
        return (
            <MobileLayout title="Result" onClose={() => navigate("/home")}>
                <div className="mt-4 text-center text-dark4">표시할 결과가 없습니다.</div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title="Result" onClose={() => navigate("/home")}>
            <div className="mt-4 ">
                {/* 내보내기 버튼 */}
                <div className="flex justify-end mb-2 cursor-pointer" onClick={() => setOpenExport(true)}>
                    <img src="/assets/export.svg" alt="내보내기" className="h-6 w-6" />
                </div>

                {/* 내보내기 다이얼로그 */}
                <ExportDialog
                    isOpen={openExport}
                    onClose={() => setOpenExport(false)}
                    onPDF={() => exportToPDF(mode, result)}
                    onCopy={() => copyToClipboard(mode, result)}
                />

                {/* 결과 화면 */}
                {mode === "Furigana" ? (
                    // 후리가나 결과 화면
                    <div className="w-full rounded-md overflow-y-auto">
                        <div className="flex flex-col items-start justify-start p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                            {result.furigana.map((line, idx) => (
                                <div key={idx} className="mb-4">
                                    <p className="text-sm text-dark4 font-semibold mb-1">
                                        📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}
                                    </p>
                                    <p className="font-bold text-[18px] text-dark1 mb-1">{line}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // 단어장 결과 화면
                    <div className="w-[324px] h-[480px] rounded-md overflow-y-auto">
                        <div className="flex flex-col p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                            {result.vocabulary.map((sentence, idx) => (
                                <div key={idx} className="w-full bg-white p-4 rounded shadow mb-4">
                                    <p className="text-sm text-dark4 font-semibold mb-2">
                                        📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}
                                    </p>
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
                                            {/* <span className="text-right text-xs text-dark4">
                                                {item.translation.toLowerCase()}
                                            </span> */}
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
