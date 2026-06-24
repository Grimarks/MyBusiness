import React from "react";
import { useLocation } from "react-router-dom";

const LOCATION_FILTER_PATHS = ["/pilihan", "/favorite"];

const FOOD_CATEGORIES = [
    "All",
    "Cepat Saji",
    "Ayam Geprek",
    "Mie",
    "Sayuran",
    "Steak",
    "Jamur",
    "Kopi",
];

const LOCATIONS = ["All", "Bukit", "Indralaya"];

const containerClass =
    "flex gap-2 px-3 sm:px-6 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent";

export default function CategoryFilter({
    filterLocation,
    setFilterLocation,
    filterFoodCategory,
    setFilterFoodCategory,
}) {
    const { pathname } = useLocation();
    const isLocationFilterPage = LOCATION_FILTER_PATHS.includes(pathname);

    if (isLocationFilterPage) {
        return (
            <div className={containerClass}>
                {LOCATIONS.map((loc) => (
                    <button
                        key={loc}
                        onClick={() => setFilterLocation(loc)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                            filterLocation === loc
                                ? "bg-orange-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        {loc === "All" ? "All" : `📍 ${loc}`}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className={containerClass}>
            {FOOD_CATEGORIES.map((category) => (
                <button
                    key={category}
                    onClick={() => setFilterFoodCategory(category)}
                    className={`flex-shrink-0 px-4 py-2 border rounded-full text-sm transition ${
                        filterFoodCategory === category
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
