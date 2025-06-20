import React from "react";

interface MobileLayoutProps {
    title: string; // 헤더 제목은 필수
    onBack?: () => void; // 뒤로가기 버튼 클릭 핸들러 (선택)
    onClose?: () => void; // 닫기 버튼 클릭 핸들러 (선택)
    children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ title, onBack, onClose, children }) => {
    return (
        <div className="w-full flex justify-center items-center font-Pretendard font-normal text-dark1">
            <div className="w-full max-w-sm h-[768px] p-4 flex flex-col border border-light1">
                {/* ✅ 상단 헤더 */}
                <div className="flex items-center justify-between h-12 mb-2">
                    {/* 좌측: 뒤로가기 */}
                    {onBack ? (
                        <img
                            src="src/assets/arrow_left.svg"
                            alt="뒤로가기"
                            className="w-[24px] h-[24px]"
                            onClick={onBack}
                        />
                    ) : (
                        <div className="w-[32px]" /> // 공간 유지를 위해
                    )}

                    {/* 중앙: 제목 */}
                    <p className="font-Pretendard text-[20px] font-semibold text-center flex-1">{title}</p>

                    {/* 우측: 닫기 */}
                    {onClose ? (
                        <img
                            src="src/assets/close_blue.svg"
                            alt="닫기"
                            className="w-[24px] h-[24px]"
                            onClick={onClose}
                        />
                    ) : (
                        <div className="w-[32px]" />
                    )}
                </div>

                {/* 본문 콘텐츠 */}
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default MobileLayout;
