import { PretendardJP } from "../PretendardJP-Regular";
import jsPDF from "jspdf";

export const exportToPDF = (mode: string, result: any) => {
    const doc = new jsPDF();
    const maxWidth = 180;
    let cursorY = 20;

    doc.addFileToVFS("PretendardJP.ttf", PretendardJP.PretendardJP);
    doc.addFont("PretendardJP.ttf", "PretendardJP", "normal");
    doc.setFont("PretendardJP");
    doc.setFontSize(12);

    // 후리가나 변환 결과
    if (mode === "Furigana") {
        result.furigana.forEach((line: string, idx: number) => {
            doc.setFontSize(14);
            doc.text(`📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}`, 10, cursorY);
            cursorY += 10;
            const lines = doc.splitTextToSize(line, maxWidth);
            doc.text(lines, 10, cursorY);
            cursorY += lines.length * 8 + 4;
        });
    }
    // 단어장 변환 결과
    else {
        result.vocabulary.forEach((sentence: any[], idx: number) => {
            doc.setFontSize(14);
            doc.text(`📄 ${result.fileNames?.[idx] ?? `uploaded file ${idx + 1}`}`, 10, cursorY);
            cursorY += 10;
            sentence.forEach((item: any) => {
                const line = `${item.word} (${item.reading}) - ${item.translation.toLowerCase()}`;
                const lines = doc.splitTextToSize(line, maxWidth);
                doc.text(lines, 10, cursorY);
                cursorY += lines.length * 8;
            });
            cursorY += 6;
        });
    }
    // console.log("PDF 저장!");
    doc.save("ocr_result.pdf");
};
