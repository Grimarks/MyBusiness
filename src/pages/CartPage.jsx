import React, { useEffect, useState } from "react";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    addDoc,
    getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const getDriveThumbnail = (url, size = "w200-h200") => {
    if (!url) return null;
    const ucMatch = url.match(/id=([^&]+)/);
    if (ucMatch) return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=${size}`;
    const dMatch = url.match(/\/d\/([^/]+)\//);
    if (dMatch) return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=${size}`;
    return url;
};

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
        const cartItems = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setItems(cartItems);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchCart();
        });
        return () => unsubscribe();
    }, []);

    const updateQuantity = async (itemId, newQuantity) => {
        const itemRef = doc(db, "carts", itemId);
        if (newQuantity < 1) await deleteDoc(itemRef);
        else await updateDoc(itemRef, { quantity: newQuantity });
        fetchCart();
    };

    const handleOrderNow = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const customerName = userDoc.exists() ? userDoc.data().nama : "Anonim";
            const groupedByOwner = {};

            for (const item of items) {
                const foodSnap = await getDoc(doc(db, "foods", item.foodId));
                if (!foodSnap.exists()) continue;
                const foodData = foodSnap.data();
                const ownerId = foodData.uid;

                if (!groupedByOwner[ownerId]) groupedByOwner[ownerId] = [];
                groupedByOwner[ownerId].push({
                    name: item.name,
                    qty: item.quantity,
                    image: item.image,
                    note: item.note || "",
                    price: item.price,
                });
            }

            for (const [ownerId, ownerItems] of Object.entries(groupedByOwner)) {
                const total = ownerItems.reduce((sum, it) => sum + it.price * it.qty, 0);
                await addDoc(collection(db, "order"), {
                    customerId: user.uid,
                    customerName,
                    ownerId,
                    amount: total,
                    status: false,
                    items: ownerItems,
                    createdAt: new Date(),
                });
            }

            for (const item of items) {
                await deleteDoc(doc(db, "carts", item.id));
            }

            alert("Pesanan berhasil dibuat!");
            navigate("/thankyou");
        } catch (err) {
            console.error("Gagal membuat pesanan:", err);
            alert("Gagal memproses pesanan.");
        }
    };

    return (
        <div className="min-h-screen bg-white pb-28 flex flex-col">
            <div className="relative h-24 sm:h-28 bg-gradient-to-br from-orange-500 to-yellow-400">
                <Header />
            </div>

            <div className="relative z-10 -mt-6 sm:-mt-8 rounded-t-2xl bg-white flex-1">
                <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full">
                    <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
                        Pesanan kamu!
                    </h2>

                    <div className="bg-gray-100 rounded-xl p-3 sm:p-4 mb-5">
                        <div className="space-y-2 sm:space-y-3">
                            {["pickup", "delivery"].map((method) => (
                                <label key={method} className="flex items-center gap-3 cursor-pointer">
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
                                placeholder="Isi alamat pengantaran"
                                className="w-full mt-3 p-2.5 bg-gray-200 border-none rounded-md text-sm focus:ring-1 focus:ring-orange-500"
                            />
                        )}
                    </div>

                    {/* Daftar item */}
                    <div className="space-y-3 sm:space-y-4 mb-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center bg-white rounded-xl p-3 sm:p-4 shadow-md border border-gray-100"
                            >
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-md overflow-hidden flex-shrink-0">
                                    <img src={getDriveThumbnail(item.image)} alt={item.name}
                                         className="w-full h-full object-cover" />
                                </div>
                                <div className="ml-3 sm:ml-4 flex-1">
                                    <p className="font-semibold text-sm sm:text-base">{item.name}</p>
                                    <p className="text-xs sm:text-sm text-gray-700 font-medium">
                                        Rp {item.price.toLocaleString("id-ID")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
                                    >
                                        <MinusIcon />
                                    </button>
                                    <span className="font-bold w-5 text-center text-sm sm:text-base">
                    {item.quantity}
                  </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-full bg-orange-500 text-white"
                                    >
                                        <PlusIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detail pembayaran */}
                    <div className="space-y-1.5 text-sm sm:text-base">
                        <p className="font-bold mb-2">Detail pembayaran</p>
                        <div className="flex justify-between text-gray-600">
                            <p>Sub Total</p><p>Rp {subTotal.toLocaleString("id-ID")}</p>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <p>Biaya Admin</p><p>Rp {adminFee.toLocaleString("id-ID")}</p>
                        </div>
                        <hr className="my-2 border-dashed" />
                        <div className="flex justify-between font-bold">
                            <p>Total Pembayaran</p>
                            <p>Rp {totalPayment.toLocaleString("id-ID")}</p>
                        </div>
                    </div>
                </div>

                {/* Tombol pesanan */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                    <button
                        onClick={handleOrderNow}
                        className="w-full bg-yellow-400 text-black font-bold py-3 sm:py-3.5 text-lg sm:text-xl rounded-full shadow-lg hover:bg-yellow-300 transition"
                    >
                        Pesan Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
}
