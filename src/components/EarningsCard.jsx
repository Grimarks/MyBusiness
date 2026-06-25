import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowRightIcon, BanknotesIcon } from "@heroicons/react/24/outline";

export default function EarningsCard() {
    const navigate = useNavigate();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const usersSnap = await getDocs(
                    query(collection(db, "users"), where("uid", "==", user.uid))
                );
                if (usersSnap.empty) return;
                const { kedaiName } = usersSnap.docs[0].data();
                const ordersRef = collection(db, "order");
                let snap = await getDocs(
                    query(ordersRef, where("ownerId","==",user.uid), where("status","==",true))
                );
                if (snap.empty) {
                    snap = await getDocs(
                        query(ordersRef, where("ownerName","==",kedaiName), where("status","==",true))
                    );
                }
                setTotal(snap.docs.reduce((s, d) => s + (d.data().amount || 0), 0));
            } catch (e) { console.error(e); }
        });
        return () => unsub();
    }, []);

    return (
        <div
            className="relative overflow-hidden rounded-2xl p-5 text-white"
            style={{ background: "linear-gradient(135deg,#F97316 0%,#EAB308 100%)" }}
        >
            {/* decorative circle */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/10" />

            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <BanknotesIcon className="w-5 h-5 text-white/80" />
                        <span className="text-white/90 text-sm font-medium">Total Pendapatan</span>
                    </div>
                    <button
                        onClick={() => navigate("/pendapatan")}
                        className="flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
                    >
                        Detail <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
                <p className="text-3xl font-bold tracking-tight">
                    Rp {total.toLocaleString("id-ID")}
                </p>
                <p className="text-white/60 text-xs mt-1">Dari semua pesanan selesai</p>
            </div>
        </div>
    );
}
