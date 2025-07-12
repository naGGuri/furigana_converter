import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/config";
import Button from "../components/Button";
import MobileLayout from "../components/MobileLayout";
import { useLayoutStore } from "../store/layoutStore";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    await api.get("/users/me");
                    navigate("/home"); // 이미 로그인 상태이면 메인 페이지로 리디렉션
                } catch (error) {
                    // 토큰이 유효하지 않으면 로컬 스토리지에서 제거
                    localStorage.removeItem("token");
                }
            }
        };
        checkAuth();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        try {
            const response = await api.post("/auth/login", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            localStorage.setItem("token", response.data.access_token);
            navigate("/");
        } catch (error) {
            console.error("Login failed", error);
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <MobileLayout title="Login" onBack={() => navigate(-1)}>
            <div
                className="flex flex-col items-center justify-center h-full bg-cover bg-center"
                style={{ backgroundImage: "url(/landing_background_50.png)" }}
            >
                <form className="flex flex-col w-full p-4" onSubmit={handleSubmit}>
                    <p className="mb-4 font-bold text-[24px] text-center">Welcome!</p>
                    {/* 이메일 */}
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 text-dark1 border border-dark4 rounded-xl bg-transparent focus:ring-primary1 focus:ring-2 focus:outline-none"
                            required
                            placeholder="Email"
                        />
                    </div>
                    {/* 비밀번호 */}
                    <div className="mb-4 relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 text-dark1 border border-dark4 rounded-xl bg-transparent focus:ring-primary1 focus:ring-2 focus:outline-none pr-10"
                            required
                            placeholder="Password"
                        />
                        <img
                            src={showPassword ? "/assets/visible.svg" : "/assets/invisible.svg"}
                            alt="Toggle password visibility"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer w-4 h-4"
                            onClick={() => setShowPassword(!showPassword)}
                        />
                    </div>
                    {/* 비밀번호 찾기 */}
                    <p
                        className="text-sm text-left font-medium text-primary1 mb-4 cursor-pointer hover:underline"
                        onClick={() => alert("비밀번호 찾기 기능은 준비 중입니다.")}
                    >
                        Forgot password?
                    </p>
                    <Button size="large" variant="primary" className="w-full mb-4">
                        Login
                    </Button>
                    {/* 회원가입 */}
                    <p className="text-center text-sm text-dark4">
                        Not a member?{" "}
                        <span
                            className="font-medium text-primary1 cursor-pointer hover:underline"
                            onClick={() => navigate("/signup")}
                        >
                            Register now
                        </span>
                    </p>
                </form>
            </div>
        </MobileLayout>
    );
};

export default Login;
