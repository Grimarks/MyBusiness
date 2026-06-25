import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { getDriveThumbnail } from "../utils/drive";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import FoodCard from "../components/FoodCard";
import BottomNav from "../components/BottomNav";
import IncomingOrderCard from "../components/IncomingOrderCard";
import Loader from "../components/Loader";

function seededRng(seed) {
    let t = seed;
    return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
const shuffleSeed = (arr, seed) => {
    const r = [...arr], rand = seededRng(seed);
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
};
const dailySeed = () => parseInt(new Date().toISOString().split("T")[0].replace(/-/g,""), 10);

export default function PilihanPage() {
    const [role, setRole]             = useState(null);
    const [list, setList]             = useState([]);
    const [favIds, setFavIds]         = useState([]);
    const [filterLocation, setFilterLocation] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    useEffect(() => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) return setRole("guest");
            const snap = await getDocs(query(collection(db, "users"), where("uid","==",user.uid)));
            if (!snap.empty) setRole(snap.docs[0].data().role);
        });
    }, []);

    useEffect(() => {
        getDocs(collection(db, "favorites")).then((snap) =>
            setFavIds(snap.docs.map((d) => d.data().foodId))
        );
    }, []);

    useEffect(() => {
        if (role !== "pelanggan") { setLoading(false); return; }
        const load = async () => {
            setLoading(true); setError(null);
            try {
                const ref = collection(db, "foods");
                const q   = filterLocation !== "All" ? query(ref, where("location","==",filterLocation)) : ref;
                const snap = await getDocs(q);
                const data = snap.docs.map((d) => ({
                    id: d.id, ...d.data(),
                    image: getDriveThumbnail(d.data().image) || "/default-food.png",
                })).filter((i) => !searchTerm || i.name?.toLowerCase().includes(searchTerm.toLowerCase()));
                setList(shuffleSeed(data, dailySeed()));
            } catch { setError("Gagal memuat data."); }
            finally  { setLoading(false); }
        };
        load();
    }, [role, filterLocation, searchTerm]);

    if (loading) return <Loader message="Memuat pilihan hari ini..." />;
    if (error)   return <div className="flex items-center justify-center min-h-screen text-sm text-red-500">{error}</div>;

    const TopBar = () => (
        <div style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}>
            <Header />
            {role === "pelanggan" && (
                <SearchBar placeholder="Mau coba makanan apa?" searchTerm={searchTerm} setSearchTerm={setSearchTerm} className="pb-4" />
            )}
        </div>
    );

    if (role === "pelanggan") {
        return (
            <div className="min-h-screen bg-gray-50">
                <TopBar />
                <div className="bg-white shadow-sm">
                    <CategoryFilter filterLocation={filterLocation} setFilterLocation={setFilterLocation} />
                </div>

                {/* Daily banner */}
                <div className="px-4 pt-4 max-w-5xl mx-auto">
                    <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 px-4 py-3 flex items-center gap-3 mb-4">
                        <SparklesIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                        <p className="text-sm text-orange-700 font-medium">Pilihan spesial hari ini untuk kamu!</p>
                    </div>
                </div>

                <div className="px-4 pb-nav max-w-5xl mx-auto">
                    {list.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {list.map((item) => (
                                <FoodCard key={item.id} id={item.id} title={item.name} desc={item.description}
                                    image={item.image} price={item.price} rating={item.rating} review={item.review}
                                    isLoved={favIds.includes(item.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-20 text-center">
                            <span className="text-5xl mb-3">🍽️</span>
                            <p className="text-gray-500 text-sm">Belum ada menu tersedia.</p>
                            <Link to="/home" className="btn btn-primary btn-sm mt-4">Kembali ke Home</Link>
                        </div>
                    )}
                </div>
                <BottomNav active="Pilihan" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            <div className="px-4 pt-5 pb-nav max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F3F4F6", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                        Pesanan Masuk Hari Ini 🍱
                    </h2>
                    <IncomingOrderCard />
                </div>
            </div>
            <BottomNav active="Pilihan" />
        </div>
    );
}
