import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import FoodCard from "../components/FoodCard";
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";
import EarningsCard from "../components/EarningsCard";
import IncomingOrderCard from "../components/IncomingOrderCard";

export default function HomePage() {
    const [role, setRole]     = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [foods, setFoods]   = useState([]);
    const [error, setError]   = useState(null);
    const [filterFoodCategory, setFilterFoodCategory] = useState("All");
    const [filterLocation, setFilterLocation]         = useState("All");
    const [searchTerm, setSearchTerm]                 = useState("");

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                const snap = await getDoc(doc(db, "users", user.uid)).catch(() => null);
                setRole(snap?.exists() ? snap.data().role || "pelanggan" : "pelanggan");
            } else {
                setUserId(null);
                setRole("pelanggan");
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!role || !userId) return;
        const load = async () => {
            setLoading(true);
            try {
                if (role === "pelanggan") {
                    const [foodSnap, favSnap] = await Promise.all([
                        getDocs(collection(db, "foods")),
                        getDocs(query(collection(db, "favorites"), where("userId","==",userId))),
                    ]);
                    const favIds = favSnap.docs.map((d) => d.data().foodId);
                    setFoods(foodSnap.docs.map((d) => ({
                        id: d.id, ...d.data(), isLoved: favIds.includes(d.id),
                    })));
                } else {
                    setFoods([]);
                }
            } catch (err) {
                setError("Gagal memuat data.");
            } finally { setLoading(false); }
        };
        load();
    }, [role, userId]);

    if (loading) return <Loader message="Memuat..." />;
    if (error)   return <div className="flex items-center justify-center min-h-screen text-red-500 text-sm">{error}</div>;

    const filtered = foods.filter((f) => {
        const name = f.name?.toLowerCase() || "";
        const desc = f.description?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return (
            (!searchTerm || name.includes(term) || desc.includes(term)) &&
            (filterFoodCategory === "All" || f.category === filterFoodCategory) &&
            (filterLocation === "All" || f.location === filterLocation)
        );
    });

    /* ── Pelanggan ── */
    if (role === "pelanggan") {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Hero */}
                <div
                    className="relative"
                    style={{
                        background: "linear-gradient(160deg,#F97316,#EAB308)",
                        borderRadius: "0 0 28px 28px",
                    }}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-15 rounded-b-[28px]"
                        style={{ backgroundImage: "url('/Cookies.png')" }}
                    />
                    <div className="relative">
                        <Header greeting="Halo! 👋" subtitle="Mau makan apa hari ini?" />
                    </div>
                    <SearchBar
                        placeholder="Cari makanan favoritmu..."
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        className="pb-4"
                    />
                </div>

                {/* Filter */}
                <div className="bg-white shadow-sm">
                    <CategoryFilter
                        filterLocation={filterLocation}
                        setFilterLocation={setFilterLocation}
                        filterFoodCategory={filterFoodCategory}
                        setFilterFoodCategory={setFilterFoodCategory}
                    />
                </div>

                {/* Grid */}
                <div className="px-4 pt-4 pb-nav max-w-5xl mx-auto">
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filtered.map((food) => (
                                <FoodCard
                                    key={food.id}
                                    id={food.id}
                                    image={food.image}
                                    title={food.name}
                                    desc={food.description}
                                    price={food.price}
                                    rating={food.rating}
                                    review={food.review}
                                    isLoved={food.isLoved}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="text-5xl mb-3">🍽️</span>
                            <p className="text-gray-500 text-sm">Tidak ada makanan yang cocok.</p>
                        </div>
                    )}
                </div>

                <BottomNav active="Home" />
            </div>
        );
    }

    /* ── Pemilik ── */
    return (
        <div className="min-h-screen bg-gray-50">
            <div
                className="relative"
                style={{
                    background: "linear-gradient(160deg,#F97316,#EAB308)",
                    borderRadius: "0 0 28px 28px",
                }}
            >
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 rounded-b-[28px]"
                    style={{ backgroundImage: "url('/Mask group.png')" }}
                />
                <div className="relative">
                    <Header greeting="Halo, Pemilik! 👋" subtitle="Pantau bisnismu hari ini" />
                    <div className="h-4" />
                </div>
            </div>

            <div className="px-4 pt-5 pb-nav max-w-2xl mx-auto space-y-4">
                <EarningsCard />

                <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F3F4F6", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                        Pesanan Masuk
                    </h2>
                    <IncomingOrderCard />
                </div>
            </div>

            <BottomNav active="Home" />
        </div>
    );
}
