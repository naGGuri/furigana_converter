import { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { useNavigate } from "react-router-dom";
import api from "../api/config";
import { getRecentHistory } from "../api/history";
import type { historyProps } from "../types/history";
import { format } from "date-fns";
import { useOCRStore } from "../store/ocrStore";

const HomePage = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string | null>(null);
    const [recentHistory, setRecentHistory] = useState<historyProps[]>([]);
    const { setJobId, setMode } = useOCRStore();

    const menuItems = [
        { label: "Image", icon: "/assets/image_white.svg", path: "/upload" },
        { label: "Text", icon: "/assets/text_white.svg", path: "/text" },
        { label: "AI Chat", icon: "/assets/chat_white.svg", path: "/chatbot" },
        { label: "History", icon: "assets/folder_white.svg", path: "/history" },
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await api.get("/users/me");
                    setUserName(response.data.name);
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };

        const fetchRecentHistory = async () => {
            try {
                const historyData = await getRecentHistory();
                setRecentHistory(historyData);
            } catch (error) {
                console.error("Failed to fetch recent history:", error);
            }
        };

        fetchUserData();
        if (localStorage.getItem("token")) {
            fetchRecentHistory();
        }
    }, []);

    const handleMenuClick = (path: string, label: string) => {
        // 존재하는 페이지는 이동, 없는 페이지는 알림
        if (["/upload", "/chatbot", "/text", "/history"].includes(path)) {
            navigate(path);
        } else {
            alert(`'${label}' page is coming soon!`);
        }
    };

    const handleHistoryClick = (item: historyProps) => {
        // 히스토리 아이템 클릭 시 해당 결과 페이지로 이동
        setJobId(item.id);
        setMode(item.conversion_type === "furigana" ? "Furigana" : "Vocabulary");
        navigate("/result");
    };

    const formatHistoryItem = (item: historyProps) => {
        const isText = item.file_names.includes("Text Input");
        const type = item.conversion_type === "furigana" ? "Furigana Conversion" : "Vocabulary Extraction";
        const description = isText ? "From text input" : item.file_names.join(", ");
        const icon = isText ? "/assets/text.svg" : "/assets/image.svg";
        const date = format(new Date(item.created_at), "yyyy. MM. dd");

        return { type, description, icon, date };
    };

    return (
        <MobileLayout>
            <div className="flex flex-col h-full p-4 space-y-8">
                {/* 환영 메시지 */}
                <div className="mt-4">
                    <h1 className="text-2xl font-bold text-dark1">Welcome back, {userName || "Guest"}!</h1>
                    <p className="text-md text-dark4">What would you like to do today?</p>
                </div>

                {/* 메인 메뉴 */}
                <div className="grid grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            className="aspect-square bg-primary1 rounded-2xl flex flex-col justify-center items-center gap-3 cursor-pointer hover:bg-blue-700 transition-colors text-white text-md font-semibold font-Pretendard"
                            onClick={() => handleMenuClick(item.path, item.label)}
                        >
                            <img className="w-12 h-12" src={item.icon} alt={item.label} />
                            <p className="text-center">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* 최근 활동 */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-bold text-dark1">Recent Activity</h2>
                        <span
                            className="text-sm font-medium text-primary1 cursor-pointer"
                            onClick={() => navigate("/history")}
                        >
                            View All
                        </span>
                    </div>
                    <div className="space-y-3">
                        {recentHistory.length > 0 ? (
                            recentHistory.map((item) => {
                                const { type, description, icon, date } = formatHistoryItem(item);
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-light5 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleHistoryClick(item)}
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <img src={icon} alt={type} className="w-6 h-6 flex-shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-dark1 truncate">{type}</p>
                                                <p className="text-sm text-dark4 truncate">{description}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-dark4 flex-shrink-0 ml-2">{date}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-dark4 py-4 bg-light5 rounded-lg">No recent activity.</div>
                        )}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
};

export default HomePage;
