import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig.js";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    updateDoc,
    serverTimestamp,
    getDoc,
} from "firebase/firestore";

// === Helpers ===
const getDriveThumbnail = (url, size = "w200-h200") => {
    if (!url) return "/default-food.png";
    const ucMatch = url.match(/id=([^&]+)/);
    if (ucMatch) return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=${size}`;
    const dMatch = url.match(/\/d\/([^/]+)\//);
    if (dMatch) return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=${size}`;
    return url;
};

const addToFavorites = async (foodId) => {
    const userId = auth.currentUser?.uid || "guest";
    const favoritesRef = collection(db, "favorites");
    await addDoc(favoritesRef, {
        foodId,
        userId,
        createdAt: new Date(),
    });
};

const removeFromFavorites = async (foodId) => {
    const userId = auth.currentUser?.uid || "guest";
    const favoritesRef = collection(db, "favorites");
    const q = query(favoritesRef, where("foodId", "==", foodId), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (docFav) => {
        await deleteDoc(doc(db, "favorites", docFav.id));
    });
};

const addToCart = async ({ id, title, image, price }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const cartRef = collection(db, "carts");
    const q = query(cartRef, where("userId", "==", userId), where("foodId", "==", id));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const cartDoc = snapshot.docs[0];
        await updateDoc(cartDoc.ref, {
            quantity: cartDoc.data().quantity + 1,
        });
    } else {
        await addDoc(cartRef, {
            userId,
            foodId: id,
            name: title,
            image,
            price,
            quantity: 1,
            createdAt: serverTimestamp(),
        });
    }
};

// === Component ===
export default function FoodCard({
                                     id,
                                     image,
                                     title,
                                     desc,
                                     price,
                                     rating,
                                     review,
                                     role = "pelanggan",
                                     isLoved: initialIsLoved = false,
                                     onAddToCart,
                                 }) {
    const [isLoved, setIsLoved] = useState(initialIsLoved);
    const [roleUser, setRoleUser] = useState("pelanggan");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const imgSrc = getDriveThumbnail(image, "w600-h600");
    const [status, setStatus] = useState(true); // default ready

    useEffect(() => {
        const fetchStatus = async () => {
            const foodRef = doc(db, "foods", id);
            const foodSnap = await getDoc(foodRef);
            if (foodSnap.exists()) {
                setStatus(foodSnap.data().status ?? true);
            }
        };
        fetchStatus();
    }, [id]);


    const toggleLove = async () => {
        const newLoveState = !isLoved;
        setIsLoved(newLoveState);

        try {
            if (newLoveState) await addToFavorites(id);
            else await removeFromFavorites(id);
        } catch (err) {
            console.error("Gagal memperbarui favorit:", err);
        }
    };

    useEffect(() => {
        const fetchRole = async () => {
            const userId = auth.currentUser?.uid;
            if (!userId) return;
            const userRef = doc(db, "users", userId);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                setRoleUser(snap.data().role);
            }
        };
        fetchRole();
    }, []);

    return (
        <>
            {/* === Kartu Utama === */}
            <div
                className="relative bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => setShowModal(true)}
            >
                {!status && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Habis
                    </span>
                )}

                {/* Love Icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLove();
                    }}
                    className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-sm"
                >
                    <img
                        src={isLoved ? "../assets/Love.svg" : "../assets/Love-gray.svg"}
                        alt="favorite"
                        className="h-6 w-6"
                    />
                </button>

                {/* Image */}
                <div className="rounded-xl h-32 w-full overflow-hidden mb-2 sm:mb-3">
                    <img
                        src={imgSrc}
                        alt={title}
                        className={`w-full h-full object-cover transition ${
                            !status ? "grayscale opacity-60" : ""
                        }`}
                    />
                </div>

                {/* Title & Description */}
                <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                    {title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 h-10 overflow-hidden">
                    {desc}
                </p>

                {/* Rating, Price */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center text-orange-500 text-xs sm:text-sm gap-1">
                        <StarIcon className="w-4 h-4" />
                        {rating} ({review})
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-700">
                        Rp {price}
                    </span>
                </div>
            </div>

            {/* === Modal Detail === */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-md p-5 relative">
                        {/* Close */}
                        {/* Close */}
                        <button
                            className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow-md"
                            onClick={() => setShowModal(false)}
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>

                        {/* Gambar besar */}
                        <img
                            src={imgSrc}
                            alt={title}
                            className="w-full h-48 object-cover rounded-xl mb-4"
                        />

                        {/* Detail */}
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
                        <p className="text-gray-600 mb-3">{desc}</p>

                        <div className="flex items-center gap-2 mb-4">
                            <StarIcon className="w-5 h-5 text-orange-500" />
                            <span className="text-gray-700 text-sm">
                                {rating} ({review} ulasan)
                            </span>
                        </div>

                        <p className="text-lg font-semibold text-gray-800 mb-5">
                            Rp {price}
                        </p>

                        {/* Tombol aksi */}
                        {roleUser === "pelanggan" ? (
                            <button
                                onClick={() => {
                                    if (!status) return; // jangan tambah ke keranjang jika habis
                                    addToCart({ id, title, image: imgSrc, price });
                                    onAddToCart && onAddToCart();
                                    setShowModal(false);
                                }}
                                disabled={!status}
                                className={`w-full font-semibold py-2 rounded-lg transition ${
                                    status
                                        ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                }`}
                            >
                                {status ? "Tambahkan ke keranjang" : "Habis"}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        navigate("/edit-food", { state: { foodId: id } });
                                        setShowModal(false);
                                    }}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition mb-2"
                                >
                                    Edit makanan
                                </button>

                                {/* === Tombol Ubah Status Ready/Habis === */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const foodRef = doc(db, "foods", id);
                                            const newStatus = !status;
                                            await updateDoc(foodRef, { status: newStatus });
                                            setStatus(newStatus);
                                            alert(`Status makanan diubah menjadi ${newStatus ? "READY" : "HABIS"}`);
                                        } catch (err) {
                                            console.error("Gagal mengubah status:", err);
                                            alert("Gagal mengubah status makanan!");
                                        }
                                    }}
                                    className={`w-full ${
                                        status ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                    } text-white font-semibold py-2 rounded-lg transition`}
                                >
                                    {status ? "Tandai Habis" : "Tandai Ready"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
