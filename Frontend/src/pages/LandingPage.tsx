import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { useLayoutStore } from "../store/layoutStore";
import { useEffect } from "react";
import api from "../api/config";

const LandingPage = () => {
    const navigate = useNavigate();
    const { hideHeader, hideBottomNav, showHeader, showBottomNav } = useLayoutStore();

    useEffect(() => {
        hideHeader();
        hideBottomNav();
        return () => {
            showHeader();
            showBottomNav();
        };
    }, [hideHeader, hideBottomNav, showHeader, showBottomNav]);

    useEffect(() => {
        const autoLogin = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // 토큰 유효성 검사
                    await api.get("/users/me");
                    // 유효하면 메인 페이지로 이동
                    navigate("/home");
                } catch (error) {
                    // 유효하지 않으면 토큰 삭제
                    localStorage.removeItem("token");
                }
            }
        };
        autoLogin();
    }, [navigate]);

    return (
        <MobileLayout>
            <div
                className="flex flex-col items-center justify-center h-full bg-cover bg-center"
                style={{ backgroundImage: "url(/landing_background.png)" }}
            >
                <p className="font-bold text-2xl mb-4">Struggling to read Kanji</p>
                <p className="font-normal font-xs text-center mb-8">
                    paste Japanese text or upload an image
                    <br />
                    to get instant Furigana.
                </p>
                <div className="flex flex-col gap-4">
                    <Button size="small" variant="primary" onClick={() => navigate("/login")}>
                        Let's Start
                    </Button>
                </div>
            </div>
        </MobileLayout>
    );
};

export default LandingPage;
