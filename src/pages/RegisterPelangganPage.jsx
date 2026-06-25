import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, db } from "../firebaseConfig";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";

export default function RegisterPelangganPage() {
    const [nama, setNama]         = useState("");
    const [email, setEmail]       = useState("");
    const [pw, setPw]             = useState("");
    const [confirmPw, setConfirm] = useState("");
    const [showPw, setShowPw]     = useState(false);
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();
    const auth     = getAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (pw.length < 6 || pw.length > 12) return setError("Password harus 6–12 karakter.");
        if (pw !== confirmPw) return setError("Password tidak cocok.");
        setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, pw);
            await setDoc(doc(db, "users", user.uid), {
                nama, email, role: "pelanggan", uid: user.uid, password: pw,
            });
            alert("Registrasi berhasil!");
            navigate("/loginpage");
        } catch (err) {
            if (err.code === "auth/email-already-in-use") setError("Email sudah terdaftar.");
            else if (err.code === "auth/invalid-email")   setError("Format email tidak valid.");
            else setError("Terjadi kesalahan. Coba lagi.");
        } finally { setLoading(false); }
    };

    if (loading) return <Loader message="Mendaftarkan akun..." />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="px-6 pt-14 pb-14" style={{ background: "linear-gradient(160deg,#F97316,#EAB308)" }}>
                <button onClick={() => navigate(-1)} className="mb-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowLeftIcon className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-white text-2xl font-bold">Daftar sebagai Pelanggan</h1>
                <p className="text-white/80 text-sm mt-1">Buat akun dan nikmati semua menu pilihan.</p>
            </div>

            <div className="flex-1 px-5 -mt-6 pb-8">
                <div className="max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-lg">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="form-group">
                            <label className="label">Nama Lengkap</label>
                            <input type="text" placeholder="Nama Lengkap" value={nama} onChange={(e) => setNama(e.target.value)} className="input input-muted" required />
                        </div>
                        <div className="form-group">
                            <label className="label">Email</label>
                            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-muted" required />
                        </div>
                        <div className="form-group">
                            <label className="label">Password</label>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} placeholder="6–12 karakter" value={pw} onChange={(e) => setPw(e.target.value)} minLength={6} maxLength={12} className="input input-muted pr-11" required />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPw ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="label">Konfirmasi Password</label>
                            <input type={showPw ? "text" : "password"} placeholder="Ulangi password" value={confirmPw} onChange={(e) => setConfirm(e.target.value)} minLength={6} maxLength={12} className="input input-muted" required />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-full btn-lg">Daftar</button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-5">
                        Sudah punya akun?{" "}
                        <Link to="/loginpage" className="text-orange-600 font-semibold hover:underline">Masuk</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
