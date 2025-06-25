import React from "react";
import BottomNavigation from "./BottomNavigation";

interface MobileLayoutProps {
    title?: string;
    onBack?: () => void;
    onClose?: () => void;
    children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ title, onBack, onClose, children }) => {
    return (
        <div className="w-full flex justify-center items-center font-Pretendard font-normal text-dark1">
            <div className="w-full max-w-sm h-[768px] flex flex-col border border-light1">
                {/* ✅ 상단 헤더 */}
                <div className="h-12 px-4 flex items-center justify-between">
                    {onBack ? (
                        <img
                            src="assets/arrow_left.svg"
                            alt="뒤로가기"
                            className="w-[24px] h-[24px]"
                            onClick={onBack}
                        />
                    ) : (
                        <div className="w-[32px]" />
                    )}

                    <p className="font-Pretendard text-[20px] font-semibold text-center flex-1">{title}</p>

                    {onClose ? (
                        <img src="assets/close_blue.svg" alt="닫기" className="w-[24px] h-[24px]" onClick={onClose} />
                    ) : (
                        <div className="w-[32px]" />
                    )}
                </div>

                {/* ✅ 본문 콘텐츠 (스크롤 가능) */}
                <div className="flex-1 overflow-y-auto px-4">{children}</div>

                {/* ✅ 하단 고정 네비게이션 */}
                <div className="h-[88px] w-full">
                    <BottomNavigation />
                </div>
            </div>
        </div>
    );
};

export default MobileLayout;
