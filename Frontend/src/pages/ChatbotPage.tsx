import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { useLayoutStore } from "../store/layoutStore";
import api from "../api/config";

interface Message {
    text: string;
    isUser: boolean;
}

const LoadingAnimation = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-.3s]" />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-.5s]" />
    </div>
);

const ChatbotPage = () => {
    const navigate = useNavigate();
    const { showHeader, showBottomNav } = useLayoutStore();

    useEffect(() => {
        showHeader();
        return () => {
            showBottomNav();
        };
    }, [showHeader, showBottomNav]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const sendMessage = async () => {
        if (input.trim() === "") return;
        const userMessage: Message = { text: input, isUser: true };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await api.post("/chatbot/stream", { message: input }, { responseType: "blob" });
            const stream = response.data.stream();
            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let botMessage: Message = { text: "", isUser: false };
            setMessages((prev) => [...prev, botMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setIsLoading(false);
                    break;
                }
                const chunk = decoder.decode(value);
                setMessages((prev) =>
                    prev.map((msg, index) =>
                        index === prev.length - 1 ? { ...msg, text: msg.text + chunk } : msg
                    )
                );
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                text: "An error occurred. Please try again.",
                isUser: false,
            };
            setMessages((prev) => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    return (
        <MobileLayout title="Chatbot" onBack={() => navigate(-1)}>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col-reverse space-y-2">
                        <div ref={messagesEndRef} />
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2 rounded-2xl max-w-xs bg-light4">
                                    <LoadingAnimation />
                                </div>
                            </div>
                        )}
                        {messages
                            .slice()
                            .reverse()
                            .map((msg, index) => (
                                <div key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`px-4 py-2 rounded-2xl max-w-xs ${
                                            msg.isUser ? "bg-primary1 text-white" : "bg-light4"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
                <div className="p-4 bg-white">
                    <div className="flex bg-light4 items-center rounded-full">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            className="flex-1 px-4 bg-light4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage}>
                            <img src="assets/send.svg" alt="전송" className="p-1" />
                        </button>
                    </div>
                </div>
            </div>{" "}
        </MobileLayout>
    );
};

export default ChatbotPage;
