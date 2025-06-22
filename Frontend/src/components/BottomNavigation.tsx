const navItems = [
    { label: "Explore", icon: "../src/assets/explore.svg", active: true },
    { label: "Categories", icon: "../src/assets/categories.svg", active: false },
    { label: "Stores", icon: "../src/assets/stores.svg", active: false },
    { label: "Profile", icon: "../src/assets/profile.svg", active: false },
];

const BottomNavigation = () => {
    return (
        <div className="h-full w-full bg-white flex justify-around items-center px-4">
            {navItems.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center">
                    <img
                        src={item.icon}
                        alt={item.label}
                        className={`w-[20px] h-[20px] mb-1 ${item.active ? "opacity-100" : "opacity-40"}`}
                    />
                    <span
                        className={`font-Pretendard text-[12px] font-normal ${
                            item.active ? "font-semibold" : "text-dark4"
                        }`}
                    >
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default BottomNavigation;
