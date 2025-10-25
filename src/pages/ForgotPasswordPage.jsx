import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Loader from "../components/Loader";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email.includes("@")) {
            setError("Masukkan email yang valid!");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(
                "📩 Email reset password telah dikirim! Periksa kotak masuk atau folder spam kamu."
            );
        } catch (err) {
            console.error("Reset gagal:", err);
            if (err.code === "auth/user-not-found") {
                setError("Email tidak ditemukan. Pastikan kamu sudah terdaftar.");
            } else if (err.code === "auth/invalid-email") {
                setError("Format email tidak valid.");
            } else {
                setError("Terjadi kesalahan di server. Coba lagi nanti.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader message="Mengirim email reset password..." />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-400 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-orange-200">
                <h1 className="text-3xl font-extrabold text-orange-600 text-center mb-6">
                    Lupa Password
                </h1>
                <p className="text-gray-500 text-center text-sm mb-6">
                    Masukkan email akunmu. Kami akan kirim link untuk reset password.
                </p>

                <form onSubmit={handleReset} className="space-y-4">
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none transition"
                        required
                    />

                    {error && (
                        <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-600 text-sm text-center font-medium">{success}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition transform hover:scale-[1.02]"
                    >
                        Kirim Link Reset
                    </button>

                    <p
                        onClick={() => navigate("/loginpage")}
                        className="text-center text-sm text-orange-600 mt-3 cursor-pointer hover:underline"
                    >
                        Kembali ke Login
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
