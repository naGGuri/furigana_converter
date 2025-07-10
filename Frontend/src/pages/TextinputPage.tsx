import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import Button from "../components/Button";
import { useLayoutStore } from "../store/layoutStore";
import { useOCRStore } from "../store/ocrStore";
import { createTextJob } from "../api/ocr";
import ConvertingDialog from "../components/ConvertingDialog";

const TextInputPage = () => {
    const navigate = useNavigate();
    const { showHeader, showBottomNav } = useLayoutStore();
    const { setJobId } = useOCRStore();
    const [text, setText] = useState("");
    const [isCreatingJob, setIsCreatingJob] = useState(false);

    useEffect(() => {
        showHeader();
        showBottomNav();
    }, [showHeader, showBottomNav]);

    const handleConvert = async () => {
        if (text.trim().length === 0) {
            alert("Please enter some text to convert.");
            return;
        }

        setIsCreatingJob(true);
        try {
            // 백엔드에 새로 추가될 텍스트 처리 API를 호출합니다.
            const response = await createTextJob(text);
            setJobId(response.job_id);
            navigate("/convert");
        } catch (error) {
            console.error("Error creating text job:", error);
            alert("Failed to start conversion. Please try again.");
        } finally {
            setIsCreatingJob(false);
        }
    };

    return (
        <MobileLayout title="Text Input" onBack={() => navigate(-1)}>
            <div className="flex flex-col h-full pt-4 space-y-6">
                <div className="flex-grow flex flex-col">
                    <label htmlFor="text-input" className="text-lg font-semibold text-dark1 mb-2">
                        Paste your Japanese text here
                    </label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full flex-grow p-3 text-dark1 border-2 border-light2 rounded-xl focus:ring-primary1 focus:ring-2 focus:outline-none resize-none"
                        placeholder="Please enter Japanese text here..."
                    />
                </div>
                <div className="flex-shrink-0 pb-4">
                    <Button
                        size="large"
                        variant="primary"
                        onClick={handleConvert}
                        disabled={isCreatingJob}
                        className="w-full"
                    >
                        {isCreatingJob ? "Processing..." : "Convert"}
                    </Button>
                </div>
            </div>
            <ConvertingDialog isOpen={isCreatingJob} message="Creating Job..." />
        </MobileLayout>
    );
};

export default TextInputPage;
