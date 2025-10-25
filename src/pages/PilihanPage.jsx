import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";

// Komponen
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import FoodCard from "../components/FoodCard.jsx";
import BottomNav from "../components/BottomNav.jsx";
import IncomingOrderCard from "../components/IncomingOrderCard.jsx";
import Loader from "../components/Loader.jsx";
import { StarIcon } from "@heroicons/react/24/outline";

// 🔹 Helper untuk thumbnail Google Drive
const getDriveThumbnail = (url, size = "w200-h200") => {
    if (!url) return null;
    const ucMatch = url.match(/id=([^&]+)/);
    if (ucMatch) return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=${size}`;
    const dMatch = url.match(/\/d\/([^/]+)\//);
    if (dMatch) return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=${size}`;
    return url;
};

// 🔹 Fungsi pseudo-random agar hasil shuffle stabil dalam 1 hari
function mulberry32(seed) {
    let t = seed;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

// 🔹 Fungsi untuk acak array berdasarkan seed (tanggal)
const shuffleArrayWithSeed = (array, seed) => {
    const result = [...array];
    let random = mulberry32(seed);
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

// 🔹 Ambil seed unik tiap hari (misal: 20251024)
const getDailySeed = () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // contoh: "2025-10-24"
    return parseInt(dateStr.replace(/-/g, ""), 10);
};

const PilihanPage = () => {
    const [role, setRole] = useState(null);
    const [makananList, setMakananList] = useState([]);
    const [filterLocation, setFilterLocation] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState([]);

    // 🔹 Ambil role user
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("uid", "==", user.uid));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        setRole(snap.docs[0].data().role);
                    }
                } catch (err) {
                    console.error("Gagal ambil role user:", err);
                }
            } else {
                setRole("guest");
            }
        });
        return () => unsubscribe();
    }, []);

    // 🔹 Ambil daftar favorit (untuk pelanggan)
    useEffect(() => {
        const fetchFavoriteIds = async () => {
            try {
                const favoritesCollection = collection(db, "favorites");
                const favoriteSnapshot = await getDocs(favoritesCollection);
                const favoriteList = favoriteSnapshot.docs.map((doc) => doc.data().foodId);
                setFavoriteIds(favoriteList);
            } catch (err) {
                console.error("Gagal memuat data favorit:", err);
            }
        };
        fetchFavoriteIds();
    }, []);

    // 🔹 Ambil data makanan dan acak berdasarkan tanggal
    useEffect(() => {
        if (role !== "pelanggan") return;

        const fetchMakanan = async () => {
            try {
                setLoading(true);
                setError(null);

                const makananRef = collection(db, "foods");
                let q = makananRef;

                if (filterLocation !== "All") {
                    q = query(makananRef, where("location", "==", filterLocation));
                }

                const snapshot = await getDocs(q);
                const allData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    image: getDriveThumbnail(doc.data().image) || "/default-food.png",
                }));

                const filteredData = allData.filter(
                    (makanan) =>
                        searchTerm === "" ||
                        (makanan.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (makanan.description || "").toLowerCase().includes(searchTerm.toLowerCase())
                );

                // 🔹 Shuffle berdasarkan tanggal (1x24 jam)
                const seed = getDailySeed();
                const shuffledData = shuffleArrayWithSeed(filteredData, seed);

                setMakananList(shuffledData);
            } catch (err) {
                console.error("Error fetching makanan:", err);
                setError("Gagal memuat data makanan. Coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchMakanan();
    }, [role, filterLocation, searchTerm]);

    if (loading) return <Loader message="Memuat pilihan makanan..." />;
    if (error) return <div className="p-4 text-red-500 text-center">{error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
            <Header />

            {/* ========== Pelanggan View ========== */}
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
                            {makananList.map((makanan) => (
                                <FoodCard
                                    key={makanan.id}
                                    id={makanan.id}
                                    title={makanan.name}
                                    desc={makanan.description}
                                    image={makanan.image}
                                    price={makanan.price}
                                    rating={makanan.rating}
                                    isLoved={favoriteIds.includes(makanan.id)}
                                    review={makanan.review}
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

            {/* ========== Pemilik View ========== */}
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
};

export default PilihanPage;
