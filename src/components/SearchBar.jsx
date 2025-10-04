import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SearchBar({
                                      placeholder = "Cari...",
                                      searchTerm,
                                      setSearchTerm,
                                      className = "",
                                  }) {
    const [localValue, setLocalValue] = useState(searchTerm || "");

    useEffect(() => {
        setLocalValue(searchTerm || "");
    }, [searchTerm]);

    const handleSearch = () => {
        setSearchTerm(localValue.trim());
    };

    const clear = () => {
        setLocalValue("");
        setSearchTerm("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className={`mx-4 mt-2 mb-4 ${className}`}>
            <div className="flex items-center bg-white rounded-full shadow p-2 sm:p-3 focus-within:ring-2 focus-within:ring-orange-400">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 outline-none text-sm sm:text-base text-gray-700"
                />
                {localValue && (
                    <button
                        type="button"
                        onClick={clear}
                        className="p-1 rounded-full hover:bg-gray-100 mr-2"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSearch}
                    className="p-1 rounded-full hover:bg-orange-100"
                >
                    <MagnifyingGlassIcon className="h-5 w-5 text-orange-500" />
                </button>
            </div>
        </div>
    );
}
