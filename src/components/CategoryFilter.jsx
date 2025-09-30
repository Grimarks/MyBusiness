import React from "react";
import { useLocation } from "react-router-dom";

const CategoryFilter = ({
                            filterLocation,
                            setFilterLocation,
                            filterFoodCategory,
                            setFilterFoodCategory,
                        }) => {
    const location = useLocation();
    const currentPath = location.pathname;

    const foodCategories = [
        "All",
        "Cepat Saji",
        "Ayam Geprek",
        "Mie",
        "Sayuran",
        "Steak",
        "Jamur",
        "Kopi",
    ];

    const isLocationFilterPage =
        currentPath === "/pilihan" || currentPath === "/favorite";

    if (isLocationFilterPage) {
        return (
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 px-4">
                {["All", "Bukit", "Indralaya"].map((loc) => (
                    <button
                        key={loc}
                        onClick={() => setFilterLocation(loc)}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                            filterLocation === loc
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        {loc === "All" ? "All" : `📍 ${loc}`}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
            {foodCategories.map((category) => (
                <button
                    key={category}
                    onClick={() => setFilterFoodCategory(category)}
                    className={`px-4 py-1 border rounded-full text-sm ${
                        filterFoodCategory === category
                            ? "bg-orange-500 text-white"
                            : "bg-white border-gray-300 text-gray-700"
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
