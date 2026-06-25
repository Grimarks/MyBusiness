import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";

export default function ForgotPasswordPage() {
    const [email, setEmail]     = useState("");
    const [error, setError]     = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth     = getAuth();

    const handleReset = async (e) => {
        e.preventDefault();
        setError(""); setSuccess(false);
        if (!email.includes("@")) return setError("Masukkan email yang valid.");
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err) {
            if (err.code === "auth/user-not-found") setError("Email tidak terdaftar.");
            else if (err.code === "auth/invalid-email") setError("Format email tidak valid.");
            else setError("Terjadi kesalahan. Coba lagi nanti.");
        } finally { setLoading(false); }
    };

    if (loading) return <Loader message="Mengirim email reset..." />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="px-6 pt-14 pb-14" style={{ background: "linear-gradient(160deg,#F97316,#EAB308)" }}>
                <button onClick={() => navigate(-1)} className="mb-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowLeftIcon className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-white text-2xl font-bold">Lupa Password?</h1>
                <p className="text-white/80 text-sm mt-1">Kami akan kirim link reset ke email kamu.</p>
            </div>

            <div className="flex-1 px-5 -mt-6 pb-8">
                <div className="max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-lg">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <EnvelopeIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Email Terkirim!</h3>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                Periksa inbox atau folder spam kamu untuk link reset password.
                            </p>
                            <button
                                onClick={() => navigate("/loginpage")}
                                className="btn btn-primary btn-full btn-lg mt-6"
                            >
                                Kembali ke Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
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

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-full btn-lg">
                                Kirim Link Reset
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/loginpage")}
                                className="btn btn-ghost btn-full"
                            >
                                Batal
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
