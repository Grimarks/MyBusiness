import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig.js";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { getDriveThumbnail } from "../utils/drive";
import Loader from "../components/Loader";
import BottomNav from "../components/BottomNav";

const STATUS_LABEL = {
    false: "⏳ Diproses",
    true:  "✔️ Selesai",
};

export default function MyOrdersPage() {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                setLoading(true);
                const snap = await getDocs(
                    query(collection(db, "order"), where("customerId", "==", user.uid))
                );

                const grouped = {};
                for (const d of snap.docs) {
                    const data    = d.data();
                    const ownerId = data.ownerId;

                    let tokoName  = data.ownerName;
                    let tokoImage = "";
                    try {
                        const tokoSnap = await getDoc(doc(db, "users", ownerId));
                        if (tokoSnap.exists()) {
                            tokoName  = tokoSnap.data().kedaiName || "Kedai Tanpa Nama";
                            tokoImage = getDriveThumbnail(tokoSnap.data().kedaiImage) || "/default-store.png";
                        }
                    } catch (err) {
                        console.error("Gagal ambil toko:", err);
                    }

                    if (!grouped[ownerId]) {
                        grouped[ownerId] = { tokoName, tokoImage, orders: [] };
                    }
                    grouped[ownerId].orders.push({ id: d.id, ...data });
                }

                const result = Object.values(grouped).map((toko) => ({
                    ...toko,
                    orders: toko.orders.sort((a, b) => {
                        if (a.status === false && b.status === true) return -1;
                        if (a.status === true  && b.status === false) return 1;
                        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                    }),
                }));

                setOrders(result);
            } catch (err) {
                console.error("Gagal ambil pesanan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <Loader message="Memuat pesanan..." />;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="flex items-center p-4 bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-md">
                <button onClick={() => navigate(-1)} className="p-2 mr-2">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold">Pesanan Saya</h1>
            </div>

            <div className="p-4 space-y-6">
                {orders.length === 0 ? (
                    <p className="text-center text-gray-500">Belum ada pesanan.</p>
                ) : (
                    orders.map((toko) => (
                        <div key={toko.tokoName} className="bg-white rounded-2xl shadow-md overflow-hidden">
                            <div className="flex items-center gap-3 p-4 border-b">
                                {toko.tokoImage && (
                                    <img
                                        src={getDriveThumbnail(toko.tokoImage, "w100-h100")}
                                        alt={toko.tokoName}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <h2 className="font-bold text-lg">{toko.tokoName}</h2>
                            </div>

                            <div className="divide-y">
                                {toko.orders.map((order) => (
                                    <div key={order.id} className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">
                                                {new Date(order.createdAt?.seconds * 1000).toLocaleString()}
                                            </span>
                                            <span className={`font-medium text-sm ${order.status ? "text-green-600" : "text-orange-600"}`}>
                                                {STATUS_LABEL[order.status]}
                                            </span>
                                        </div>

                                        <ul className="space-y-2 mb-2">
                                            {order.items?.map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <img
                                                        src={getDriveThumbnail(item.image, "w100-h100")}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {item.qty} x Rp{item.price}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold">Rp{item.qty * item.price}</p>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>Rp{order.amount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomNav active="Home" />
        </div>
    );
}
