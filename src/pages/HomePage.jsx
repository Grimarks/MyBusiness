import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import FoodCard from "../components/FoodCard";
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";
import EarningsCard from "../components/EarningsCard";
import IncomingOrderCard from "../components/IncomingOrderCard";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

export default function HomePage() {
    const [role, setRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [foods, setFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [earnings, setEarnings] = useState(0);
    const [error, setError] = useState(null);
    const [filterFoodCategory, setFilterFoodCategory] = useState("All");
    const [filterLocation, setFilterLocation] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // Ambil data makanan awal
    useEffect(() => {
        const fetchFoods = async () => {
            const snapshot = await getDocs(collection(db, "foods"));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFoods(data);
        };
        fetchFoods();
    }, []);

    // Step 1: Pastikan user sudah login
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        setRole(data.role || "pelanggan");
                    } else {
                        setRole("pelanggan");
                    }
                } catch (err) {
                    console.error("Gagal mengambil role user:", err);
                    setRole("pelanggan");
                }
            } else {
                setUserId(null);
                setRole("pelanggan");
            }
        });

        return () => unsubscribe();
    }, []);

    // Step 2: Ambil data sesuai role
    useEffect(() => {
        const fetchData = async () => {
            if (!role || !userId) return;
            setLoading(true);

            try {
                if (role === "pelanggan") {
                    const foodsCollection = collection(db, "foods");
                    const foodSnapshot = await getDocs(foodsCollection);
                    const rawFoodList = foodSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    const favoritesRef = collection(db, "favorites");
                    const q = query(favoritesRef, where("userId", "==", userId));
                    const favSnapshot = await getDocs(q);
                    const favIds = favSnapshot.docs.map(doc => doc.data().foodId);

                    const foodList = rawFoodList.map(food => ({
                        ...food,
                        isLoved: favIds.includes(food.id),
                    }));

                    setFoods(foodList);
                }

                if (role === "pemilik") {
                    const userRef = doc(db, "users", userId);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        let { kedaiName } = userSnap.data();
                        if (!kedaiName) kedaiName = "Apa nama kedai mu?";

                        const ordersRef = collection(db, "order");
                        const ordersQuery = query(
                            ordersRef,
                            where("ownerName", "==", kedaiName)
                        );
                        const ordersSnap = await getDocs(ordersQuery);

                        const orderList = ordersSnap.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                        }));

                        const finishedOrders = orderList.filter(order => order.status === true);

                        const total = finishedOrders.reduce(
                            (acc, order) => acc + (order.amount || 0),
                            0
                        );

                        setOrders(orderList);
                        setEarnings(total);
                    }
                }
            } catch (err) {
                console.error("Gagal memuat data:", err);
                setError("Gagal memuat data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [role, userId]);

    if (loading) return <Loader message="Memuat data..." />;
    if (error) return <div>Error: {error}</div>;

    // 🔍 Filter makanan (gabungan search + kategori + lokasi)
    // 🔍 Filter makanan (gabungan search + kategori + lokasi)
    const filteredFoods = foods.filter((food) => {
        const name = food.name?.toLowerCase() || "";
        const desc = food.description?.toLowerCase() || "";

        const matchSearch =
            name.includes(searchTerm.toLowerCase()) ||
            desc.includes(searchTerm.toLowerCase());

        const matchCategory =
            filterFoodCategory === "All" || food.category === filterFoodCategory;

        const matchLocation =
            filterLocation === "All" || food.location === filterLocation;

        return matchSearch && matchCategory && matchLocation;
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            {role === "pelanggan" && (
                <>
                    <div
                        className="relative h-64 sm:h-80 bg-cover bg-center"
                        style={{ backgroundImage: `url('/Cookies.png')` }}
                    >
                        <div className="absolute inset-0 bg-black/40 z-0" />
                        <div className="relative z-10">
                            <Header
                                greeting="Halo!"
                                subtitle={`Selamat datang, Mibi Lovers!`}
                            />
                        </div>
                    </div>

                    <SearchBar
                        placeholder="Mibi mau makan apa hari ini?"
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />

                    <CategoryFilter
                        filterLocation={filterLocation}
                        setFilterLocation={setFilterLocation}
                        filterFoodCategory={filterFoodCategory}
                        setFilterFoodCategory={setFilterFoodCategory}
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 p-4">
                        {filteredFoods.length > 0 ? (
                            filteredFoods.map(food => (
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
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500">
                                Tidak ada makanan ditemukan
                            </p>
                        )}
                    </div>
                </>
            )}

            {role === "pemilik" && (
                <>
                    <div
                        className="relative h-64 sm:h-80 bg-no-repeat bg-cover bg-center rounded-b-[40px] overflow-hidden"
                        style={{ backgroundImage: `url('/Mask group.png')` }}
                    >
                        <div className="absolute inset-0 bg-black/40 z-0" />
                        <div className="relative z-10">
                            <Header greeting="Halo!" subtitle="Selamat datang, Admin!" />
                        </div>
                    </div>
                    <div className="px-4 mt-4 space-y-6">
                        <EarningsCard total={earnings} />
                        <IncomingOrderCard orders={orders} />
                    </div>
                </>
            )}

            <BottomNav active="Home" />
        </div>
    );
}
