import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const baseTabs = [
    { icon: "Home", label: "Home", path: "/home" },
    { icon: "Love", label: "Favorite", path: "/favorite" },
    { icon: "Star", label: "Pilihan", path: "/pilihan" },
    { icon: "Chat", label: "Chat", path: "/chatPage" },
    { icon: "User", label: "Akun", path: "/account" },
];

export default function BottomNav({ active }) {
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRole = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return setRole("guest");
            try {
                const userRef = doc(db, "users", userId);
                const snap = await getDoc(userRef);
                if (snap.exists()) setRole(snap.data().role);
                else setRole("guest");
            } catch (err) {
                console.error("Gagal ambil role user:", err);
                setRole("guest");
            }
        };
        fetchRole();
    }, []);

    if (!role)
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 z-50 text-gray-400 text-sm">
                ...
            </div>
        );

    // ubah label sesuai role, tapi path tetap sama
    const adjustedTabs = baseTabs.map((tab) => {
        if (role === "pemilik") {
            if (tab.label === "Favorite") return { ...tab, label: "Add Menu" };
            if (tab.label === "Pilihan") return { ...tab, label: "Orders" };
        }
        return tab;
    });

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
            {adjustedTabs.map((tab) => {
                const isActive = active === tab.label ||
                    (role === "pemilik" &&
                        ((tab.label === "Add Menu" && active === "Favorite") ||
                            (tab.label === "Orders" && active === "Pilihan")));

                const iconPath = `../assets/${tab.icon}${isActive ? "" : "-gray"}.svg`;

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
