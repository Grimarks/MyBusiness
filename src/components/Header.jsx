import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { auth, db } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Header({ greeting, subtitle }) {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    // ambil role user saat login
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
        "bg-white text-black p-2 rounded-full shadow hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50";

    const iconImageStyle = "w-6 h-6 object-contain";

    const iconButtonStyle =
        "p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-200";

    // Header dengan greeting (misal halaman utama)
    if (greeting && subtitle) {
        return (
            <div className="relative p-4 text-white">
                {/* icon hanya muncul jika role = pelanggan */}
                {role === "pelanggan" && (
                    <div className="absolute top-4 right-4 flex gap-3 sm:gap-4">
                        <button className={iconButtonStyle}>
                            <img
                                src="/assets/Bell.svg"
                                alt="Bell Icon"
                                className={iconImageStyle}
                            />
                        </button>
                        <button
                            onClick={() => navigate("/cart")}
                            className={iconButtonStyle}
                        >
                            <img
                                src="/assets/Keranjang.svg"
                                alt="Cart Icon"
                                className={iconImageStyle}
                            />
                        </button>
                    </div>
                )}
                <br />
                <h1 className="text-2xl font-bold sm:text-3xl">{greeting}</h1>
                <h1 className="text-2xl font-bold sm:text-3xl">
                    <span className="text-yellow-400">{subtitle}</span>
                </h1>
            </div>
        );
    }

    // Header dengan back button
    return (
        <div className="p-4 text-white">
            <div className="container mx-auto flex items-center justify-between max-w-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className={backButtonStyle}
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>

                {/* icon hanya muncul jika role = pelanggan */}
                {role === "pelanggan" && (
                    <div className="flex items-center space-x-3">
                        <button className={iconButtonStyle}>
                            <img
                                src="/assets/Bell.svg"
                                alt="Bell Icon"
                                className={iconImageStyle}
                            />
                        </button>
                        <button
                            onClick={() => navigate("/cart")}
                            className={iconButtonStyle}
                        >
                            <img
                                src="/assets/Keranjang.svg"
                                alt="Cart Icon"
                                className={iconImageStyle}
                            />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
