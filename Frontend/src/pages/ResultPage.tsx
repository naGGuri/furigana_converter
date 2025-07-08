import { useState, useEffect } from "react";
import { useOCRStore } from "../store/ocrStore";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import ExportDialog from "../components/ExportDialog";
import jsPDF from "jspdf";
import { PretendardJP } from "../PretendardJP-Regular";
import { useLayoutStore } from "../store/layoutStore";

const Result = () => {
    const [toggle, setToggle] = useState<"Furigana" | "Vocabulary">("Furigana");
    const [openExport, setOpenExport] = useState(false);
    const { result } = useOCRStore();
    const navigate = useNavigate();
    const { showHeader, hideBottomNav, showBottomNav } = useLayoutStore();

    useEffect(() => {
        showHeader();
        hideBottomNav();
        return () => {
            showBottomNav();
        };
    }, [showHeader, hideBottomNav, showBottomNav]);

    // ✅ PDF 내보내기
    const handleExportToPDF = () => {
        const doc = new jsPDF();
        const maxWidth = 180;
        let cursorY = 20;

        doc.addFileToVFS("PretendardJP.ttf", PretendardJP.PretendardJP);
        doc.addFont("PretendardJP.ttf", "PretendardJP", "normal");
        doc.setFont("PretendardJP");
        doc.setFontSize(12);

        if (toggle === "Furigana") {
            result.furigana.forEach((line: string, idx: number) => {
                doc.setFontSize(14);
                doc.text(`📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}`, 10, cursorY);
                cursorY += 10;
                const lines = doc.splitTextToSize(line, maxWidth);
                doc.text(lines, 10, cursorY);
                cursorY += lines.length * 8 + 4;
            });
        } else {
            result.vocabulary.forEach((sentence, idx: number) => {
                doc.setFontSize(14);
                doc.text(`📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}`, 10, cursorY);
                cursorY += 10;
                sentence.forEach((item) => {
                    const line = `${item.word} (${item.reading}) - ${item.translation.toLowerCase()}`;
                    const lines = doc.splitTextToSize(line, maxWidth);
                    doc.text(lines, 10, cursorY);
                    cursorY += lines.length * 8;
                });
                cursorY += 6;
            });
        }
        console.log("PDF 저장!");
        doc.save("ocr_result.pdf");
    };

    // ✅ 클립보드 복사
    const handleCopyToClipboard = () => {
        if (!navigator.clipboard) {
            alert("❌ 현재 브라우저에서 클립보드 복사가 지원되지 않습니다.");
            return;
        }

        let text = "";
        if (toggle === "Furigana") {
            text = result.furigana
                .map((line, idx) => `📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}\n${line}`)
                .join("\n\n");
        } else {
            text = result.vocabulary
                .map((sentence, idx) => {
                    const header = `📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}`;
                    const words = sentence
                        .map((item) => `${item.word} (${item.reading}) - ${item.translation}`)
                        .join("\n");
                    return `${header}\n${words}`;
                })
                .join("\n\n");
        }

        navigator.clipboard
            .writeText(text)
            .then(() => console.log("클립보드에 복사되었습니다!"))
            .catch((err) => {
                console.error("❌ 클립보드 복사 실패:", err);
                alert("❌ 클립보드 복사 중 오류가 발생했습니다.");
            });
    };

    return (
        <MobileLayout title="Result" onClose={() => navigate("/")}>
            <div className="px-4 py-6">
                {/* 토글 버튼 */}
                <div className="flex w-[330px] h-[40px] p-[4px] mb-8 bg-light4 rounded-xl justify-center items-center gap-[2px]">
                    <button
                        onClick={() => setToggle("Furigana")}
                        className={`w-1/2 h-full rounded-xl font-semibold transition 
                        ${toggle === "Furigana" ? "bg-light5 text-dark1" : "bg-light4 text-dark5"}`}
                    >
                        Furigana
                    </button>
                    <button
                        onClick={() => setToggle("Vocabulary")}
                        className={`w-1/2 h-full rounded-xl font-semibold transition 
                        ${toggle === "Vocabulary" ? "bg-light5 text-dark1" : "bg-light4 text-dark5"}`}
                    >
                        Vocabulary
                    </button>
                </div>

                {/* 내보내기 버튼 */}
                <div className="flex justify-end mb-2 cursor-pointer" onClick={() => setOpenExport(true)}>
                    <img src="assets/export.svg" alt="내보내기" className="h-[24px] w-[24px]" />
                </div>

                {/* 내보내기 다이얼로그 */}
                <ExportDialog
                    isOpen={openExport}
                    onClose={() => setOpenExport(false)}
                    onPDF={handleExportToPDF}
                    onCopy={handleCopyToClipboard}
                />

                {/* 결과 화면 */}
                {toggle === "Furigana" ? (
                    <div className="w-[324px] h-[480px] rounded-md overflow-y-auto">
                        <div className="flex flex-col items-start justify-start p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                            {result.furigana.map((line, idx) => (
                                <div key={idx} className="mb-4">
                                    <p className="text-sm text-dark4 font-semibold mb-1">
                                        📄 {result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}
                                    </p>
                                    <p className="font-bold text-[18px] text-dark1 mb-1">{line}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-[324px] h-[480px] rounded-md overflow-y-auto">
                        <div className="flex flex-col p-4 bg-[rgba(180,219,255,0.3)] rounded-md">
                            {result.vocabulary.map((sentence, idx) => (
                                <div key={idx} className="w-full bg-white p-4 rounded shadow mb-4">
                                    <p className="text-sm text-dark4 font-semibold mb-2">
                                        📄 {result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}
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
                                            <span className="text-right text-xs text-dark4">
                                                {item.translation.toLowerCase()}
                                            </span>
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
