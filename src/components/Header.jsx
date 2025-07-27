import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    BellIcon,
    ShoppingCartIcon,
} from "@heroicons/react/24/outline";

export default function Header({ greeting, subtitle }) {
    const navigate = useNavigate();

    // Jika ada greeting dan subtitle → mode sambutan
    if (greeting && subtitle) {
        return (
            <div className="relative p-4 text-white">
                <div className="absolute top-4 right-4 flex gap-3 sm:gap-4">
                    <button className="hover:bg-white/20 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                        <BellIcon className="h-6 w-6" />
                    </button>
                    <button className="hover:bg-white/20 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                        <ShoppingCartIcon className="h-6 w-6" />
                    </button>
                </div>
                <br />
                <h1 className="text-2xl font-bold sm:text-3xl">
                    {greeting} <span className="text-yellow-400">{subtitle}</span>
                </h1>
            </div>
        );
    }

    // Jika tidak ada greeting → tampilan default dengan tombol kembali & judul
    return (
        <div className="p-4 text-white">
            <div className="container mx-auto flex items-center justify-between max-w-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-3">
                    <button className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                        <BellIcon className="h-6 w-6" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                        <ShoppingCartIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
