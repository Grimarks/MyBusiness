import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SearchBar({
    placeholder = "Cari...",
    searchTerm,
    setSearchTerm,
    className = "",
}) {
    const [local, setLocal] = useState(searchTerm || "");

    useEffect(() => { setLocal(searchTerm || ""); }, [searchTerm]);

    const commit = () => setSearchTerm(local.trim());
    const clear  = () => { setLocal(""); setSearchTerm(""); };

    return (
        <div className={`px-4 py-2 ${className}`}>
            <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,.08)" }}
            >
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    value={local}
                    placeholder={placeholder}
                    onChange={(e) => setLocal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commit()}
                    className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                />
                {local && (
                    <button
                        onClick={clear}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex-shrink-0"
                    >
                        <XMarkIcon className="w-3 h-3 text-gray-500" />
                    </button>
                )}
            </div>
        </div>
    );
}
