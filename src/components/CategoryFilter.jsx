import React from "react";
import { useLocation } from "react-router-dom";

const LOCATION_PAGES = ["/pilihan", "/favorite"];

const FOOD_CATS  = ["All","Cepat Saji","Ayam Geprek","Mie","Sayuran","Steak","Jamur","Kopi"];
const LOCATIONS  = ["All","Bukit","Indralaya"];

export default function CategoryFilter({
    filterLocation, setFilterLocation,
    filterFoodCategory, setFilterFoodCategory,
}) {
    const { pathname } = useLocation();
    const isLocPage = LOCATION_PAGES.includes(pathname);

    const items  = isLocPage ? LOCATIONS : FOOD_CATS;
    const active = isLocPage ? filterLocation : filterFoodCategory;
    const setFn  = isLocPage ? setFilterLocation : setFilterFoodCategory;

    return (
        <div className="scroll-x flex gap-2 px-4 py-2">
            {items.map((item) => (
                <button
                    key={item}
                    onClick={() => setFn(item)}
                    className={`chip ${active === item ? "chip-active" : "chip-inactive"}`}
                >
                    {isLocPage && item !== "All" ? `📍 ${item}` : item}
                </button>
            ))}
        </div>
    );
}
