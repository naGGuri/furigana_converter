import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/config";
import Button from "../components/Button";
import MobileLayout from "../components/MobileLayout";
import { useLayoutStore } from "../store/layoutStore";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 가시성 상태
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 비밀번호 확인 가시성 상태
    const [agreed, setAgreed] = useState(false); // 이용약관 동의 상태
    const navigate = useNavigate();
    const { showHeader, hideBottomNav, showBottomNav } = useLayoutStore();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    await api.get("/users/me");
                    navigate("/"); // 이미 로그인 상태이면 메인 페이지로 리디렉션
                } catch (error) {
                    // 토큰이 유효하지 않으면 로컬 스토리지에서 제거
                    localStorage.removeItem("token");
                }
            }
        };
        checkAuth();
    }, [navigate]);

    useEffect(() => {
        showHeader();
        hideBottomNav();
        return () => {
            showBottomNav();
        };
    }, [showHeader, hideBottomNav, showBottomNav]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!agreed) {
            alert("Please agree to the Terms and Conditions and the Privacy Policy.");
            return;
        }
        try {
            await api.post("/auth/signup", {
                name,
                email,
                password,
            });
            navigate("/login");
        } catch (error) {
            console.error("Signup failed", error);
        }
    };

    return (
        <MobileLayout title="Sign up" onBack={() => navigate(-1)}>
            <form className="mt-10 p-2" onSubmit={handleSubmit}>
                <div className="mb-4">
                    {/* 이름 */}
                    <label htmlFor="name" className="font-semibold text-[14px] mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 text-dark1 border rounded-xl focus:ring-primary1 focus:ring-2 focus:outline-none"
                        required
                        placeholder="Enter your name"
                    />
                </div>
                {/* 이메일 */}
                <div className="mb-4">
                    <label htmlFor="email" className="font-semibold text-[14px] mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 text-dark1 border rounded-xl focus:ring-primary1 focus:ring-2 focus:outline-none"
                        required
                        placeholder="Enter your email"
                    />
                </div>
                {/* 패스워드 */}
                <div className="mb-4">
                    <label htmlFor="password" className="font-semibold text-[14px] mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 text-dark1 border rounded-xl focus:ring-primary1 focus:ring-2 focus:outline-none pr-10"
                            required
                            placeholder="Enter your password"
                        />
                        <img
                            src={showPassword ? "/assets/visible.svg" : "/assets/invisible.svg"}
                            alt="Toggle password visibility"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer w-4 h-4"
                            onClick={() => setShowPassword(!showPassword)}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="font-semibold text-[14px] mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 text-dark1 border rounded-xl focus:ring-primary1 focus:ring-2 focus:outline-none pr-10"
                            required
                            placeholder="Confirm your password"
                        />
                        <img
                            src={showConfirmPassword ? "/assets/visible.svg" : "/assets/invisible.svg"}
                            alt="Toggle confirm password visibility"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer w-4 h-4"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                    </div>
                </div>
                <div className="flex items-start mb-6">
                    <input
                        id="terms-checkbox"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-4 h-4 text-primary1 bg-gray-100 border-gray-300 rounded focus:ring-primary1 mt-1"
                    />
                    <label htmlFor="terms-checkbox" className="ml-2 text-sm text-dark2">
                        I've read and agree with the{" "}
                        <span className="font-medium text-primary1 cursor-pointer hover:underline">
                            Terms and Conditions
                        </span>{" "}
                        and the{" "}
                        <span className="font-medium text-primary1 cursor-pointer hover:underline">Privacy Policy</span>
                        .
                    </label>
                </div>
                <Button size="large" variant="primary" className="w-full">
                    Create
                </Button>
            </form>
        </MobileLayout>
    );
};

export default Signup;
