import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";

// Komponen
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import FoodCard from "../components/FoodCard.jsx";
import BottomNav from "../components/BottomNav.jsx";
import IncomingOrderCard from "../components/IncomingOrderCard.jsx";

const PilihanPage = () => {
    const navigate = useNavigate();

    const [makananList, setMakananList] = useState([]);
    const [filterLocation, setFilterLocation] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [role, setRole] = useState(null);

    // Cek login user & ambil role
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
                setRole("guest"); // fallback kalau gak login
            }
        });

        return () => unsubscribe();
    }, []);

    // Ambil favorite IDs
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

    // Ambil data makanan dari Firestore (khusus pelanggan)
    useEffect(() => {
        if (role !== "pelanggan") return; // ✅ hanya jalan kalau pelanggan

        const fetchMakanan = async () => {
            try {
                setLoading(true);
                setError(null);

                const makananRef = collection(db, "foods");

                // Query berdasarkan filter lokasi (jika bukan "All")
                let q;
                if (filterLocation !== "All") {
                    q = query(makananRef, where("location", "==", filterLocation));
                } else {
                    q = query(makananRef);
                }

                const snapshot = await getDocs(q);
                const allData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter berdasarkan pencarian nama
                const filteredData = allData.filter((makanan) =>
                    (makanan.name || "").toLowerCase().includes(searchTerm.toLowerCase())
                );

                setMakananList(filteredData);
            } catch (err) {
                console.error("Error fetching makanan:", err);
                setError("Gagal memuat data makanan. Coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchMakanan();
    }, [role, filterLocation, searchTerm]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
            <Header />

            {role === "pelanggan" && (
                <>
                    <img
                        src="/promo-2.png"
                        alt="Free Delivery Illustration"
                        className="object-contain flex-shrink-0 rounded-3xl p-3"
                    />
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    <CategoryFilter
                        filterLocation={filterLocation}
                        setFilterLocation={setFilterLocation}
                    />

                    <main className="container mx-auto p-4 max-w-2xl">
                        {loading && (
                            <p className="text-center text-lg text-gray-700">Memuat makanan...</p>
                        )}
                        {error && <p className="text-center text-red-500 text-lg">{error}</p>}
                        {!loading && !error && makananList.length === 0 && (
                            <p className="text-center text-gray-500 text-lg">
                                Tidak ada makanan ditemukan untuk lokasi ini.
                            </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
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
                    </main>
                </>
            )}

            {role === "pemilik" && (
                <main className="container mx-auto p-4 max-w-2xl">
                    {/* ✅ tampilkan pesanan masuk */}
                    <IncomingOrderCard />
                </main>
            )}

            <BottomNav active="Pilihan" />
        </div>
    );
};

export default PilihanPage;
