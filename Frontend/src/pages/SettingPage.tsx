import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { useLayoutStore } from "../store/layoutStore";

const SettingPage = () => {
    const navigate = useNavigate();
    const { showHeader, hideHeader, showBottomNav, hideBottomNav } = useLayoutStore();

    useEffect(() => {
        showHeader();
        hideBottomNav();
        return () => {
            hideHeader();
            showBottomNav();
        };
    }, [showHeader, hideHeader, showBottomNav, hideBottomNav]);

    const handleLogout = () => {
        // 로컬 스토리지에서 토큰 제거
        localStorage.removeItem("token");
        // 로그인 페이지로 리디렉션
        navigate("/login");
    };

    return (
        <MobileLayout title="Settings" onBack={() => navigate(-1)}>
            <div className="flex flex-col  h-full p-4">
                <p className="w-full text-left text-lg font-normal text-dark1 cursor-pointer" onClick={handleLogout}>
                    Logout
                </p>
                <div className="border-b border-gray-200 mt-4"></div>
            </div>
        </MobileLayout>
    );
};

export default SettingPage;
