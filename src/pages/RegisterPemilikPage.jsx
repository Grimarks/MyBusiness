import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, db } from "../firebaseConfig";
import Loader from "../components/Loader";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const RegisterPemilikPage = () => {
    const [nama, setNama] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        // 🔒 Validasi password
        if (password.length < 6 || password.length > 12) {
            setError("Password harus 6–12 karakter!");
            return;
        }

        if (password !== confirmPassword) {
            setError("Password dan Konfirmasi Password tidak sama!");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user) {
                await setDoc(doc(db, "users", user.uid), {
                    nama,
                    email,
                    role: "pemilik",
                    uid: user.uid,
                    password,
                });
                alert("Registrasi berhasil!");
                navigate("/loginpage");
            }
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setError("Email sudah digunakan! Silakan gunakan email lain.");
            } else if (err.code === "auth/invalid-email") {
                setError("Format email tidak valid!");
            } else {
                setError("Terjadi kesalahan: " + err.message);
            }
            console.error("Registration failed:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader message="Sedang mendaftarkan..." />;
    }

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-orange-500 to-yellow-400 flex flex-col">
            <div className="text-white px-6 pt-12 pb-8">
                <h1 className="text-3xl font-bold">Daftar sebagai Pemilik Usaha</h1>
                <p className="text-sm mt-2">Buat akun dan mulai kelola bisnis Anda di MyBusiness.</p>
            </div>

            <div className="bg-white pt-10 pb-16 px-6 flex-grow flex flex-col justify-between rounded-tr-[150px]">
                <form onSubmit={handleRegister} className="flex flex-col px-6 space-y-6">
                    <h2 className="text-3xl font-bold text-orange-600">Daftar</h2>

                    {/* Nama */}
                    <div className="flex items-center bg-[#F2F2F2] px-4 py-3 rounded-xl">
                        <input
                            type="text"
                            placeholder="Nama Lengkap"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="bg-transparent w-full focus:outline-none text-gray-700"
                            required
                        />
                    </div>

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

                    {/* Password */}
                    <div className="flex items-center bg-[#F2F2F2] px-4 py-3 rounded-xl relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (6–12 karakter)"
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
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="flex items-center bg-[#F2F2F2] px-4 py-3 rounded-xl relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Konfirmasi Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-transparent w-full focus:outline-none text-gray-700"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="block text-center bg-[#FF8C4B] text-white py-3 rounded-xl font-bold text-lg"
                    >
                        Daftar
                    </button>
                </form>

                <div className="text-center text-sm mt-12">
                    Sudah punya akun?{" "}
                    <Link to="/loginpage">
                        <span className="font-bold text-black cursor-pointer hover:underline">Masuk</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPemilikPage;
