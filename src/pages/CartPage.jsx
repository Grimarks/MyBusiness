import React, { useEffect, useState } from "react";
import {
    collection, query, where, getDocs, updateDoc, deleteDoc, doc, addDoc, getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { getDriveThumbnail } from "../utils/drive";
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";

const ADMIN_FEE = 1000;

export default function CartPage() {
    const navigate = useNavigate();
    const [items, setItems]           = useState([]);
    const [delivery, setDelivery]     = useState("pickup");
    const [address, setAddress]       = useState("");
    const [ordering, setOrdering]     = useState(false);

    const subTotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
    const total    = subTotal + ADMIN_FEE;

    const fetchCart = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const snap = await getDocs(query(collection(db, "carts"), where("userId","==",user.uid)));
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((user) => { if (user) fetchCart(); });
        return () => unsub();
    }, []);

    const updateQty = async (itemId, qty) => {
        const ref = doc(db, "carts", itemId);
        if (qty < 1) await deleteDoc(ref);
        else await updateDoc(ref, { quantity: qty });
        fetchCart();
    };

    const handleOrder = async () => {
        const user = auth.currentUser;
        if (!user) return;
        setOrdering(true);
        try {
            const userDoc      = await getDoc(doc(db, "users", user.uid));
            const customerName = userDoc.exists() ? userDoc.data().nama : "Anonim";
            const grouped      = {};

            for (const item of items) {
                const foodSnap = await getDoc(doc(db, "foods", item.foodId));
                if (!foodSnap.exists()) continue;
                const ownerId = foodSnap.data().uid;
                if (!grouped[ownerId]) grouped[ownerId] = [];
                grouped[ownerId].push({ name: item.name, qty: item.quantity, image: item.image, note: item.note || "", price: item.price });
            }

            for (const [ownerId, ownerItems] of Object.entries(grouped)) {
                await addDoc(collection(db, "order"), {
                    customerId: user.uid, customerName, ownerId,
                    amount: ownerItems.reduce((s, i) => s + i.price * i.qty, 0),
                    status: false, items: ownerItems, createdAt: new Date(),
                });
            }
            for (const item of items) await deleteDoc(doc(db, "carts", item.id));
            navigate("/thankyou");
        } catch { alert("Gagal memproses pesanan."); }
        finally { setOrdering(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}>
                <Header />
                <div className="px-5 pb-5">
                    <h1 className="text-white font-bold text-xl">Keranjang Belanja</h1>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-5 pb-32 space-y-4">
                {/* Delivery method */}
                <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F3F4F6", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Metode Pengambilan</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { val: "pickup",   label: "Ambil Sendiri", icon: "🏪" },
                            { val: "delivery", label: "Diantar",       icon: "🛵" },
                        ].map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => setDelivery(opt.val)}
                                className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                    delivery === opt.val
                                        ? "border-orange-500 bg-orange-50 text-orange-600"
                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                }`}
                            >
                                <span className="text-base">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {delivery === "delivery" && (
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Isi alamat lengkap kamu..."
                            className="input input-muted mt-3 text-sm"
                        />
                    )}
                </div>

                {/* Items */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                        <ShoppingCartIcon className="w-14 h-14 text-gray-200 mb-3" />
                        <p className="text-gray-400 text-sm">Keranjang kamu masih kosong</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center gap-3" style={{ border: "1px solid #F3F4F6", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
                                <img
                                    src={getDriveThumbnail(item.image)}
                                    alt={item.name}
                                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                                    <p className="text-orange-500 text-sm font-bold mt-0.5">
                                        Rp {item.price.toLocaleString("id-ID")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => updateQty(item.id, item.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                    >
                                        {item.quantity === 1 ? <TrashIcon className="w-3.5 h-3.5 text-red-400" /> : <MinusIcon className="w-3.5 h-3.5 text-gray-600" />}
                                    </button>
                                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.id, item.quantity + 1)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                        style={{ background: "linear-gradient(135deg,#F97316,#EAB308)" }}
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {items.length > 0 && (
                    <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F3F4F6", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Ringkasan Pembayaran</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>Rp {subTotal.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Biaya admin</span>
                                <span>Rp {ADMIN_FEE.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="divider my-2" />
                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                <span>Total</span>
                                <span className="text-orange-500">Rp {total.toLocaleString("id-ID")}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CTA */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4" style={{ borderTop: "1px solid #F3F4F6", boxShadow: "0 -4px 20px rgba(0,0,0,.06)" }}>
                    <div className="max-w-lg mx-auto">
                        <button
                            onClick={handleOrder}
                            disabled={ordering}
                            className="btn btn-primary btn-full btn-lg"
                        >
                            {ordering ? "Memproses..." : `Pesan Sekarang • Rp ${total.toLocaleString("id-ID")}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
