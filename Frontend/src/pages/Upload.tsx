// src/pages/Upload.tsx

import React, { useRef, useState } from "react";
import Button from "../components/Button";
import MobileLayout from "../components/MobileLayout";
import UploadedFile from "../components/UploadedFile";
import { useUploadStore } from "../store/uploadStore";
import { useNavigate } from "react-router-dom";

const Upload = () => {
    const navigate = useNavigate(); // 페이지 이동을 위한 훅
    const fileInputRef = useRef<HTMLInputElement>(null); // 숨겨진 input[type="file"]에 접근하기 위한 ref

    const { files, addFiles, removeFile } = useUploadStore(); // 업로드된 파일 상태 관리
    const [isDragging, setIsDragging] = useState(false); // 드래그 상태

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

    // 취소 버튼 클릭 시 홈으로 이동
    const goToHome = () => navigate("/");

    // Next 버튼 클릭 시 파일이 있어야만 이동
    const goToConvert = () => {
        if (files.length === 0) {
            alert("하나 이상의 파일을 업로드해야 합니다.");
            return;
        }
        navigate("/convert");
    };

    return (
        <MobileLayout title="Upload File" onBack={() => navigate(-1)} onClose={goToHome}>
            <div className="flex flex-col justify-between items-center">
                {/* 업로드 영역 (드래그앤드롭 또는 클릭 업로드) */}
                <div
                    className={`rounded w-[280px] h-[220px] flex flex-col justify-center items-center gap-[15px]
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
                    <img src="public/assets/image.svg" alt="logo" className="w-[32px] h-[32px]" />

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
                <p className="font-normal text-light1 text-[12px] mt-[4px]">Supported formats: JPG, PNG</p>

                {/* 업로드된 파일 목록 */}
                <p className="font-[16px] my-[20px]">Uploaded Files</p>
                <div className="w-[280px] h-[230px] mb-[20px] overflow-y-auto">
                    {files.map((file, index) => (
                        <UploadedFile key={index} file={file} onDelete={() => removeFile(index)} />
                    ))}
                </div>

                {/* 버튼 */}
                <div className="flex w-full justify-center items-center">
                    <Button size="large" variant="primary" onClick={goToConvert}>
                        Convert
                    </Button>
                </div>
            </div>
        </MobileLayout>
    );
};

export default Upload;
