// src/components/ExportDialog.tsx
import React from "react";
import Button from "./Button";

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPDF: () => void;
    onCopy: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, onPDF, onCopy }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark1 bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl w-[340px] p-6">
                <h1 className="text-xl font-semibold text-dark1 text-center">Export</h1>
                <h2 className="mt-2 mb-10 text-sm text-dark4 text-center">Please choose PDF or copy to clipboard</h2>
                <div className="flex flex-col justify-center items-center gap-2">
                    <Button
                        size="large"
                        variant="secondary"
                        onClick={() => {
                            onPDF();
                            onClose();
                        }}
                    >
                        PDF
                    </Button>
                    <Button
                        size="large"
                        variant="secondary"
                        onClick={() => {
                            onCopy();
                            onClose();
                        }}
                    >
                        Copy
                    </Button>
                    <Button size="large" variant="primary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExportDialog;
