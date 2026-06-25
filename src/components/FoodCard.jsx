import React, { useState, useEffect } from "react";
import { XMarkIcon, StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig.js";
import {
    collection, addDoc, deleteDoc, doc, getDocs,
    query, where, updateDoc, serverTimestamp, getDoc,
} from "firebase/firestore";
import { getDriveThumbnail } from "../utils/drive";

/* ── Firestore helpers ── */
const toggleFavorite = async (foodId, isLoved) => {
    const userId = auth.currentUser?.uid || "guest";
    if (isLoved) {
        const q = query(
            collection(db, "favorites"),
            where("foodId", "==", foodId),
            where("userId", "==", userId)
        );
        const snap = await getDocs(q);
        snap.forEach((d) => deleteDoc(doc(db, "favorites", d.id)));
    } else {
        await addDoc(collection(db, "favorites"), { foodId, userId, createdAt: new Date() });
    }
};

const addToCart = async ({ id, title, image, price }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const q    = query(collection(db, "carts"), where("userId","==",userId), where("foodId","==",id));
    const snap = await getDocs(q);
    if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, { quantity: snap.docs[0].data().quantity + 1 });
    } else {
        await addDoc(collection(db, "carts"), {
            userId, foodId: id, name: title, image, price, quantity: 1,
            createdAt: serverTimestamp(),
        });
    }
};

/* ── Component ── */
export default function FoodCard({
    id, image, title, desc, price, rating, review,
    isLoved: initialIsLoved = false,
    onAddToCart,
}) {
    const [isLoved, setIsLoved]     = useState(initialIsLoved);
    const [roleUser, setRoleUser]   = useState("pelanggan");
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus]       = useState(true);
    const navigate = useNavigate();
    const imgSrc   = getDriveThumbnail(image, "w600-h600");

    useEffect(() => {
        getDoc(doc(db, "foods", id)).then((snap) => {
            if (snap.exists()) setStatus(snap.data().status ?? true);
        });
        if (auth.currentUser?.uid) {
            getDoc(doc(db, "users", auth.currentUser.uid)).then((snap) => {
                if (snap.exists()) setRoleUser(snap.data().role);
            });
        }
    }, [id]);

    const handleLove = async (e) => {
        e.stopPropagation();
        const next = !isLoved;
        setIsLoved(next);
        try { await toggleFavorite(id, !next); }
        catch { setIsLoved(!next); }
    };

    const handleToggleStatus = async () => {
        try {
            const next = !status;
            await updateDoc(doc(db, "foods", id), { status: next });
            setStatus(next);
        } catch { alert("Gagal mengubah status!"); }
    };

    return (
        <>
            {/* ── Card ── */}
            <div
                onClick={() => setShowModal(true)}
                className="relative bg-white rounded-2xl overflow-hidden cursor-pointer group"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,.07)", border: "1px solid #F3F4F6" }}
            >
                {/* Image */}
                <div className="relative h-36 overflow-hidden bg-gray-100">
                    <img
                        src={imgSrc}
                        alt={title}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            !status ? "grayscale opacity-60" : ""
                        }`}
                    />
                    {!status && (
                        <span className="absolute top-2 left-2 badge badge-error text-[10px]">Habis</span>
                    )}
                    <button
                        onClick={handleLove}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center"
                        style={{ boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}
                    >
                        {isLoved
                            ? <HeartIcon   className="w-4 h-4 text-red-500" />
                            : <HeartOutline className="w-4 h-4 text-gray-400" />
                        }
                    </button>
                </div>

                {/* Info */}
                <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 h-8">{desc}</p>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                            <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-xs text-gray-500">{rating ?? 0}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            Rp {Number(price).toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Modal ── */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div
                        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden fade-in"
                        style={{ boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}
                    >
                        {/* Image */}
                        <div className="relative h-52">
                            <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center"
                                style={{ boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
                                <span className="text-lg font-bold text-orange-500 whitespace-nowrap">
                                    Rp {Number(price).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                            <div className="flex items-center gap-1.5 py-1">
                                <StarIcon className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-gray-600 font-medium">
                                    {rating ?? 0}
                                </span>
                                <span className="text-sm text-gray-400">
                                    ({review ?? 0} ulasan)
                                </span>
                            </div>

                            {roleUser === "pelanggan" ? (
                                <button
                                    onClick={() => {
                                        if (!status) return;
                                        addToCart({ id, title, image: imgSrc, price });
                                        onAddToCart?.();
                                        setShowModal(false);
                                    }}
                                    disabled={!status}
                                    className="btn btn-primary btn-full"
                                >
                                    {status ? "Tambah ke Keranjang" : "Stok Habis"}
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => { navigate("/edit-food", { state: { foodId: id } }); setShowModal(false); }}
                                        className="btn btn-secondary btn-full"
                                    >
                                        Edit Menu
                                    </button>
                                    <button
                                        onClick={handleToggleStatus}
                                        className={`btn btn-full ${
                                            status ? "btn-danger" : "btn btn-full bg-green-50 text-green-700 rounded-full font-semibold py-3"
                                        }`}
                                    >
                                        {status ? "Tandai Habis" : "Tandai Tersedia"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
