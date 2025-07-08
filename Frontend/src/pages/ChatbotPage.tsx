import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import MobileLayout from "../components/MobileLayout";
import { useLayoutStore } from "../store/layoutStore";
import { useEffect } from "react";

const ChatbotPage = () => {
    const navigate = useNavigate();
    const { showHeader, showBottomNav } = useLayoutStore();

    useEffect(() => {
        showHeader();
        return () => {
            showBottomNav();
        };
    }, [showHeader, showBottomNav]);

    return (
        <MobileLayout title="Chatbot" onBack={() => navigate(-1)}>
            <Chatbot />
        </MobileLayout>
    );
};

export default ChatbotPage;
