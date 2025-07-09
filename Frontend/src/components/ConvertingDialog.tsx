import React from "react";

interface ConvertingDialogProps {
    isOpen: boolean;
    message?: string;
}

const ConvertingDialog: React.FC<ConvertingDialogProps> = ({ isOpen, message = "Processing..." }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 font-Pretendard">
            <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center w-auto min-w-[250px]">
                <img src="/assets/loading_spinner.svg" alt="Loading" className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-semibold text-dark1">{message}</p>
            </div>
        </div>
    );
};

export default ConvertingDialog;
