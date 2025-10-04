import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Loader from "../components/Loader";

const ForgotPasswordPage = () => {
    const [nama, setNama] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("pelanggan");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword.length !== 6) {
            setError("Password baru harus 6 karakter!");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Password konfirmasi tidak cocok!");
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, "users"),
                where("email", "==", email),
                where("nama", "==", nama),
                where("role", "==", role)
            );

            const snap = await getDocs(q);

            if (snap.empty) {
                setError("Data tidak cocok. Periksa nama, email, dan role!");
            } else {
                const userDoc = snap.docs[0];
                await updateDoc(doc(db, "users", userDoc.id), {
                    password: newPassword,
                });
                setSuccess("Password berhasil diperbarui! Silakan login.");
                setTimeout(() => navigate("/loginpage"), 2000);
            }
        } catch (err) {
            console.error("Reset gagal:", err);
            setError("Terjadi kesalahan, coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader message="Memproses..." />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-orange-600 text-center mb-6">Lupa Password</h1>

                <form onSubmit={handleReset} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none"
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none"
                        required
                    >
                        <option value="pelanggan">Pelanggan</option>
                        <option value="pemilik">Pemilik</option>
                    </select>

                    <input
                        type="password"
                        placeholder="Password Baru (6 karakter)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Konfirmasi Password Baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none"
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">{success}</p>}

                    <button
                        type="submit"
                        className="w-full bg-[#FF8C4B] text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
