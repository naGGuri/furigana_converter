import MobileLayout from "../components/MobileLayout";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const menuItems = [
        { label: "Image", icon: "/assets/image_white.svg", path: "/upload" },
        { label: "Text", icon: "/assets/text_white.svg", path: "/text" },
        { label: "AI Chat", icon: "/assets/chat_white.svg", path: "/chatbot" },
        { label: "History", icon: "assets/folder_white.svg", path: "/history" },
    ];

    const handleMenuClick = (path: string, label: string) => {
        // 존재하는 페이지는 이동, 없는 페이지는 알림
        if (path === "/upload" || path === "/chatbot") {
            navigate(path);
        } else {
            alert(`'${label}' page is coming soon!`);
        }
    };

    return (
        <MobileLayout>
            <div className="flex justify-center items-center h-full">
                <div className="flex flex-wrap justify-center gap-6 w-full text-white text-md font-semibold font-Pretendard">
                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            className="w-36 h-36 bg-primary1 rounded-2xl flex flex-col justify-center items-center gap-3 cursor-pointer hover:bg-blue-700 transition-colors"
                            onClick={() => handleMenuClick(item.path, item.label)}
                        >
                            <img className="w-12 h-12" src={item.icon} alt={item.label} />
                            <p className="text-center ">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </MobileLayout>
    );
};

export default HomePage;
