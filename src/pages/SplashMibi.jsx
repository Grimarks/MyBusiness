import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashMibi() {
    const navigate = useNavigate();
    useEffect(() => {
        const t = setTimeout(() => navigate("/loginpage"), 2800);
        return () => clearTimeout(t);
    }, [navigate]);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(160deg,#F97316 0%,#FB923C 60%,#EAB308 100%)" }}
        >
            <div className="relative flex items-center justify-center w-32 h-32 mb-6">
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                <div className="relative w-28 h-28 rounded-full bg-white/30 flex items-center justify-center">
                    <img src="./mibi-logo.png" alt="Mibi" className="w-20 h-20 object-contain" />
                </div>
            </div>
            <h1 className="text-white text-2xl font-bold tracking-wide">Mibi</h1>
            <p className="text-white/70 text-sm mt-1">Your campus food marketplace</p>

            <div className="absolute bottom-12 flex gap-1.5">
                {[0,1,2].map((i) => (
                    <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/60"
                        style={{ animation: `pulse 1.2s ${i * 0.2}s infinite` }}
                    />
                ))}
            </div>
        </div>
    );
}
