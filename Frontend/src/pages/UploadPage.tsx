import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOcrJob, getOcrJobStatus } from "../api/ocr";
import Button from "../components/Button";
import MobileLayout from "../components/MobileLayout";
import UploadedFile from "../components/UploadedFile";
import ConvertingDialog from "../components/ConvertingDialog";
import { useUploadStore } from "../store/uploadStore";
import { useLayoutStore } from "../store/layoutStore";
import { useOCRStore } from "../store/ocrStore";

const Upload = () => {
    const navigate = useNavigate(); // 페이지 이동을 위한 훅
    const fileInputRef = useRef<HTMLInputElement>(null); // 숨겨진 input[type="file"]에 접근하기 위한 ref

    const { files, addFiles, removeFile, clearFiles } = useUploadStore(); // 업로드된 파일 상태 관리
    const { setJobId: setOcrStoreJobId } = useOCRStore(); // ocrStore의 setJobId를 별칭으로 가져옴
    const [isDragging, setIsDragging] = useState(false); // 드래그 상태
    const [isCreatingJob, setIsCreatingJob] = useState(false); // OCR Job 생성 중 상태
    const [pollingJobId, setPollingJobId] = useState<number | null>(null); // 폴링할 Job ID
    const [pollingMessage, setPollingMessage] = useState("Creating OCR Job..."); // 폴링 메시지
    const { showHeader, showBottomNav } = useLayoutStore();

    useEffect(() => {
        showHeader();
        showBottomNav();
    }, [showHeader, showBottomNav]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (pollingJobId !== null) {
            setPollingMessage("Processing OCR...");
            interval = setInterval(async () => {
                try {
                    const statusResponse = await getOcrJobStatus(pollingJobId);
                    if (statusResponse.status === "COMPLETED") {
                        clearInterval(interval);
                        setOcrStoreJobId(pollingJobId);
                        navigate("/convert");
                    } else if (statusResponse.status === "FAILED") {
                        clearInterval(interval);
                        alert("OCR 작업에 실패했습니다. 다시 시도해주세요.");
                        setIsCreatingJob(false);
                        setPollingJobId(null);
                    }
                } catch (error) {
                    clearInterval(interval);
                    console.error("Error polling OCR job status:", error);
                    alert("OCR 작업 상태를 확인하는 중 오류가 발생했습니다. 다시 시도해주세요.");
                    setIsCreatingJob(false);
                    setPollingJobId(null);
                }
            }, 3000); // 3초마다 폴링
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [pollingJobId, navigate, setOcrStoreJobId]);

    // 업로드 허용 확장자 목록
    const allowedExtensions = ["jpg", "jpeg", "png"];

    //  확장자 필터링 함수
    const filterValidFiles = (fileList: FileList) => {
        return Array.from(fileList).filter((file) => {
            const ext = file.name.split(".").pop()?.toLowerCase();
            return ext && allowedExtensions.includes(ext);
        });
    };

    //  input[type="file"]에서 파일 선택 시 처리
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;
        // 허용된 확장자만 필터링
        const validFiles = filterValidFiles(selectedFiles);
        if (validFiles.length !== selectedFiles.length) {
            alert("JPG 또는 PNG 형식의 파일만 업로드할 수 있습니다.");
        }
        // 기존 파일 목록에 추가
        addFiles(validFiles);
    };

    //  드래그앤드롭으로 파일을 올렸을 때 처리
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        const validFiles = filterValidFiles(droppedFiles);
        // 허용된 확장자만 필터링
        if (validFiles.length !== droppedFiles.length) {
            alert("JPG 또는 PNG 형식의 파일만 업로드할 수 있습니다.");
        }
        // 기존 파일 목록에 추가
        addFiles(validFiles);
    };

    // 드래그 요소가 드래그존에 들어왔을 때 동작
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // 드래그가 끝났을 때
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // Convert 버튼 클릭 시 파일이 있어야만 OCR 작업 실행
    const handleConvert = async () => {
        if (files.length === 0) {
            alert("하나 이상의 파일을 업로드해야 합니다.");
            return;
        }

        setIsCreatingJob(true);
        setPollingMessage("Creating OCR Job...");

        try {
            const jobResponse = await createOcrJob(files);
            const { job_id } = jobResponse;
            setPollingJobId(job_id);
        } catch (error) {
            console.error("Error creating OCR job:", error);
            alert("OCR 작업 생성에 실패했습니다. 다시 시도해주세요.");
            setIsCreatingJob(false);
            setPollingJobId(null);
        }
    };

    return (
        <MobileLayout title="Upload" onBack={() => navigate(-1)}>
            <div className="mt-4 px-4 flex flex-col justify-between items-center">
                {/* 업로드 영역 (드래그앤드롭 또는 클릭 업로드) */}
                <div
                    className={`w-full h-[220px] flex flex-col justify-center items-center gap-[15px]
                        ${
                            isDragging
                                ? "border-4 border-dashed border-primary4 bg-primary5 "
                                : "border-dashed border-4 border-light2"
                        }
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {/* 업로드 아이콘 */}
                    <img src="assets/image.svg" alt="logo" className="w-[32px] h-[32px]" />

                    {/* 텍스트 및 클릭 업로드 */}
                    <div className="flex flex-col justify-center item-center">
                        <p className="text-center text-dark1 font-normal">Drag and Drop here</p>
                        <p className="text-center">
                            or{" "}
                            <span
                                className="font-bold cursor-pointer underline underline-offset-1"
                                onClick={() => fileInputRef.current?.click()} // span 클릭 시 input 트리거
                            >
                                Choose File
                            </span>
                        </p>

                        {/* 실제 업로드 input (숨겨짐) */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg, .jpeg, .png"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                {/* 지원 포맷 안내 */}
                <p className="mt-4 w-full font-normal text-light1 text-[12px] text-start ">
                    Supported formats: JPG, PNG
                </p>

                {/* 업로드된 파일 목록 */}
                <div className="mt-4 flex w-full justify-between items-center">
                    <p className="font-bold text-[24px]">Uploaded Files</p>
                    <p className="font-normal text-[12px] text-primary1 cursor-pointer" onClick={clearFiles}>Clear All</p>
                </div>

                <div className="mt-4 w-full flex flex-col gap-2 overflow-y-auto">
                    {files.length === 0 ? (
                        <p className="text-center text-light1 text-[16px] mt-8">No uploaded images</p>
                    ) : (
                        files.map((file, index) => (
                            <UploadedFile key={index} file={file} onDelete={() => removeFile(index)} />
                        ))
                    )}
                </div>

                {/* 버튼 */}
                {files.length > 0 && (
                    <div className="mt-4 flex w-full justify-center items-center">
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
                )}
            </div>
            <ConvertingDialog isOpen={isCreatingJob} message={pollingMessage} />
        </MobileLayout>
    );
};

export default Upload;
