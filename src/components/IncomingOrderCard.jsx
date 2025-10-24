import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// Fungsi warna dan teks status
const getStatusColor = (status) => (status ? "bg-green-500" : "bg-orange-500");
const getStatusText = (status) => (status ? "Selesai" : "Menunggu");

export default function IncomingOrderCard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const usersSnap = await getDocs(
                        query(collection(db, "users"), where("uid", "==", user.uid))
                    );

                    if (!usersSnap.empty) {
                        const userData = usersSnap.docs[0].data();

                        if (userData.role === "pemilik") {
                            const orderRef = collection(db, "order");

                            // 🔑 Pakai ownerId (uid pemilik), fallback ke ownerName
                            const qById = query(orderRef, where("ownerId", "==", user.uid));
                            const snapById = await getDocs(qById);

                            let orderSnap = snapById;
                            if (snapById.empty) {
                                const qByName = query(
                                    orderRef,
                                    where("ownerName", "==", userData.kedaiName)
                                );
                                orderSnap = await getDocs(qByName);
                            }

                            const orderList = orderSnap.docs.map((doc) => ({
                                id: doc.id,
                                ...doc.data(),
                            }));

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

    if (loading) return <p>Memuat pesanan...</p>;
    if (orders.length === 0) return <p>Tidak ada pesanan masuk.</p>;

    return (
        <div className="bg-gradient-to-r from-orange-300 to-yellow-200 p-4 sm:p-6 rounded-xl shadow-md max-w-lg w-full mx-auto">
            <h2 className="text-white text-lg sm:text-xl font-semibold mb-3">Pesanan Masuk</h2>
            <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => {
                    // ✅ Ambil nama item dari array items
                    const itemNames = Array.isArray(order.items)
                        ? order.items.map((i) => i.name).join(", ")
                        : "-";

                    return (
                        <div
                            key={order.id}
                            className="bg-white rounded-md p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow gap-2 sm:gap-0"
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-6 h-6 rounded-full ${getStatusColor(order.status)}`}
                                />
                                <div>
                                    <p className="font-semibold">
                                        {order.customerName || "Anonim"}
                                    </p>
                                    <p className="text-sm text-gray-500">{itemNames}</p>
                                    <p className="text-xs text-gray-400 italic">
                                        {getStatusText(order.status)}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <button
                                    onClick={() => navigate("/order", { state: order })}
                                >
                                    ➜
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
