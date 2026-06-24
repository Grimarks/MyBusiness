import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashMyBusiness() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate("/select-account"), 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-yellow-500 flex justify-center items-center">
            <img src="/logo-mybusiness.png" alt="MyBusiness Logo" className="h-48" />
        </div>
    );
}
