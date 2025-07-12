import { useNavigate } from "react-router-dom";

const navItems = [
    { label: "Home", icon: "assets/home.svg", path: "/home" },
    { label: "Upload", icon: "assets/image.svg", path: "/upload" },
    { label: "Chat", icon: "assets/chat.svg", path: "/chatbot" },
    { label: "Setting", icon: "assets/setting.svg", path: "/setting" },
];

const BottomNavigation = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full w-full bg-white flex justify-around items-center px-4">
            {navItems.map((item, idx) => {
                return (
                    <div
                        key={idx}
                        className="flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => navigate(item.path)}
                    >
                        <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
                        <span className="font-Pretendard text-[12px] font-semibold">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default BottomNavigation;
