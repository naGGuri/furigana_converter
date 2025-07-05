import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import MobileLayout from "../components/MobileLayout";

const ChatbotPage = () => {
    const navigate = useNavigate();
    return (
        <MobileLayout title="Chatbot" onBack={() => navigate(-1)}>
            <Chatbot />
        </MobileLayout>
    );
};

export default ChatbotPage;
