import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashMyBusiness() {
    const navigate = useNavigate();
    useEffect(() => {
        const t = setTimeout(() => navigate("/select-account"), 2800);
        return () => clearTimeout(t);
    }, [navigate]);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(160deg,#EAB308 0%,#F59E0B 50%,#F97316 100%)" }}
        >
            <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                <div className="relative w-full h-full rounded-2xl bg-white flex items-center justify-center shadow-xl">
                    <img src="/mybusiness-logo.png" alt="MyBusiness" className="w-20 h-20 object-contain" />
                </div>
            </div>
            <h1 className="text-white text-2xl font-bold">MyBusiness</h1>
            <p className="text-white/70 text-sm mt-1">Kelola usahamu dengan mudah</p>
        </div>
    );
}
