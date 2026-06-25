import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

export default function PendapatanPage() {
    const navigate      = useNavigate();
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const usersSnap = await getDocs(query(collection(db,"users"), where("uid","==",user.uid)));
                if (usersSnap.empty) return;
                const { kedaiName } = usersSnap.docs[0].data();
                const ref = collection(db,"order");
                let snap = await getDocs(query(ref, where("ownerId","==",user.uid), where("status","==",true)));
                if (snap.empty) snap = await getDocs(query(ref, where("ownerName","==",kedaiName), where("status","==",true)));
                setEarnings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        });
        return () => unsub();
    }, []);

    const total = earnings.reduce((s, i) => s + (i.amount||0), 0);
    const monthLabel = new Date().toLocaleString("id-ID", { month:"long", year:"numeric" });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div style={{ background:"linear-gradient(160deg,#F97316,#EAB308)", borderRadius:"0 0 24px 24px" }}>
                <div className="flex items-center gap-3 px-4 pt-14 pb-5">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowLeftIcon className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-white font-bold text-xl">Detail Pendapatan</h1>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
            ) : (
                <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
                    {/* Summary card */}
                    <div className="relative overflow-hidden rounded-2xl p-5 text-white" style={{ background:"linear-gradient(135deg,#F97316,#EAB308)" }}>
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                                <BanknotesIcon className="w-4 h-4 text-white/80" />
                                <span className="text-white/80 text-sm capitalize">{monthLabel}</span>
                            </div>
                            <p className="text-3xl font-bold">Rp {total.toLocaleString("id-ID")}</p>
                            <p className="text-white/60 text-xs mt-1">Dari {earnings.length} pesanan selesai</p>
                        </div>
                    </div>

                    {/* Transaction list */}
                    {earnings.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-center">
                            <BanknotesIcon className="w-12 h-12 text-gray-200 mb-3" />
                            <p className="text-gray-400 text-sm">Belum ada pendapatan bulan ini</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl overflow-hidden" style={{ border:"1px solid #F3F4F6" }}>
                            <div className="p-4 border-b border-gray-50">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Riwayat Transaksi</p>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {earnings.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{item.customerName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {item.items?.map((i) => `${i.qty}x ${i.name}`).join(", ") || "-"}
                                            </p>
                                        </div>
                                        <span className="font-bold text-green-600 text-sm">
                                            +Rp {item.amount?.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
