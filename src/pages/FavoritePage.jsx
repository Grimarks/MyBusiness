import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig.js";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { PlusIcon, HeartIcon } from "@heroicons/react/24/outline";
import { getDriveThumbnail } from "../utils/drive";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import FoodCard from "../components/FoodCard";
import BottomNav from "../components/BottomNav";
import Loader from "../components/Loader";

export default function FavoritePage() {
    const [role, setRole]           = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [myFoods, setMyFoods]     = useState([]);
    const [userData, setUserData]   = useState(null);
    const [filterLocation, setFilterLocation] = useState("All");
    const [searchTerm, setSearchTerm]         = useState("");
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged(async (user) => {
            if (!user) return setRole("guest");
            const snap = await getDocs(query(collection(db, "users"), where("uid","==",user.uid)));
            if (!snap.empty) { const d = snap.docs[0].data(); setRole(d.role); setUserData(d); }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!role) return;
        const load = async () => {
            setLoading(true);
            const userId = auth.currentUser?.uid;
            try {
                if (role === "pelanggan") {
                    const favSnap = await getDocs(query(collection(db, "favorites"), where("userId","==",userId)));
                    const detailed = await Promise.all(favSnap.docs.map(async (fd) => {
                        const foodId = fd.data().foodId;
                        if (!foodId) return null;
                        const foodDoc = await getDoc(doc(db, "foods", foodId));
                        if (!foodDoc.exists()) return null;
                        const d = foodDoc.data();
                        return { id: foodDoc.id, ...d, isLoved: true, image: getDriveThumbnail(d.image) || "/default-food.png" };
                    }));
                    setFavorites(detailed.filter((i) =>
                        i &&
                        (filterLocation === "All" || i.location === filterLocation) &&
                        (!searchTerm || i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            i.description?.toLowerCase().includes(searchTerm.toLowerCase()))
                    ));
                }
                if (role === "pemilik") {
                    const snap = await getDocs(query(collection(db, "foods"), where("uid","==",userId)));
                    setMyFoods(snap.docs.map((d) => ({
                        id: d.id, ...d.data(), image: getDriveThumbnail(d.data().image) || "/default-food.png",
                    })).filter((i) =>
                        (filterLocation === "All" || i.location === filterLocation) &&
                        (!searchTerm || i.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                    ));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [role, filterLocation, searchTerm]);

    if (loading) return <Loader message="Memuat..." />;

    /* ── Shared top bar ── */
    const TopBar = () => (
        <div
            className="sticky-header"
            style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}
        >
            <Header />
            <SearchBar
                placeholder={role === "pemilik" ? "Cari menu di kedaimu..." : "Cari makanan favoritmu..."}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                className="pb-4"
            />
        </div>
    );

    /* ── Pelanggan ── */
    if (role === "pelanggan") {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopBar />
                <div className="bg-white shadow-sm">
                    <CategoryFilter filterLocation={filterLocation} setFilterLocation={setFilterLocation} />
                </div>
                <div className="px-4 pt-4 pb-nav max-w-5xl mx-auto">
                    {favorites.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {favorites.map((item) => <FoodCard key={item.id} {...item} isLoved />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-3">
                                <HeartIcon className="w-8 h-8 text-red-300" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">Belum Ada Favorit</h3>
                            <p className="text-sm text-gray-500 mb-5 max-w-[200px]">
                                Tandai makanan yang kamu suka untuk lihat di sini.
                            </p>
                            <Link to="/home" className="btn btn-primary btn-sm">Jelajahi Menu</Link>
                        </div>
                    )}
                </div>
                <BottomNav active="Favorite" />
            </div>
        );
    }

    /* ── Pemilik ── */
    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />

            {/* Store card */}
            <div className="px-4 pt-5 max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid #F3F4F6", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <div className="h-36 bg-gray-100 relative overflow-hidden">
                        <img
                            src={getDriveThumbnail(userData?.kedaiImage) || "/default-store.png"}
                            alt="Toko"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                            <h2 className="text-white font-bold text-lg">{userData?.kedaiName || "Nama Kedai"}</h2>
                            <Link to="/edit-store" className="btn btn-sm bg-white text-gray-800 rounded-full font-semibold text-xs px-3 py-1.5">
                                Edit Toko
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm">
                <CategoryFilter filterLocation={filterLocation} setFilterLocation={setFilterLocation} />
            </div>

            <div className="px-4 pt-4 pb-nav max-w-5xl mx-auto">
                {myFoods.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {myFoods.map((item) => <FoodCard key={item.id} {...item} isLoved={false} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <h3 className="font-bold text-gray-800 mb-1">Belum Ada Menu</h3>
                        <p className="text-sm text-gray-500 mb-5">Tambahkan menu pertama anda.</p>
                        <Link to="/add-food" className="btn btn-primary btn-sm">+ Tambah Menu</Link>
                    </div>
                )}
            </div>

            {/* FAB */}
            <Link
                to="/add-food"
                className="fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white z-40"
                style={{ background: "linear-gradient(135deg,#F97316,#EAB308)", boxShadow: "0 4px 20px rgba(249,115,22,.4)" }}
            >
                <PlusIcon className="w-6 h-6" />
            </Link>

            <BottomNav active="Favorite" />
        </div>
    );
}
