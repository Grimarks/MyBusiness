import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Header({ greeting, subtitle }) {
    const navigate = useNavigate();

    const backButtonStyle =
        "bg-white text-black p-2 rounded-full shadow hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50";

    const iconImageStyle =
        "w-6 h-6 object-contain";

    const iconButtonStyle =
        "p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-200";

    if (greeting && subtitle) {
        return (
            <div className="relative p-4 text-white">
                <div className="absolute top-4 right-4 flex gap-3 sm:gap-4">
                    <button className={iconButtonStyle}>
                        <img
                            src="/assets/Bell.svg"
                            alt="Bell Icon"
                            className={iconImageStyle}
                        />
                    </button>
                    <button className={iconButtonStyle}>
                        <img
                            src="/assets/Keranjang.svg"
                            alt="Cart Icon"
                            className={iconImageStyle}
                        />
                    </button>
                </div>
                <br />
                <h1 className="text-2xl font-bold sm:text-3xl">
                    {greeting}
                </h1>
                <h1 className="text-2xl font-bold sm:text-3xl">
                    <span className="text-yellow-400">{subtitle}</span>
                </h1>
            </div>
        );
    }

    return (
        <div className="p-4 text-white">
            <div className="container mx-auto flex items-center justify-between max-w-2xl">
                <button
                    onClick={() => navigate(-1)}
                    className={backButtonStyle}
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-3">
                    <button className={iconButtonStyle}>
                        <img
                            src="/assets/Bell.svg"
                            alt="Bell Icon"
                            className={iconImageStyle}
                        />
                    </button>
                    <button className={iconButtonStyle}>
                        <img
                            src="/assets/Keranjang.svg"
                            alt="Cart Icon"
                            className={iconImageStyle}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
