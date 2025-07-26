import { useState, useEffect } from "react";
import MobileLayout from "../components/MobileLayout";
import { useNavigate } from "react-router-dom";
import { getAllHistory } from "../api/history";
import type { historyProps } from "../types/history";
import { format } from "date-fns";
import { useOCRStore } from "../store/ocrStore";
import { useLayoutStore } from "../store/layoutStore";

const HistoryPage = () => {
    const navigate = useNavigate();
    const [historyList, setHistoryList] = useState<historyProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setJobId, setMode } = useOCRStore();
    const { showHeader, showBottomNav } = useLayoutStore();

    useEffect(() => {
        showHeader();
        showBottomNav();
    }, [showHeader, showBottomNav]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const historyData = await getAllHistory();
                setHistoryList(historyData);
            } catch (err) {
                console.error("Failed to fetch history:", err);
                setError("활동 기록을 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        if (localStorage.getItem("token")) {
            fetchHistory();
        } else {
            setError("로그인이 필요합니다.");
            setIsLoading(false);
        }
    }, []);

    const handleHistoryItemClick = (item: historyProps) => {
        setJobId(item.id);
        setMode(item.conversion_type === "furigana" ? "Furigana" : "Vocabulary");
        navigate("/result");
    };

    // Helper function to format history item for display (copied from HomePage.tsx)
    const formatHistoryItem = (item: historyProps) => {
        const isText = item.file_names.includes("Text Input");
        const type = item.conversion_type === "furigana" ? "Furigana Conversion" : "Vocabulary Extraction";
        const description = isText ? "From text input" : item.file_names.join(", ");
        const icon = isText ? "/assets/text.svg" : "/assets/image.svg";
        const date = format(new Date(item.created_at), "yyyy. MM. dd");

        return { type, description, icon, date };
    };

    return (
        <MobileLayout title="History" onBack={() => navigate(-1)}>
            <div className="flex flex-col h-full p-4 space-y-4">
                {/* <h1 className="text-2xl font-bold text-dark1">Activity History</h1> */}

                {isLoading && <p className="text-center text-dark4">Loading history...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!isLoading && !error && (
                    <div className="space-y-3">
                        {historyList.length > 0 ? (
                            historyList.map((item) => {
                                const { type, description, icon, date } = formatHistoryItem(item);
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-light5 p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleHistoryItemClick(item)}
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
                            <div className="text-center text-dark4 py-4 bg-light5 rounded-lg">
                                No activity history found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MobileLayout>
    );
};

export default HistoryPage;
