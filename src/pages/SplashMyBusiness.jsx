import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashMyBusiness = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/select-account"); // Ganti dengan halaman setelah splash
        }, 3000); // Durasi splash screen (3 detik)

        return () => clearTimeout(timer); // Cleanup timer
    }, [navigate]);

    return (
        <div className="min-h-screen bg-yellow-500 flex justify-center items-center">
            <img src="/logo-mybusiness.png" alt="MyBusiness Logo" className="h-48" />
        </div>
    );
};

export default SplashMyBusiness;