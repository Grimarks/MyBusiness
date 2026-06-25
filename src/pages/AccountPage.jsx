import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getDriveThumbnail } from "../utils/drive";
import BottomNav from "../components/BottomNav";
import {
    ChevronRightIcon, PencilSquareIcon, CurrencyDollarIcon,
    GlobeAltIcon, QuestionMarkCircleIcon, ShieldCheckIcon,
    StarIcon, ShareIcon, ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const MENU = [
    { label: "Edit Profil",          icon: PencilSquareIcon,       path: "/edit-profile" },
    { label: "Pointku",              icon: CurrencyDollarIcon },
    { label: "Bahasa",               icon: GlobeAltIcon },
    { label: "Tentang Aplikasi",     icon: QuestionMarkCircleIcon },
    { label: "Syarat & Ketentuan",   icon: ShieldCheckIcon },
    { label: "Nilai Aplikasi",       icon: StarIcon },
    { label: "Bagikan Aplikasi",     icon: ShareIcon },
];

export default function AccountPage() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ nama: "", email: "", profileImage: "" });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return navigate("/loginpage");
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
                const d = snap.data();
                setUserData({ nama: d.nama || "", email: d.email || user.email || "", profileImage: d.profileImage || "" });
            }
        });
        return () => unsub();
    }, [navigate]);

    const handleLogout = async () => {
        if (!window.confirm("Yakin ingin keluar?")) return;
        await signOut(auth);
        navigate("/loginpage");
    };

    const imgSrc = getDriveThumbnail(userData.profileImage, "w200-h200");

    return (
        <div className="min-h-screen bg-gray-50 pb-nav">
            {/* Profile header */}
            <div
                className="px-5 pt-14 pb-16 text-center"
                style={{ background: "linear-gradient(160deg,#F97316,#EAB308)" }}
            >
                <div className="relative inline-block">
                    <img src={imgSrc} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                    <button
                        onClick={() => navigate("/edit-profile")}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm"
                    >
                        <PencilSquareIcon className="w-4 h-4 text-orange-500" />
                    </button>
                </div>
                <h1 className="text-white font-bold text-lg mt-3">{userData.nama || "Nama Pengguna"}</h1>
                <p className="text-white/70 text-sm">{userData.email}</p>
            </div>

            {/* Menu */}
            <div className="px-4 -mt-6 max-w-lg mx-auto">
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #F3F4F6", boxShadow: "0 4px 20px rgba(0,0,0,.07)" }}>
                    {MENU.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => item.path && navigate(item.path)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                        >
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <item.icon className="w-5 h-5 text-orange-500" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-gray-800">{item.label}</span>
                            <ChevronRightIcon className="w-4 h-4 text-gray-300" />
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Keluar
                </button>
            </div>

            <BottomNav active="Akun" />
        </div>
    );
}
