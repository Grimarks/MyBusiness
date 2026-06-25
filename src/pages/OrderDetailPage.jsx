import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getDriveThumbnail } from "../utils/drive";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Header from "../components/Header";

export default function OrderDetailPage() {
    const { state } = useLocation();
    const navigate  = useNavigate();
    const [order, setOrder]   = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state) setOrder(state);
    }, [state]);

    const handleComplete = async () => {
        if (!order?.id) return alert("ID pesanan tidak valid.");
        setLoading(true);
        try {
            await updateDoc(doc(db,"order",order.id), { status:true });
            setOrder({ ...order, status:true });
            alert("Pesanan selesai!");
        } catch { alert("Gagal menyelesaikan pesanan."); }
        finally { setLoading(false); }
    };

    if (!order) return (
        <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">
            Data pesanan tidak ditemukan.
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ background:"linear-gradient(160deg,#F97316,#EAB308)", borderRadius:"0 0 24px 24px" }}>
                <Header />
                <div className="px-5 pb-5">
                    <h1 className="text-white font-bold text-xl">Detail Pesanan</h1>
                    {order.customerName && (
                        <p className="text-white/80 text-sm mt-0.5">Dari: {order.customerName}</p>
                    )}
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
                {/* Status */}
                <div className={`flex items-center gap-3 p-4 rounded-2xl ${order.status ? "bg-green-50" : "bg-orange-50"}`}>
                    <CheckCircleIcon className={`w-6 h-6 ${order.status ? "text-green-500" : "text-orange-400"}`} />
                    <div>
                        <p className={`font-semibold text-sm ${order.status ? "text-green-700" : "text-orange-700"}`}>
                            {order.status ? "Pesanan Selesai" : "Menunggu Konfirmasi"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {order.createdAt?.seconds
                                ? new Date(order.createdAt.seconds*1000).toLocaleString("id-ID")
                                : "-"}
                        </p>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl overflow-hidden" style={{ border:"1px solid #F3F4F6", boxShadow:"0 2px 10px rgba(0,0,0,.05)" }}>
                    <div className="p-4 border-b border-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Item Pesanan</p>
                    </div>
                    {Array.isArray(order.items) && order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0">
                            <img src={getDriveThumbnail(item.image,"w200-h200")} alt={item.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                                {item.note && <p className="text-xs text-gray-400 italic mt-0.5">"{item.note}"</p>}
                            </div>
                            <div className="text-center flex-shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <span className="font-bold text-orange-500">{item.qty}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">pcs</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="bg-white rounded-2xl p-4" style={{ border:"1px solid #F3F4F6" }}>
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-gray-700">Total Pembayaran</p>
                        <p className="text-xl font-bold text-orange-500">
                            Rp {order.amount?.toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                {!order.status && (
                    <button
                        onClick={handleComplete}
                        disabled={loading}
                        className="btn btn-primary btn-full btn-lg"
                    >
                        {loading ? "Memproses..." : "✓ Tandai Selesai"}
                    </button>
                )}

                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-full text-gray-500">
                    Kembali
                </button>
            </div>
        </div>
    );
}
