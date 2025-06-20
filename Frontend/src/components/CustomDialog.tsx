import React from "react";
import Button from "./Button";

interface CustomDialogProps {
    title: string;
    subtitle?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isOpen: boolean;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ title, subtitle, onConfirm, onCancel, isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark1 bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md p-6">
                <p className="text-xl font-semibold text-dark1 text-center">{title}</p>
                {subtitle && <p className="mt-2 text-sm text-dark4 text-center">{subtitle}</p>}

                <div className="flex justify-center items-center">
                    <div className="w-[280px] mt-[28px] flex justify-between items-center">
                        <Button size="medium" variant="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button size="medium" variant="primary" onClick={onConfirm}>
                            OK
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomDialog;
