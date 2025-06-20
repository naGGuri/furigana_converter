import React from "react";

type ButtonSize = "small" | "medium" | "large";
type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
    size?: ButtonSize;
    variant?: ButtonVariant;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

// 버튼 사이즈
const sizeClassMap: Record<ButtonSize, string> = {
    small: "text-sm px-4 py-2 rounded-2xl",
    medium: "text-[14px] w-[130px] h-[40px] px-2 py-2 rounded-xl",
    large: "text-[16px] w-[280px] h-[40px] rounded-xl",
};

// 버튼 종류
const variantClassMap: Record<ButtonVariant, string> = {
    primary: "bg-primary1 text-white border-2 border-primary1 hover:bg-blue-700 hover:border-blue-700 ",
    secondary: "bg-white text-primary1 border-2 border-primary1 hover:bg-blue-50",
};

const Button: React.FC<ButtonProps> = ({ size = "medium", variant = "primary", children, onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`
                font-Pretendard font-medium transition duration-100 
                ${sizeClassMap[size]} ${variantClassMap[variant]} ${className}
            `}
        >
            {children}
        </button>
    );
};

export default Button;
