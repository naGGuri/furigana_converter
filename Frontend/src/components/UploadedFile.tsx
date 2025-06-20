// src/components/UploadedFile.tsx

interface UploadedFileProps {
    file: File;
    onDelete: () => void;
}

const UploadedFile = ({ file, onDelete }: UploadedFileProps) => {
    const fileSize = (file.size / (1024 * 1024)).toFixed(2); // MB 단위

    return (
        <div className="w-[260px] h-[70px] p-4 m-2 bg-primary5 rounded-xl flex justify-between items-center">
            <img src="src/assets/image.svg" alt="logo" className="w-[24px] h-[24px]" />
            <div className="flex-1 mx-3 overflow-hidden">
                <p className="font-bold text-[12px] truncate">{file.name}</p>
                <p className="font-light text-[12px]">{fileSize} MB</p>
            </div>
            <img
                src="src/assets/close.svg"
                alt="delete"
                className="w-[12px] h-[12px] cursor-pointer"
                onClick={onDelete}
            />
        </div>
    );
};

export default UploadedFile;
