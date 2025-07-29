import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Fungsi warna dan teks status
const getStatusColor = (status) => status ? "bg-green-500" : "bg-orange-500";
const getStatusText = (status) => status ? "Selesai" : "Menunggu";

export default function IncomingOrderCard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Cek user di collection "users"
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("uid", "==", user.uid));
                    const userSnap = await getDocs(q);

                    if (!userSnap.empty) {
                        const userData = userSnap.docs[0].data();

                        if (userData.role === "pemilik") {
                            const ownerName = userData.nama;

                            // Ambil pesanan dari collection "order" sesuai ownerName
                            const orderRef = collection(db, "order");
                            const orderQuery = query(orderRef, where("ownerName", "==", ownerName));
                            const orderSnap = await getDocs(orderQuery);

                            const orderList = orderSnap.docs.map(doc => doc.data());
                            setOrders(orderList);
                        }
                    }
                } catch (error) {
                    console.error("Gagal mengambil data:", error);
                } finally {
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <p>Memuat pesanan...</p>;
    }

    if (orders.length === 0) {
        return <p>Tidak ada pesanan masuk.</p>;
    }

    return (
        <div className="bg-gradient-to-r from-orange-300 to-yellow-200 p-4 rounded-xl shadow-md">
            <h2 className="text-white text-lg font-semibold mb-2">Pesanan Masuk</h2>
            <div className="space-y-2">
                {orders.map((order, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-md p-3 flex items-center justify-between shadow"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full ${getStatusColor(order.status)}`} />
                            <div>
                                <p className="font-semibold">{order.customerName || "Anonim"}</p>
                                <p className="text-sm text-gray-500">{order.orderDetails || "Pesanan tidak tersedia"}</p>
                                <p className="text-xs text-gray-400 italic">{getStatusText(order.status)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-600 font-semibold">
                                Rp {(order.amount ?? 0).toLocaleString("id-ID")}
                            </p>
                            <p className="text-gray-600 text-xl leading-none">➜</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
