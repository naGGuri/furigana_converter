import React from "react";

interface MobileLayoutProps {
    title?: string;
    children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
    return (
        <div className="w-full flex justify-center items-center font-Pretendard font-normal font-dark1">
            <div className="w-full max-w-sm h-[768px] p-4 flex flex-col border border-light1">
                {/* 본문 */}
                {children}
            </div>
        </div>
    );
};

export default MobileLayout;
