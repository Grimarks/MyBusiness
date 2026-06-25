import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ClockIcon, CheckCircleIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function IncomingOrderCard() {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const usersSnap = await getDocs(
                    query(collection(db, "users"), where("uid","==",user.uid))
                );
                if (usersSnap.empty) return;
                const userData = usersSnap.docs[0].data();
                if (userData.role !== "pemilik") return;

                const orderRef = collection(db, "order");
                let snap = await getDocs(query(orderRef, where("ownerId","==",user.uid)));
                if (snap.empty) {
                    snap = await getDocs(query(orderRef, where("ownerName","==",userData.kedaiName)));
                }
                setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (e) { console.error(e); }
            finally     { setLoading(false); }
        });
        return () => unsub();
    }, []);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1,2].map((i) => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="flex flex-col items-center py-10 text-gray-400">
                <ClockIcon className="w-10 h-10 mb-2" />
                <p className="text-sm font-medium">Belum ada pesanan masuk</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {orders.map((order) => {
                const items = Array.isArray(order.items)
                    ? order.items.map((i) => i.name).join(", ")
                    : "-";
                return (
                    <button
                        key={order.id}
                        onClick={() => navigate("/order", { state: order })}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors text-left"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            order.status ? "bg-green-100" : "bg-orange-100"
                        }`}>
                            {order.status
                                ? <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                : <ClockIcon       className="w-5 h-5 text-orange-500" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {order.customerName || "Anonim"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{items}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`badge text-[10px] ${
                                order.status ? "badge-success" : "badge-warning"
                            }`}>
                                {order.status ? "Selesai" : "Proses"}
                            </span>
                            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
