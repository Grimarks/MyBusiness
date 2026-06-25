import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ThankYouPage() {
    const navigate = useNavigate();
    const [count, setCount] = useState(3);

    useEffect(() => {
        const interval = setInterval(() => setCount((c) => c - 1), 1000);
        const timeout  = setTimeout(() => navigate("/home"), 3000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center bg-gray-50">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background:"linear-gradient(135deg,#F97316,#EAB308)", boxShadow:"0 8px 32px rgba(249,115,22,.35)" }}>
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Diterima! 🎉</h1>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Pesananmu sedang diproses. Pemilik toko akan segera mengkonfirmasi.
            </p>

            <div className="mt-8 w-48 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                        background: "linear-gradient(90deg,#F97316,#EAB308)",
                        width: `${((3 - count) / 3) * 100}%`,
                    }}
                />
            </div>
            <p className="text-xs text-gray-400 mt-2">Kembali ke home dalam {count}...</p>

            <button
                onClick={() => navigate("/home")}
                className="btn btn-primary btn-lg mt-8"
            >
                Kembali ke Home
            </button>
        </div>
    );
}
