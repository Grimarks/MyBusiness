import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

export default function EarningsCard() {
    const navigate = useNavigate();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            try {
                const usersSnap = await getDocs(
                    query(collection(db, "users"), where("uid", "==", user.uid))
                );
                if (usersSnap.empty) return;

                const userData = usersSnap.docs[0].data();
                const ordersRef = collection(db, "order");

                let snap = await getDocs(
                    query(ordersRef, where("ownerId", "==", user.uid), where("status", "==", true))
                );

                if (snap.empty) {
                    snap = await getDocs(
                        query(ordersRef, where("ownerName", "==", userData.kedaiName), where("status", "==", true))
                    );
                }

                const totalAmount = snap.docs.reduce(
                    (sum, doc) => sum + (doc.data().amount || 0),
                    0
                );
                setTotal(totalAmount);
            } catch (error) {
                console.error("Gagal mengambil data order:", error);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-gradient-to-r from-orange-400 to-yellow-300 p-4 sm:p-5 rounded-2xl shadow-md w-full max-w-md mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-white text-base sm:text-lg font-semibold">Pendapatan</h2>
                <button
                    onClick={() => navigate("/pendapatan")}
                    className="text-white text-lg sm:text-xl font-bold hover:scale-110 transition"
                >
                    ➜
                </button>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                Rp {total.toLocaleString("id-ID")}
            </p>
        </div>
    );
}
