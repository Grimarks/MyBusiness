import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { collection, getDocs } from "firebase/firestore";
import { db} from "../firebaseConfig.js";

export default function PendapatanPage() {
    const navigate = useNavigate();
    const [earnings, setEarnings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "earnings"));
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEarnings(data);
            } catch (error) {
                console.error("Gagal mengambil data earnings:", error);
            }
        };

        fetchData();
    }, []);

    const totalPendapatan = earnings.reduce((sum, item) => sum + item.amount, 0);

    const now = new Date();
    const monthYear = now.toLocaleString("id-ID", { month: "long", year: "numeric" });

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400">
            {/* Header */}
            <div className="flex items-center p-4 pt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white p-2 rounded-full shadow"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-orange-500" />
                </button>
                <h1 className="text-white text-lg font-semibold ml-4">Detail Pendapatan</h1>
            </div>

            {/* Konten */}
            <div className="bg-white rounded-t-4xl mt-6 p-6 min-h-[calc(100vh-88px)]">
                <h2 className="text-lg font-bold text-black mb-4">Pendapatan Toko</h2>

                {/* Bulan + Tahun */}
                <div className="bg-orange-500 text-white rounded-2xl px-4 py-2 inline-block mb-4 font-medium shadow">
                    {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                </div>

                {/* Total */}
                <div className="bg-orange-100 rounded-xl p-4 mb-6">
                    <p className="text-sm text-black font-medium">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-black">
                        Rp {totalPendapatan.toLocaleString("id-ID")}
                    </p>
                </div>

                {/* List pelanggan */}
                <div className="space-y-4">
                    {earnings.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 shadow-sm bg-gray-200"
                        >
                            {/* Kolom kiri */}
                            <div>
                                <p className="text-gray-800 font-medium">{item.customerName}</p>
                                <p className="text-sm text-gray-500">{item.orderDetails}</p>
                            </div>

                            {/* Kolom kanan */}
                            <p className="text-black font-semibold text-right min-w-[100px]">
                                +Rp {item.amount.toLocaleString("id-ID")}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
