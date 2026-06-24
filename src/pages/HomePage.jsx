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
    const [role, setRole]       = useState(null);
    const [userId, setUserId]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [foods, setFoods]     = useState([]);
    const [orders, setOrders]   = useState([]);
    const [earnings, setEarnings] = useState(0);
    const [error, setError]     = useState(null);
    const [filterFoodCategory, setFilterFoodCategory] = useState("All");
    const [filterLocation, setFilterLocation]         = useState("All");
    const [searchTerm, setSearchTerm]                 = useState("");

    useEffect(() => {
        const fetchFoods = async () => {
            const snapshot = await getDocs(collection(db, "foods"));
            setFoods(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        };
        fetchFoods();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const snap = await getDoc(doc(db, "users", user.uid));
                    setRole(snap.exists() ? snap.data().role || "pelanggan" : "pelanggan");
                } catch (err) {
                    console.error("Gagal ambil role user:", err);
                    setRole("pelanggan");
                }
            } else {
                setUserId(null);
                setRole("pelanggan");
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!role || !userId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                if (role === "pelanggan") {
                    const foodSnap = await getDocs(collection(db, "foods"));
                    const rawFoods = foodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

                    const favSnap = await getDocs(
                        query(collection(db, "favorites"), where("userId", "==", userId))
                    );
                    const favIds = favSnap.docs.map((d) => d.data().foodId);

                    setFoods(rawFoods.map((food) => ({ ...food, isLoved: favIds.includes(food.id) })));
                }

                if (role === "pemilik") {
                    const userSnap = await getDoc(doc(db, "users", userId));
                    if (userSnap.exists()) {
                        const kedaiName = userSnap.data().kedaiName || "Nama Kedaimu";
                        const ordersSnap = await getDocs(
                            query(collection(db, "order"), where("ownerName", "==", kedaiName))
                        );
                        const orderList = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
                        const total = orderList
                            .filter((o) => o.status === true)
                            .reduce((acc, o) => acc + (o.amount || 0), 0);

                        setOrders(orderList);
                        setEarnings(total);
                    }
                }
            } catch (err) {
                console.error("Gagal memuat data:", err);
                setError("Terjadi kesalahan saat memuat data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [role, userId]);

    if (loading) return <Loader message="Memuat data..." />;
    if (error)   return <div className="text-center text-red-500 mt-10">{error}</div>;

    const filteredFoods = foods.filter((food) => {
        const name = food.name?.toLowerCase() || "";
        const desc = food.description?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();

        return (
            (searchTerm === "" || name.includes(term) || desc.includes(term)) &&
            (filterFoodCategory === "All" || food.category === filterFoodCategory) &&
            (filterLocation === "All" || food.location === filterLocation)
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
            {role === "pelanggan" && (
                <main className="container mx-auto p-4 max-w-6xl">
                    <div
                        className="relative h-64 sm:h-80 bg-cover bg-center shadow-lg rounded-3xl mb-6"
                        style={{ backgroundImage: `url('/Cookies.png')` }}
                    >
                        <div className="absolute inset-0 bg-black/40 rounded-3xl" />
                        <div className="relative z-10">
                            <Header greeting="Halo!" subtitle="Selamat datang, Mibi Lovers!" />
                        </div>
                    </div>

                    <SearchBar
                        placeholder="Mibi mau makan apa hari ini?"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                    <CategoryFilter
                        filterLocation={filterLocation}
                        setFilterLocation={setFilterLocation}
                        filterFoodCategory={filterFoodCategory}
                        setFilterFoodCategory={setFilterFoodCategory}
                    />

                    {filteredFoods.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 p-4 transition-all duration-300">
                            {filteredFoods.map((food) => (
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
                        <p className="text-center text-gray-100 italic py-12">
                            Tidak ada makanan yang cocok dengan pencarianmu 🍽️
                        </p>
                    )}
                </main>
            )}

            {role === "pemilik" && (
                <main className="container mx-auto p-4 max-w-6xl">
                    <div
                        className="relative h-64 sm:h-80 bg-no-repeat bg-cover bg-center rounded-b-[40px] overflow-hidden shadow-md mb-6"
                        style={{ backgroundImage: `url('/Mask group.png')` }}
                    >
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10">
                            <Header greeting="Halo!" subtitle="Selamat datang, Admin!" />
                        </div>
                    </div>

                    <EarningsCard total={earnings} />
                    <div className="bg-white rounded-2xl shadow-lg p-4 mt-6 transition-all hover:shadow-orange-200">
                        <IncomingOrderCard orders={orders} />
                    </div>
                </main>
            )}

            <BottomNav active="Home" />
        </div>
    );
}
