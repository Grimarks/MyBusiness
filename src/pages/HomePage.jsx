import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import FoodCard from "../components/FoodCard";
import BottomNav from "../components/BottomNav";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig.js";
import { auth } from "../firebaseConfig.js";
import Loader from "../components/Loader";



export default function HomePage() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFoods = async () => {
            setLoading(true);
            try {
                console.log("Fetching foods...");
                const foodsCollection = collection(db, "foods");
                const foodSnapshot = await getDocs(foodsCollection);
                const rawFoodList = foodSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                console.log("Fetched foods:", rawFoodList);

                const userId = auth.currentUser?.uid || "guest";
                console.log("Current user ID:", userId);

                const favoritesRef = collection(db, "favorites");
                const q = query(favoritesRef, where("userId", "==", userId));
                const favSnapshot = await getDocs(q);
                const favIds = favSnapshot.docs.map(doc => doc.data().foodId);
                console.log("Favorite IDs:", favIds);

                const foodList = rawFoodList.map(food => ({
                    ...food,
                    isLoved: favIds.includes(food.id),
                }));
                console.log("Final food list:", foodList);

                setFoods(foodList);
            } catch (error) {
                console.error("Error fetching foods:", error);
                setError("Gagal memuat makanan.");
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, []);


    const handleAddToCart = (foodId) => {
        console.log(`Added food with ID ${foodId} to cart`);
        // TODO: Implementasi tambah ke keranjang
    };

    if (loading) {
        return <Loader message="Memuat makanan..." />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            <div
                className="relative h-64 sm:h-80 bg-cover bg-center"
                style={{ backgroundImage: `url('/Cookies.png')` }}
            >
                <div className="absolute inset-0 bg-black/40 z-0" />

                <div className="relative z-10">
                    <Header greeting="Hidupmu damai" subtitle="dengan satu suapan." />
                </div>
            </div>

            {/* Search and Filter */}
            <SearchBar placeholder="Mibi mau makan apa hari ini?" />
            <CategoryFilter />

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-4">
                {foods.map(food => (
                    <FoodCard
                        key={food.id}
                        id={food.id}
                        image={food.image}
                        title={food.name}
                        desc={food.description}
                        price={food.price}
                        rating={food.rating}
                        isLoved={food.isLoved} // <--- ini penting
                        onAddToCart={() => handleAddToCart(food.id)}
                        review={food.review}
                    />
                ))}
            </div>

            {/* Bottom Navigation */}
            <BottomNav active="Home" />
        </div>
    );
}