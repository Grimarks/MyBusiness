import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDriveThumbnail } from "../utils/drive";
import Header from "../components/Header";

const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload  = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });

const uploadToDrive = async (file) => {
    const base64 = await toBase64(file);
    const res    = await fetch(WEB_APP_URL, {
        method: "POST",
        body: new URLSearchParams({
            file: base64.split(",")[1],
            mimeType: file.type,
            filename: file.name,
        }),
    });
    const result = await res.json();
    if (result.success) return result.url;
    throw new Error(result.error || "Upload gagal");
};

const FIELD_CLASS = "w-full p-2 border rounded-lg text-sm sm:text-base";
const LABEL_CLASS = "block font-semibold text-sm sm:text-base";

export default function EditProfilePage() {
    const navigate  = useNavigate();
    const [userData, setUserData] = useState({ nama: "", email: "", profileImage: "" });
    const [image, setImage]       = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading]   = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return navigate("/loginpage");
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
                const data = snap.data();
                setUserData({
                    nama: data.nama || "",
                    email: data.email || user.email,
                    profileImage: data.profileImage || "",
                });
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;
        setLoading(true);
        try {
            const photoUrl = image ? await uploadToDrive(image) : userData.profileImage;

            await updateDoc(doc(db, "users", user.uid), {
                nama: userData.nama,
                email: userData.email,
                profileImage: photoUrl,
            });

            if (userData.email !== user.email) await updateEmail(user, userData.email);
            if (newPassword) await updatePassword(user, newPassword);

            alert("Profil berhasil diperbarui!");
            navigate("/account");
        } catch (err) {
            console.error("Gagal update:", err);
            alert("Gagal memperbarui profil.");
        } finally {
            setLoading(false);
        }
    };

    const imgSrc = getDriveThumbnail(userData.profileImage, "w200-h200");

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400">
            <Header />
            <div className="bg-white rounded-t-3xl p-4 sm:p-6 mt-6 max-w-lg mx-auto w-[90%] sm:w-full">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">Edit Profil</h2>

                <div className="flex flex-col items-center mb-4">
                    <img
                        src={imgSrc}
                        alt="Profile"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover mb-3"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="text-sm"
                    />
                </div>

                <div className="space-y-3">
                    <div>
                        <label className={LABEL_CLASS}>Nama</label>
                        <input
                            type="text"
                            value={userData.nama}
                            onChange={(e) => setUserData({ ...userData, nama: e.target.value })}
                            className={FIELD_CLASS}
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Email</label>
                        <input
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            className={FIELD_CLASS}
                        />
                    </div>
                    <div>
                        <label className={LABEL_CLASS}>Password Baru</label>
                        <input
                            type="password"
                            placeholder="Kosongkan jika tidak diubah"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={FIELD_CLASS}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-yellow-400 text-black py-3 rounded-full font-semibold hover:bg-yellow-500 transition mt-5 text-sm sm:text-base"
                >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </div>
    );
}
