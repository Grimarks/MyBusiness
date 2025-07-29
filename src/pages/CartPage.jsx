import React, { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

// Ikon Minus
const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
);

// Ikon Plus
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);



export default function CartPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [deliveryMethod, setDeliveryMethod] = useState("pickup");
    const [address, setAddress] = useState("");

    const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const adminFee = 1000;
    const totalPayment = subTotal + adminFee;

    const fetchCart = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "carts"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const cartItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(cartItems);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) fetchCart();
        });

        return () => unsubscribe();
    }, []);

    const updateQuantity = async (itemId, newQuantity) => {
        const itemRef = doc(db, "carts", itemId);

        if (newQuantity < 1) {
            await deleteDoc(itemRef);
        } else {
            await updateDoc(itemRef, { quantity: newQuantity });
        }

        // Refresh data
        fetchCart();
    };

    return (

        <div className="min-h-screen pb-28 bg-white">
            {/* Area Header */}
            <div className="relative h-28 bg-gradient-to-br from-orange-500 to-yellow-400">
                <Header />
            </div>

            {/* Konten utama putih */}
            <div className="relative z-10 -mt-8 rounded-t-2xl">
                <div className="p-5 bg-white min-h-screen rounded-4xl">
                    <h2 className="text-xl font-bold mb-4 text-center">Pesanan kamu!</h2>

                    {/* Metode Pengiriman */}
                    <div className="bg-gray-100 rounded-xl p-4 mb-5">
                        <div className="space-y-3">
                            {["pickup", "delivery"].map(method => (
                                <label key={method} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="delivery"
                                        value={method}
                                        checked={deliveryMethod === method}
                                        onChange={() => setDeliveryMethod(method)}
                                        className="sr-only peer"
                                    />
                                    <span className="w-5 h-5 border-2 rounded-full flex items-center justify-center peer-checked:border-orange-500">
                                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block peer-checked:opacity-100 opacity-0" />
                                    </span>
                                    <span className={`font-semibold ${deliveryMethod === method ? "text-black" : "text-gray-500"}`}>
                                        {method === "pickup" ? "Ambil di tempat" : "Di antar"}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {deliveryMethod === "delivery" && (
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Isi dengan alamat pengantaran"
                                className="w-full mt-3 p-2.5 bg-gray-200 border-none rounded-md text-sm focus:ring-1 focus:ring-orange-500"
                            />
                        )}
                    </div>

                    {/* Daftar Item */}
                    <div className="space-y-4 mb-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center bg-white rounded-xl p-3 shadow-md border border-gray-100">
                                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                                <div className="ml-4 flex-1">
                                    <p className="font-semibold text-base">{item.name}</p>
                                    <p className="text-sm text-gray-700 font-medium">Rp {item.price.toLocaleString("id-ID")}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
                                    >
                                        <MinusIcon />
                                    </button>
                                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-500 text-white"
                                    >
                                        <PlusIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detail Pembayaran */}
                    <div className="space-y-1.5">
                        <p className="text-base font-bold mb-2">Detail pembayaran</p>
                        <div className="flex justify-between text-sm text-gray-600">
                            <p>Sub Total</p>
                            <p>Rp {subTotal.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <p>Biaya Admin</p>
                            <p>Rp {adminFee.toLocaleString("id-ID")}</p>
                        </div>
                        <hr className="my-2 border-dashed" />
                        <div className="flex justify-between font-bold text-base">
                            <p>Total Pembayaran</p>
                            <p>Rp {totalPayment.toLocaleString("id-ID")}</p>
                        </div>
                    </div>
                </div>

                {/* Tombol Pesan */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                    <button
                        onClick={() => navigate("/thankyou")}
                        className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-full text-3xl shadow-lg hover:bg-yellow-300 transition"
                    >
                        Pesan Sekarang
                    </button>
                </div>

            </div>
        </div>
    );
}
