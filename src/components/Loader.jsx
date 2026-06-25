import React from "react";

export default function Loader({ message = "Memuat..." }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-50">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
            </div>
            <p className="text-sm font-medium text-gray-500">{message}</p>
        </div>
    );
}
