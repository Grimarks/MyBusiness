import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon, Cog6ToothIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SearchBar(props) {
    const {
        placeholder = "Cari...",
        value,
        onChange,
        searchTerm,
        setSearchTerm,
        className = "",
    } = props;

    const externalValue = value ?? searchTerm;
    const externalSetter = typeof onChange === "function" ? onChange : setSearchTerm;

    const [localValue, setLocalValue] = useState(externalValue ?? "");

    useEffect(() => {
        if (externalValue !== undefined && externalValue !== localValue) {
            setLocalValue(externalValue);
        }
    }, [externalValue]);

    const handleChange = (next) => {
        if (typeof externalSetter === "function") {
            externalSetter(next);
        } else {
            setLocalValue(next);
        }
    };

    const clear = () => handleChange("");

    return (
        <div className={`mx-4 mt-2 mb-4 ${className}`}>
            <div
                className="flex items-center bg-white rounded-full shadow p-2 sm:p-3 focus-within:ring-2 focus-within:ring-orange-400 transition-shadow duration-200"
                // ❌ Cegah form submission
                onSubmit={(e) => e.preventDefault()}
            >
                <MagnifyingGlassIcon className="h-5 w-5 text-orange-500 mr-2" />
                <input
                    type="text" // pastikan text, bukan submit
                    placeholder={placeholder}
                    value={externalValue !== undefined ? externalValue : localValue}
                    onChange={(e) => handleChange(e.target.value)}
                    className="flex-1 outline-none text-sm sm:text-base text-gray-700"
                />
                {(externalValue ?? localValue) ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault(); // cegah reload
                            clear();
                        }}
                        className="p-1 rounded-full hover:bg-gray-100 mr-2"
                        aria-label="Clear search"
                        type="button"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                ) : null}
                <Cog6ToothIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
        </div>
    );
}
