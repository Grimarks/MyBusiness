import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ThankYouPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/home'); // redirect ke home atau dashboard setelah 3 detik
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-white px-8 text-center">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6">
                <svg
                    className="w-20 h-20 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Terima Kasih!</h1>
            <p className="text-gray-600">Pesanan kamu akan segera diproses.</p>
        </div>
    );
}
