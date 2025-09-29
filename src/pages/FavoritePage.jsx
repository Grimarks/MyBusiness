import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StarIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Loader from "../components/Loader";
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";
import FoodCard from "../components/FoodCard.jsx";
import BottomNav from "../components/BottomNav.jsx";

// Helper untuk ambil thumbnail dari Google Drive
const getDriveThumbnail = (url, size = "w200-h200") => {
    if (!url) return null;

    // Case: format uc?export=view&id=FILE_ID
    const ucMatch = url.match(/id=([^&]+)/);
    if (ucMatch) {
        return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=${size}`;
    }

    // Case: format file/d/FILE_ID/
    const dMatch = url.match(/\/d\/([^/]+)\//);
    if (dMatch) {
        return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=${size}`;
    }

    // Kalau bukan link drive, kembalikan original
    return url;
};


const FavoritePage = () => {
    const [role, setRole] = useState(null);
    const [favoriteItemsData, setFavoriteItemsData] = useState([]);
    const [myFoods, setMyFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterLocation, setFilterLocation] = useState("All");
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) return;

                const userRef = doc(db, "users", userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setRole(data.role);
                    setUserData(data);
                } else {
                    setError("Data pengguna tidak ditemukan.");
                }
            } catch (err) {
                console.error("Gagal mengambil role user:", err);
                setError("Gagal memuat data pengguna.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Ambil data makanan / favorit
    useEffect(() => {
        if (!role) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                if (role === "pelanggan") {
                    const userId = auth.currentUser?.uid;

                    // ✅ filter favorite hanya milik user login
                    const favoritesCollection = collection(db, "favorites");
                    const q = query(favoritesCollection, where("userId", "==", userId));
                    const favoriteSnapshot = await getDocs(q);

                    const favoriteList = favoriteSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    const detailedFavorites = await Promise.all(
                        favoriteList.map(async (fav) => {
                            if (!fav.foodId) return null;
                            const foodRef = doc(db, "foods", fav.foodId);
                            const foodDoc = await getDoc(foodRef);
                            if (foodDoc.exists()) {
                                const data = foodDoc.data();
                                return {
                                    _id: foodDoc.id,
                                    ...data,
                                    isLoved: true,
                                    image: getDriveThumbnail(data.image) || "/default-food.png",
                                };
                            }
                            return null;
                        })
                    );

                    const filteredFavorites = detailedFavorites.filter(
                        (item) =>
                            item !== null &&
                            (filterLocation === "All" || item.location === filterLocation)
                    );

                    setFavoriteItemsData(filteredFavorites);
                } else if (role === "pemilik") {
                    const userId = auth.currentUser?.uid;
                    const foodsRef = collection(db, "foods");
                    const q = query(foodsRef, where("uid", "==", userId));
                    const snapshot = await getDocs(q);

                    const foodList = snapshot.docs
                        .map((doc) => {
                            const data = doc.data();
                            return {
                                _id: doc.id,
                                ...data,
                                image: getDriveThumbnail(data.image) || "/default-food.png",
                            };
                        })
                        .filter(
                            (item) => filterLocation === "All" || item.location === filterLocation
                        );

                    setMyFoods(foodList);
                }
            } catch (err) {
                console.error("Gagal mengambil data:", err);
                setError("Gagal memuat data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [role, filterLocation]);

    if (loading) return <Loader message="Memuat data..." />;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
            <Header />
            <main className="container mx-auto p-4 max-w-2xl">
                {role === "pelanggan" && (
                    <>
                        <SearchBar />
                        <CategoryFilter
                            filterLocation={filterLocation}
                            setFilterLocation={setFilterLocation}
                        />

                        <img
                            src="/promo.png"
                            alt="Free Delivery Illustration"
                            className="object-contain flex-shrink-0 rounded-3xl pb-4"
                        />

                        {favoriteItemsData.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {favoriteItemsData.map((item) => (
                                    <FoodCard
                                        key={item._id}
                                        id={item._id}
                                        image={item.image}
                                        title={item.name}
                                        desc={item.description}
                                        price={item.price}
                                        rating={item.rating?.toFixed(1)}
                                        isLoved={true}
                                        review={item.review}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <StarIcon className="mx-auto text-gray-300 text-6xl mb-4" />
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                    Belum Ada Item Favorit
                                </h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    Makanan yang kamu tandai sebagai favorit akan muncul di sini.
                                </p>
                                <Link
                                    to="/home"
                                    className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                                >
                                    Cari Makanan Sekarang
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {role === "pemilik" && (
                    <>
                        <div className="bg-white rounded-2xl mb-4 p-2">
                            <h2 className="text-3xl font-bold text-orange-500">
                                {userData?.kedaiName || "Nama Kedai"}
                            </h2>
                            <img
                                src={getDriveThumbnail(userData?.kedaiImage) || "/default-store.png"}
                                alt="Foto Kedai"
                                className="object-contain w-full h-36 rounded-xl"
                            />

                            <div className="flex justify-end">
                                <Link
                                    to="/edit-store"
                                    className="bg-orange-500 text-white px-2 py-1 text-sm rounded-md font-medium hover:bg-orange-600 transition-colors"
                                >
                                    Edit Profil
                                </Link>
                            </div>
                        </div>

                        {myFoods.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                {myFoods.map((item) => (
                                    <FoodCard
                                        key={item._id}
                                        id={item._id}
                                        image={item.image}
                                        title={item.name}
                                        desc={item.description}
                                        price={item.price}
                                        rating={item.rating?.toFixed(1)}
                                        review={item.review}
                                        isLoved={false}
                                        onAddToCart={null}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                    Belum Ada Menu
                                </h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    Tambahkan menu makanan agar bisa dilihat pelanggan.
                                </p>
                                <Link
                                    to="/add-food"
                                    className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                                >
                                    Tambah Menu Sekarang
                                </Link>
                            </div>
                        )}

                        <Link
                            to="/add-food"
                            className="fixed bottom-24 right-4 bg-gradient-to-br from-orange-500 to-orange-600
                 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <PlusCircleIcon className="h-7 w-7" />
                        </Link>
                    </>
                )}
            </main>

            <BottomNav active="Favorite" />
        </div>
    );
};

export default FavoritePage;
