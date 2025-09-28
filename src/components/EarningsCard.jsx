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
            if (user) {
                try {
                    // Cari kedai user
                    const usersSnap = await getDocs(
                        query(collection(db, "users"), where("uid", "==", user.uid))
                    );
                    if (!usersSnap.empty) {
                        const userData = usersSnap.docs[0].data();
                        const ownerName = userData.kedaiName;

                        // Ambil order selesai sesuai ownerName
                        const ordersSnap = await getDocs(
                            query(
                                collection(db, "order"),
                                where("ownerName", "==", ownerName),
                                where("status", "==", true)
                            )
                        );

                        let sum = 0;
                        ordersSnap.forEach((doc) => {
                            const data = doc.data();
                            sum += data.amount || 0;
                        });
                        setTotal(sum);
                    }
                } catch (error) {
                    console.error("Gagal mengambil data order:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-gradient-to-r from-orange-400 to-yellow-300 p-4 rounded-xl shadow-md">
            <h2 className="text-white text-lg font-semibold">Pendapatan</h2>
            <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-bold text-white">
                    Rp {total.toLocaleString("id-ID")}
                </p>
                <button
                    onClick={() => navigate("/pendapatan")}
                    className="text-white text-xl"
                >
                    ➜
                </button>
            </div>
        </div>
    );
}
