import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    ClipboardDocumentListIcon,
    BellIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { auth, db } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Header({ greeting, subtitle }) {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            const snap = await getDocs(
                query(collection(db, "users"), where("uid", "==", user.uid))
            );
            if (!snap.empty) setRole(snap.docs[0].data().role);
        });
        return () => unsub();
    }, []);

    const iconBtn = "w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors";

    /* ── Greeting header ── */
    if (greeting && subtitle) {
        return (
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium">{greeting}</p>
                    <h1 className="text-white text-2xl font-bold leading-tight mt-0.5">
                        {subtitle}
                    </h1>
                </div>
                {role === "pelanggan" && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate("/myOrder")} className={iconBtn} aria-label="Pesanan saya">
                            <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                        </button>
                        <button className={iconBtn} aria-label="Notifikasi">
                            <BellIcon className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={() => navigate("/cart")} className={iconBtn} aria-label="Keranjang">
                            <ShoppingCartIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    /* ── Back header ── */
    return (
        <div className="px-4 py-3 flex items-center justify-between">
            <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Kembali"
            >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>

            {role === "pelanggan" && (
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate("/myOrder")} className={iconBtn} aria-label="Pesanan saya">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
                    </button>
                    <button className={iconBtn} aria-label="Notifikasi">
                        <BellIcon className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => navigate("/cart")} className={iconBtn} aria-label="Keranjang">
                        <ShoppingCartIcon className="w-5 h-5 text-white" />
                    </button>
                </div>
            )}
        </div>
    );
}
