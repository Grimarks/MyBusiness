import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db} from "../firebaseConfig.js";

export default function EarningsCard() {
    const navigate = useNavigate();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "earnings"));
                let sum = 0;
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    sum += data.amount || 0;
                });
                setTotal(sum);
            } catch (error) {
                console.error("Gagal mengambil data earnings:", error);
            }
        };

        fetchEarnings();
    }, []);

    return (
        <div className="bg-gradient-to-r from-orange-400 to-yellow-300 p-4 rounded-xl shadow-md">
            <h2 className="text-white text-lg font-semibold">Pendapatan</h2>
            <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-bold text-white">
                    Rp {total.toLocaleString("id-ID")}
                </p>
                <button onClick={() => navigate("/pendapatan")} className="text-white text-xl">
                    ➜
                </button>
            </div>
        </div>
    );
}
