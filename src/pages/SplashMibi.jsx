import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashMibi() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate("/loginpage"), 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-orange-500 flex justify-center items-center">
            <img src="./mibi-logo.png" alt="Mibi Logo" className="h-48" />
        </div>
    );
}
