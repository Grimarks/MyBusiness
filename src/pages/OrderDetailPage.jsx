import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function OrderDetailPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    // ✅ Ambil data dari state (dikirim dari IncomingOrderCard)
    useEffect(() => {
        if (location.state) {
            setOrder(location.state);
        } else {
            console.error("⚠️ Data order tidak ditemukan");
        }
    }, [location.state]);

    const handleComplete = async () => {
        if (!order?.id) {
            alert("ID pesanan tidak valid.");
            return;
        }
        try {
            const orderRef = doc(db, "order", order.id);
            await updateDoc(orderRef, { status: true }); // update ke Firestore
            alert("Pesanan selesai!");
            navigate(-1); // kembali
        } catch (err) {
            console.error("Gagal update pesanan:", err);
            alert("Gagal menyelesaikan pesanan.");
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Data pesanan tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
            <Header title={order.customerName ? `Cust ${order.customerName}` : "Detail Pesanan"} />
            <div className="p-4 max-w-md mx-auto bg-white rounded-2xl shadow-md mt-4 space-y-4">
                <h2 className="text-xl font-bold">Pesanan:</h2>

                {/* ✅ Render detail items */}
                {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between border-b pb-2 mb-2"
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    {item.note && (
                                        <p className="text-xs text-gray-500 italic">
                                            Catatan: {item.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-200 px-3 py-1 rounded-lg text-center">
                                <p className="text-sm">Jumlah</p>
                                <p className="text-xl font-bold">{item.qty}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Tidak ada detail item.</p>
                )}

                {/* ✅ Total pembayaran */}
                <div className="flex justify-between items-center border-t pt-3">
                    <p className="font-semibold">Total Pembayaran</p>
                    <p className="text-lg font-bold text-orange-600">
                        Rp {order.amount?.toLocaleString("id-ID")}
                    </p>
                </div>

                {/* ✅ Tombol pesanan selesai */}
                {!order.status && (
                    <button
                        onClick={handleComplete}
                        className="w-full mt-4 bg-yellow-400 text-black font-bold py-3 rounded-full flex items-center justify-center hover:bg-yellow-500 transition"
                    >
                        Pesanan Selesai
                    </button>
                )}
            </div>
        </div>
    );
}
