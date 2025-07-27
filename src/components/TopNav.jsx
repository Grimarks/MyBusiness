import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function TopNav({ title }) {
    const navigate = useNavigate();

    return (
        <header className="bg-gradient-to-br from-orange-500 to-yellow-400 p-4 sticky top-0 z-40 shadow-md">
            <div className="container mx-auto flex items-center justify-between max-w-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-white text-lg font-semibold">{title}</h1>
                <div>
                    {/* Bisa tambahkan ikon lain di sini (misalnya,  <BellIcon/>  ) */}
                </div>
            </div>
        </header>
    );
}