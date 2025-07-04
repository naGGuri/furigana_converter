import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
    { label: "Chat", icon: "assets/chat.svg", path: "/chatbot" },
    { label: "Upload", icon: "assets/image.svg", path: "/upload" },
    { label: "Profile", icon: "assets/profile.svg", path: "/profile" },
];

const BottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="h-full w-full bg-white flex justify-around items-center px-4">
            {navItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                    <div
                        key={idx}
                        className="flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => navigate(item.path)}
                    >
                        <img
                            src={item.icon}
                            alt={item.label}
                            className={`w-6 h-6 mb-1 ${isActive ? "opacity-100" : "opacity-40"}`}
                        />
                        <span
                            className={`font-Pretendard text-[12px] font-semibold ${
                                isActive ? "opacity-100" : "opacity-40"
                            } `}
                        >
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default BottomNavigation;
