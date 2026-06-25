import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const BASE_TABS = [
    { icon: "Home",  label: "Home",     path: "/home" },
    { icon: "Love",  label: "Favorite", path: "/favorite" },
    { icon: "Star",  label: "Pilihan",  path: "/pilihan" },
    { icon: "Chat",  label: "Chat",     path: "/chatPage" },
    { icon: "User",  label: "Akun",     path: "/account" },
];

export default function BottomNav({ active }) {
    const [role, setRole] = useState(null);
    const navigate  = useNavigate();
    const location  = useLocation();

    useEffect(() => {
        const fetchRole = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return setRole("guest");
            try {
                const snap = await getDoc(doc(db, "users", userId));
                setRole(snap.exists() ? snap.data().role : "guest");
            } catch {
                setRole("guest");
            }
        };
        fetchRole();
    }, []);

    if (!role) {
        return (
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 h-[68px]" />
        );
    }

    const tabs = BASE_TABS.map((tab) => {
        if (role === "pemilik") {
            if (tab.label === "Favorite") return { ...tab, label: "Add Menu" };
            if (tab.label === "Pilihan")  return { ...tab, label: "Orders" };
        }
        return tab;
    });

    const isActive = (tab) =>
        active === tab.label ||
        location.pathname === tab.path ||
        (role === "pemilik" &&
            ((tab.label === "Add Menu" && active === "Favorite") ||
             (tab.label === "Orders"   && active === "Pilihan")));

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 bg-white"
            style={{
                borderTop: "1px solid #F3F4F6",
                paddingBottom: "env(safe-area-inset-bottom)",
                boxShadow: "0 -4px 20px rgba(0,0,0,.06)",
            }}
        >
            <div className="flex items-center justify-around h-[68px] max-w-lg mx-auto px-2">
                {tabs.map((tab) => {
                    const active = isActive(tab);
                    return (
                        <button
                            key={tab.label}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative focus:outline-none"
                        >
                            {active && (
                                <span
                                    className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-orange-50"
                                    aria-hidden
                                />
                            )}
                            <img
                                src={`/assets/${tab.icon}${active ? "" : "-gray"}.svg`}
                                alt=""
                                className="w-5 h-5 relative z-10"
                            />
                            <span
                                className={`text-[10px] font-semibold relative z-10 transition-colors ${
                                    active ? "text-orange-500" : "text-gray-400"
                                }`}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
