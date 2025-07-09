// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ConvertPage from "./pages/ConvertPage";
import ConvertingPage from "./pages/ConvertingPage";
import ResultPage from "./pages/ResultPage";
import LandingPage from "./pages/LandingPage";
import ChatbotPage from "./pages/ChatbotPage"; // 챗봇 페이지 import
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/convert" element={<ConvertPage />} />
                <Route path="/Converting" element={<ConvertingPage />} />
                <Route path="/result" element={<ResultPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} /> {/* 챗봇 페이지 라우트 추가 */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
        </Router>
    );
};

export default App;
