import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore"; // Ganti collection/query dengan doc/getDoc
import { useNavigate } from "react-router-dom";

const AdminLoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        try {
            // 1. Login Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Ambil data user dari Firestore menggunakan UID (bukan query email)
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            // 3. Cek apakah dokumen ada
            if (!docSnap.exists()) {
                alert("Akun terdaftar di Auth, tapi data tidak ditemukan di Database Users.");
                return;
            }

            const userData = docSnap.data();

            // 4. Cek Role
            if (userData.role !== "admin") {
                alert("Akses ditolak! Akun ini bukan akun Admin.");
                return;
            }

            // 5. Sukses
            navigate("/admin");

        } catch (error) {
            console.error("Login Error:", error);
            alert("Login gagal: Email/Password salah atau terjadi kesalahan jaringan.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
                onSubmit={handleAdminLogin}
            >
                <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">Admin Login</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white p-3 rounded-xl font-bold hover:bg-orange-600 transition duration-200"
                >
                    Masuk Dashboard
                </button>
            </form>
        </div>
    );
};

export default AdminLoginPage;