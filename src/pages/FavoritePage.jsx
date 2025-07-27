import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    StarIcon,
} from "@heroicons/react/24/outline";
import FoodCard from "../components/FoodCard.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { collection, getDocs, db, doc, getDoc } from "../firebaseConfig";
import Loader from '../components/Loader';
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";

const FavoritePage = () => {
    const [favoriteItemsData, setFavoriteItemsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterLocation, setFilterLocation] = useState("All");

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            try {
                const favoritesCollection = collection(db, "favorites");
                const favoriteSnapshot = await getDocs(favoritesCollection);
                const favoriteList = favoriteSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const detailedFavorites = await Promise.all(
                    favoriteList.map(async (fav) => {
                        if (!fav.foodId) return null;
                        const foodRef = doc(db, "foods", fav.foodId);
                        const foodDoc = await getDoc(foodRef);
                        if (foodDoc.exists()) {
                            return {
                                ...foodDoc.data(),
                                _id: foodDoc.id,
                                isLoved: true,
                            };
                        }
                        return null;
                    })
                );

                const filteredFavorites = detailedFavorites.filter(item =>
                    item !== null &&
                    (filterLocation === "All" || item.location === filterLocation)
                );

                setFavoriteItemsData(filteredFavorites);
            } catch (error) {
                console.error("Gagal mengambil data favorit:", error);
                setError("Gagal memuat favorit.");
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [filterLocation]);


    if (loading) {
        return <Loader message="Memuat favorit..." />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
         <Header />
            <SearchBar></SearchBar>
            <CategoryFilter
                filterLocation={filterLocation}
                setFilterLocation={setFilterLocation}
            />


            <main className="container mx-auto p-4 max-w-2xl">
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
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Item Favorit</h2>
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
            </main>

            <BottomNav active="Favorite" />
        </div>
    );
};

export default FavoritePage;
