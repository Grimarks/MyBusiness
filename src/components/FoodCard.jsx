import React, { useState, useEffect } from "react";
import { PlusCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
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
    if (ucMatch)
        return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=${size}`;

    const dMatch = url.match(/\/d\/([^/]+)\//);
    if (dMatch)
        return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=${size}`;

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

    const q = query(
        favoritesRef,
        where("foodId", "==", foodId),
        where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(async (docFav) => {
        await deleteDoc(doc(db, "favorites", docFav.id));
    });
};

const addToCart = async ({ id, title, image, price }) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const cartRef = collection(db, "carts");
    const q = query(
        cartRef,
        where("userId", "==", userId),
        where("foodId", "==", id)
    );
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
                                     role = "pelanggan", // bisa "pelanggan" atau "pemilik"
                                     isLoved: initialIsLoved = false,
                                     onAddToCart,
                                 }) {
    const [isLoved, setIsLoved] = useState(initialIsLoved);
    const [roleUser, setRoleUser] = useState("pelanggan");
    const navigate = useNavigate();
    const imgSrc = getDriveThumbnail(image);

    const toggleLove = async () => {
        const newLoveState = !isLoved;
        setIsLoved(newLoveState);

        try {
            if (newLoveState) {
                await addToFavorites(id);
            } else {
                await removeFromFavorites(id);
            }
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
        <div className="relative bg-white rounded-xl shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow duration-200">
            {/* Love Icon */}
            <button
                onClick={toggleLove}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-sm focus:outline-none"
            >
                <img
                    src={isLoved ? "../assets/Love.svg" : "../assets/Love-gray.svg"}
                    alt="favorite"
                    className="h-6 w-6"
                />
            </button>

            {/* Image */}
            <div className="rounded-xl h-32 w-full overflow-hidden mb-2 sm:mb-3">
                <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
            </div>

            {/* Title & Description */}
            <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-1 h-10 overflow-hidden">
                {desc}
            </p>

            {/* Rating, Price, Button */}
            <div className="flex flex-col gap-1 mt-1 sm:mt-2">
                <div className="flex items-center text-orange-500 text-xs sm:text-sm gap-1">
                    <StarIcon className="w-4 h-4" />
                    {rating} ({review})
                </div>

                <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base font-medium text-gray-700">
            Rp {price}
          </span>

                    {/* Tombol berbeda sesuai role */}
                    {roleUser === "pelanggan" ? (
                        <button
                            onClick={() => {
                                addToCart({ id, title, image: imgSrc, price });
                                onAddToCart && onAddToCart();
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            <PlusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate("/edit-food", { state: { foodId: id } })}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            <ArrowRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
