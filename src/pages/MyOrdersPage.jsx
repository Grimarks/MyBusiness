import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig.js";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { ArrowLeftIcon, ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { getDriveThumbnail } from "../utils/drive";
import Loader from "../components/Loader";
import BottomNav from "../components/BottomNav";

const STATUS = { false: { label: "Diproses", class: "badge-warning" }, true: { label: "Selesai", class: "badge-success" } };

export default function MyOrdersPage() {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const user = auth.currentUser; if (!user) return;
            try {
                const snap = await getDocs(query(collection(db,"order"), where("customerId","==",user.uid)));
                const grouped = {};
                for (const d of snap.docs) {
                    const data = d.data(); const ownerId = data.ownerId;
                    let tokoName = data.ownerName, tokoImage = "";
                    try {
                        const ts = await getDoc(doc(db,"users",ownerId));
                        if (ts.exists()) { tokoName = ts.data().kedaiName||"Kedai"; tokoImage = getDriveThumbnail(ts.data().kedaiImage)||""; }
                    } catch {}
                    if (!grouped[ownerId]) grouped[ownerId] = { tokoName, tokoImage, orders:[] };
                    grouped[ownerId].orders.push({ id: d.id, ...data });
                }
                setOrders(Object.values(grouped).map((t) => ({
                    ...t, orders: t.orders.sort((a,b) => {
                        if (a.status===false && b.status===true) return -1;
                        if (a.status===true  && b.status===false) return 1;
                        return (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0);
                    })
                })));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <Loader message="Memuat pesanan..." />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ background:"linear-gradient(160deg,#F97316,#EAB308)", borderRadius:"0 0 24px 24px" }}>
                <div className="flex items-center gap-3 px-4 pt-14 pb-5">
                    <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowLeftIcon className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-white font-bold text-xl">Pesanan Saya</h1>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-5 pb-nav space-y-4">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <ClockIcon className="w-14 h-14 text-gray-200 mb-3" />
                        <p className="text-gray-400 text-sm">Belum ada pesanan</p>
                    </div>
                ) : (
                    orders.map((toko) => (
                        <div key={toko.tokoName} className="bg-white rounded-2xl overflow-hidden" style={{ border:"1px solid #F3F4F6", boxShadow:"0 2px 10px rgba(0,0,0,.06)" }}>
                            <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                                {toko.tokoImage && (
                                    <img src={getDriveThumbnail(toko.tokoImage,"w100-h100")} alt="" className="w-10 h-10 rounded-xl object-cover" />
                                )}
                                <h2 className="font-bold text-sm text-gray-900">{toko.tokoName}</h2>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {toko.orders.map((order) => (
                                    <div key={order.id} className="p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs text-gray-400">
                                                {order.createdAt?.seconds
                                                    ? new Date(order.createdAt.seconds*1000).toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" })
                                                    : "-"}
                                            </span>
                                            <span className={`badge text-[10px] ${STATUS[order.status]?.class}`}>
                                                {STATUS[order.status]?.label}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <img src={getDriveThumbnail(item.image,"w80-h80")} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-400">{item.qty}x · Rp{item.price?.toLocaleString("id-ID")}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-900">Rp{(item.qty*item.price).toLocaleString("id-ID")}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                            <span className="text-sm text-gray-500">Total</span>
                                            <span className="font-bold text-orange-500">Rp{order.amount?.toLocaleString("id-ID")}</span>
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
