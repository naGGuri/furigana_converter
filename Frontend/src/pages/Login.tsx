import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/config";
import Button from "../components/Button";
import MobileLayout from "../components/MobileLayout";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

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
            <form className="mt-10" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="font-semibold text-[14px] mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded-xl focus:ring-primary1 focus:ring-2 focus:outline-none"
                        required
                        placeholder="Enter your email"
                    />
                </div>
                <div className="mb-4 relative">
                    <label className="font-semibold text-[14px] mb-2">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border rounded-xl focus:ring-primary1 focus:ring-2 focus:outline-none pr-10"
                        required
                        placeholder="Enter your password"
                    />
                    <img
                        src={showPassword ? "/assets/visible.svg" : "/assets/invisible.svg"}
                        alt="Toggle password visibility"
                        className="absolute right-3 top-2/3 transform -translate-y-1/2 cursor-pointer w-4 h-4"
                        onClick={() => setShowPassword(!showPassword)}
                    />
                </div>
                <Button variant="primary" className="w-full">
                    Login
                </Button>
            </form>
        </MobileLayout>
    );
};

export default Login;
