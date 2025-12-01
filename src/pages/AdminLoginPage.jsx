import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const AdminLoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                alert("Data akun tidak ditemukan di database.");
                setLoading(false);
                return;
            }

            const userData = docSnap.data();

            if (userData.role !== "admin") {
                alert("Akses ditolak! Anda bukan Admin.");
                setLoading(false);
                return;
            }
            navigate("/admin-page");

        } catch (error) {
            console.error("Login Error:", error);
            alert("Login gagal. Periksa email dan password Anda.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader message="Memverifikasi Admin..." />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 flex flex-col justify-center items-center px-4">
            <button
                onClick={() => navigate("/loginpage")}
                className="absolute top-6 left-6 text-white hover:bg-white/20 p-2 rounded-full transition"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-orange-600">Admin Portal</h2>
                    <p className="text-gray-500 text-sm mt-1">Masuk untuk mengelola aplikasi</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600 ml-1">Email Admin</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none transition text-gray-700"
                            type="email"
                            placeholder="admin@mybusiness.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600 ml-1">Password</label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none transition text-gray-700 pr-10"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-orange-500 transition"
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200 mt-4"
                    >
                        Masuk Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;