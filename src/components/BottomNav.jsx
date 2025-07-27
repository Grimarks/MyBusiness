import { useNavigate } from "react-router-dom";

const tabs = [
    { icon: "Home", label: "Home", path: "/home" },
    { icon: "Love", label: "Favorite", path: "/favorite" },
    { icon: "Star", label: "Pilihan", path: "/pilihan" },
    { icon: "Chat", label: "Chat", path: "/chatPage" },
    { icon: "User", label: "Akun", path: "/account" },
];

export default function BottomNav({ active }) {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
            {tabs.map((tab) => {
                const isActive = active === tab.label;
                const iconPath = `../src/assets/${tab.icon}${isActive ? "" : "-gray"}.svg`;

                return (
                    <button
                        key={tab.label}
                        onClick={() => navigate(tab.path)}
                        className={`flex flex-col items-center focus:outline-none ${
                            isActive ? "text-orange-500" : "text-gray-400"
                        }`}
                    >
                        <img src={iconPath} alt={tab.label} className="w-5 h-5 mb-1" />
                        <span className="text-xs">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
