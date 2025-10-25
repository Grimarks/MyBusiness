import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Loader from "../components/Loader";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6 || password.length > 12) {
            setError("Password HARUS minimal 6 karakter dan maksimal 12 karakter!");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful!");
            navigate("/home");
        } catch (err) {
            setError("Salah Password / Salah Email");
            console.error("Login failed:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader message="Sedang memproses..." />;
    }

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-orange-500 to-yellow-400 flex flex-col">
            <div className="text-white px-6 pt-12 pb-8">
                <h1 className="text-3xl font-bold">Masuk</h1>
                <p className="text-sm mt-2">Silahkan masukkan akun anda.</p>
            </div>

            <div className="bg-white pt-10 pb-16 px-6 flex-grow flex flex-col justify-between rounded-tr-[150px]">
                <form onSubmit={handleLogin} className="flex flex-col px-6 space-y-6">
                    <h2 className="text-3xl font-bold text-orange-600">Masuk</h2>

                    {/* Email */}
                    <div className="flex items-center bg-[#F2F2F2] px-4 py-3 rounded-xl">
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-transparent w-full focus:outline-none text-gray-700"
                            required
                        />
                    </div>

                    {/* Password + Toggle Eye */}
                    <div className="flex items-center bg-[#F2F2F2] px-4 py-3 rounded-xl relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="*********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent w-full focus:outline-none text-gray-700"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-gray-500"
                        >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-300 transition-all duration-300">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="block text-center bg-[#FF8C4B] text-white py-3 rounded-xl font-bold text-lg"
                    >
                        Masuk
                    </button>
                </form>

                {/* Lupa Password */}
                <div className="text-center text-sm mt-4">
                    <Link to="/forgot-password">
                        <span className="text-orange-600 font-semibold cursor-pointer hover:underline">
                            Lupa Password?
                        </span>
                    </Link>
                </div>

                <div className="text-center text-sm mt-6">
                    Belum punya akun?{" "}
                    <Link to="/select-account">
                        <span className="font-bold text-black cursor-pointer hover:underline">Daftar di sini</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
