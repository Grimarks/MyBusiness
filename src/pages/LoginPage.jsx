import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";

export default function LoginPage() {
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw]     = useState(false);
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();
    const auth     = getAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 6 || password.length > 12) {
            setError("Password harus 6–12 karakter.");
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/home");
        } catch {
            setError("Email atau password salah. Silakan coba lagi.");
        } finally { setLoading(false); }
    };

    if (loading) return <Loader message="Masuk..." />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Brand header */}
            <div
                className="px-6 pt-16 pb-14"
                style={{ background: "linear-gradient(160deg,#F97316,#EAB308)" }}
            >
                <div className="max-w-sm mx-auto">
                    <h1 className="text-white text-3xl font-bold">Selamat datang! 👋</h1>
                    <p className="text-white/80 text-sm mt-2">Masuk ke akun Anda untuk melanjutkan.</p>
                </div>
            </div>

            {/* Form card */}
            <div className="flex-1 px-5 -mt-6">
                <div className="max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-lg">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Masuk</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="form-group">
                            <label className="label">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input input-muted"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input input-muted pr-11"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                                <span className="text-sm text-red-600">{error}</span>
                            </div>
                        )}

                        <div className="text-right">
                            <Link to="/forgot-password" className="text-sm text-orange-600 font-medium hover:underline">
                                Lupa Password?
                            </Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg">
                            Masuk
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Belum punya akun?{" "}
                        <Link to="/select-account" className="text-orange-600 font-semibold hover:underline">
                            Daftar di sini
                        </Link>
                    </p>

                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                        <button
                            onClick={() => navigate("/admin")}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            Admin Portal →
                        </button>
                    </div>
                </div>
            </div>
            <div className="h-8" />
        </div>
    );
}
