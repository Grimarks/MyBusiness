import React from "react";
import { MagnifyingGlassIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function SearchBar({ placeholder }) {
    return (
        <div className="mx-4 mt-2 mb-4">
            <div className="flex items-center bg-white rounded-full shadow p-2 sm:p-3 focus-within:ring-2 focus-within:ring-orange-400 transition-shadow duration-200">
                <MagnifyingGlassIcon className="h-5 w-5 text-orange-500 mr-2" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="flex-1 outline-none text-sm sm:text-base text-gray-700"
                />
                <Cog6ToothIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
        </div>
    );
}