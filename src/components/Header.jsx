import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { auth, db } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Header({ greeting, subtitle }) {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const usersSnap = await getDocs(
                    query(collection(db, "users"), where("uid", "==", user.uid))
                );
                if (!usersSnap.empty) {
                    const userData = usersSnap.docs[0].data();
                    setRole(userData.role);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const backButtonStyle =
        "bg-white text-black p-2 sm:p-2.5 rounded-full shadow hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50";
    const iconImageStyle = "h-5 w-5 sm:h-6 sm:w-6 object-contain";
    const iconButtonStyle =
        "p-1.5 sm:p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-200";

    // ✅ Header greeting
    if (greeting && subtitle) {
        return (
            <div className="relative px-4 pt-4 pb-2 sm:px-6 sm:pt-6 text-white max-w-5xl mx-auto w-full">
                {role === "pelanggan" && (
                    <div className="absolute top-3 right-4 flex gap-2 sm:gap-4">
                        <button onClick={() => navigate("/myOrder")} className={iconButtonStyle}>
                            <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                        </button>
                        <button className={iconButtonStyle}>
                            <img src="/assets/Bell.svg" alt="Bell" className={iconImageStyle} />
                        </button>
                        <button onClick={() => navigate("/cart")} className={iconButtonStyle}>
                            <img src="/assets/Keranjang.svg" alt="Cart" className={iconImageStyle} />
                        </button>
                    </div>
                )}

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{greeting}</h1>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                    <span className="text-yellow-400">{subtitle}</span>
                </h1>
            </div>
        );
    }

    // ✅ Header dengan tombol kembali
    return (
        <div className="px-4 sm:px-6 py-3 text-white w-full max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className={backButtonStyle}>
                    <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {role === "pelanggan" && (
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            onClick={() => navigate("/myOrder")}
                            className={iconButtonStyle}
                        >
                            <ClipboardDocumentListIcon className="h-6 w-6 text-orange-600" />
                        </button>
                        <button className={iconButtonStyle}>
                            <img src="/assets/Bell.svg" alt="Bell" className={iconImageStyle} />
                        </button>
                        <button onClick={() => navigate("/cart")} className={iconButtonStyle}>
                            <img src="/assets/Keranjang.svg" alt="Cart" className={iconImageStyle} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
