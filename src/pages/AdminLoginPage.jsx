import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Loader from "../components/Loader";

export default function AdminLoginPage() {
    const [email, setEmail]   = useState("");
    const [pw, setPw]         = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handle = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, pw);
            const snap = await getDoc(doc(db,"users",user.uid));
            if (!snap.exists())              { alert("Akun tidak ditemukan."); return; }
            if (snap.data().role !== "admin"){ alert("Akses ditolak!"); return; }
            navigate("/admin-page");
        } catch { alert("Login gagal. Periksa email dan password."); }
        finally { setLoading(false); }
    };

    if (loading) return <Loader message="Memverifikasi..." />;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center mb-4 shadow-lg">
                        <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-1">Masuk untuk mengelola aplikasi</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg" style={{ border:"1px solid #F3F4F6" }}>
                    <form onSubmit={handle} className="space-y-4">
                        <div className="form-group">
                            <label className="label">Email Admin</label>
                            <input type="email" placeholder="admin@mybusiness.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-muted" required />
                        </div>
                        <div className="form-group">
                            <label className="label">Password</label>
                            <div className="relative">
                                <input type={showPw?"text":"password"} placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} className="input input-muted pr-11" required />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPw ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full btn-lg mt-2">Masuk Dashboard</button>
                    </form>
                </div>

                <button onClick={() => navigate("/loginpage")} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
                    ← Kembali ke Login
                </button>
            </div>
        </div>
    );
}
