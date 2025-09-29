import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Header from "../components/Header.jsx";

export default function EditStorePage() {
    const [form, setForm] = useState({
        kedaiName: "",
        kedaiAlamat: "",
        kedaiDeskripsi: "",
        kedaiImage: "",
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const WEB_APP_URL = "YOUR_WEB_APP_URL";

    useEffect(() => {
        const fetchData = async () => {
            const uid = auth.currentUser.uid;
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setForm(userSnap.data());
            }
        };
        fetchData();
    }, []);

    const uploadToDrive = async () => {
        const base64 = await toBase64(image);
        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            body: new URLSearchParams({
                file: base64.split(",")[1],
                mimeType: image.type,
                filename: image.name,
            }),
        });
        const result = await res.json();
        if (result.success) return result.url;
        throw new Error("Upload gagal");
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = form.kedaiImage;
            if (image) {
                imageUrl = await uploadToDrive();
            }

            const uid = auth.currentUser.uid;
            const userRef = doc(db, "users", uid);

            await updateDoc(userRef, {
                kedaiName: form.kedaiName,
                kedaiAlamat: form.kedaiAlamat,
                kedaiDeskripsi: form.kedaiDeskripsi,
                kedaiImage: imageUrl,
            });

            alert("Profil toko berhasil diperbarui!");
        } catch (err) {
            console.error(err);
            alert("Gagal update profil!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 ">
            <Header title="Profil Toko" />
            <form   className="p-4 max-w-md mx-auto space-y-4 bg-white rounded-2xl shadow-md mt-4"
                    onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nama Toko"
                    className="w-full p-2 border rounded"
                    value={form.kedaiName}
                    onChange={(e) => setForm({ ...form, kedaiName: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Alamat"
                    className="w-full p-2 border rounded"
                    value={form.kedaiAlamat}
                    onChange={(e) => setForm({ ...form, kedaiAlamat: e.target.value })}
                />
                <textarea
                    placeholder="Deskripsi Toko"
                    className="w-full p-2 border rounded"
                    value={form.kedaiDeskripsi}
                    onChange={(e) => setForm({ ...form, kedaiDeskripsi: e.target.value })}
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                />
                <button
                    type="submit"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                    disabled={loading}
                >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}
