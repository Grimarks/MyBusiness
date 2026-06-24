import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { StarIcon } from "@heroicons/react/24/outline";
import { getDriveThumbnail } from "../utils/drive";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import FoodCard from "../components/FoodCard";
import BottomNav from "../components/BottomNav";
import IncomingOrderCard from "../components/IncomingOrderCard";
import Loader from "../components/Loader";

function mulberry32(seed) {
    let t = seed;
    return function () {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

const shuffleWithSeed = (array, seed) => {
    const result = [...array];
    const random = mulberry32(seed);
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

const getDailySeed = () => {
    const dateStr = new Date().toISOString().split("T")[0];
    return parseInt(dateStr.replace(/-/g, ""), 10);
};

export default function PilihanPage() {
    const [role, setRole]             = useState(null);
    const [makananList, setMakananList] = useState([]);
    const [filterLocation, setFilterLocation] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [favoriteIds, setFavoriteIds] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) return setRole("guest");
            try {
                const snap = await getDocs(
                    query(collection(db, "users"), where("uid", "==", user.uid))
                );
                if (!snap.empty) setRole(snap.docs[0].data().role);
            } catch (err) {
                console.error("Gagal ambil role user:", err);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchFavoriteIds = async () => {
            try {
                const snap = await getDocs(collection(db, "favorites"));
                setFavoriteIds(snap.docs.map((d) => d.data().foodId));
            } catch (err) {
                console.error("Gagal memuat data favorit:", err);
            }
        };
        fetchFavoriteIds();
    }, []);

    useEffect(() => {
        if (role === "pelanggan") {
            const fetchMakanan = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const ref = collection(db, "foods");
                    const q   = filterLocation !== "All"
                        ? query(ref, where("location", "==", filterLocation))
                        : ref;

                    const snapshot = await getDocs(q);
                    const allData  = snapshot.docs.map((d) => ({
                        id: d.id,
                        ...d.data(),
                        image: getDriveThumbnail(d.data().image) || "/default-food.png",
                    }));

                    const filtered = allData.filter(
                        (item) =>
                            searchTerm === "" ||
                            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    setMakananList(shuffleWithSeed(filtered, getDailySeed()));
                } catch (err) {
                    console.error("Error fetching makanan:", err);
                    setError("Gagal memuat data makanan. Coba lagi nanti.");
                } finally {
                    setLoading(false);
                }
            };
            fetchMakanan();
        } else if (role) {
            setLoading(false);
        }
    }, [role, filterLocation, searchTerm]);

    if (loading) return <Loader message="Memuat pilihan makanan..." />;
    if (error)   return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
            <Header />

            {role === "pelanggan" && (
                <main className="container mx-auto p-4 max-w-6xl">
                    <img
                        src="/promo-2.png"
                        alt="Promo Pilihan"
                        className="object-contain rounded-3xl mb-4 w-full max-h-48 sm:max-h-64 md:max-h-72"
                    />
                    <SearchBar
                        placeholder="Mau coba makanan apa?"
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                    <CategoryFilter
                        filterLocation={filterLocation}
                        setFilterLocation={setFilterLocation}
                    />

                    {makananList.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 p-4 transition-all duration-300">
                            {makananList.map((item) => (
                                <FoodCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.name}
                                    desc={item.description}
                                    image={item.image}
                                    price={item.price}
                                    rating={item.rating}
                                    review={item.review}
                                    isLoved={favoriteIds.includes(item.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <StarIcon className="mx-auto text-gray-300 text-6xl mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                Belum Ada Makanan Menarik
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                Yuk jelajahi berbagai menu lezat yang bisa kamu coba hari ini!
                            </p>
                            <Link
                                to="/home"
                                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                            >
                                Jelajahi Sekarang
                            </Link>
                        </div>
                    )}
                </main>
            )}

            {role === "pemilik" && (
                <main className="container mx-auto p-4 max-w-6xl">
                    <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
                        <h2 className="text-2xl font-bold text-orange-500 mb-2">
                            Pesanan Masuk Hari Ini 🍱
                        </h2>
                        <IncomingOrderCard />
                    </div>
                </main>
            )}

            <BottomNav active="Pilihan" />
        </div>
    );
}
