// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";
import Convert from "./pages/Convert";
import Converting from "./pages/Converting";
import Result from "./pages/Result";
import Home from "./pages/Home";
import ChatbotPage from "./pages/ChatbotPage"; // 챗봇 페이지 import

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/convert" element={<Convert />} />
                <Route path="/converting" element={<Converting />} />
                <Route path="/result" element={<Result />} />
                <Route path="/chatbot" element={<ChatbotPage />} /> {/* 챗봇 페이지 라우트 추가 */}
                <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
        </Router>
    );
};

export default App;
