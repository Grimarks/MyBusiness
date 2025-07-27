import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashMibi = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/loginpage"); // Ganti dengan halaman setelah splash
        }, 3000); // Durasi splash screen (3 detik)

        return () => clearTimeout(timer); // Cleanup timer
    }, [navigate]);

    return (
        <div className="min-h-screen bg-orange-500 flex justify-center items-center">
            <img src="./mibi-logo.png" alt="Mibi Logo" className="h-48" />
        </div>
    );
};

export default SplashMibi;