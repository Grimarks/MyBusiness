import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Header from "../components/Header.jsx";

export default function EditFoodPage() {
    const { id } = useParams(); // id food dari URL
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🔑 Ganti dengan URL Web App Google Apps Script
    const WEB_APP_URL =
        "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";

    // Fetch data food by ID
    useEffect(() => {
        const fetchFood = async () => {
            try {
                const foodRef = doc(db, "foods", id);
                const foodSnap = await getDoc(foodRef);

                if (foodSnap.exists()) {
                    setForm(foodSnap.data());
                } else {
                    alert("Menu tidak ditemukan");
                    navigate(-1);
                }
            } catch (err) {
                console.error(err);
                alert("Gagal memuat data menu");
            }
        };
        fetchFood();
    }, [id, navigate]);

    // Upload ke Google Drive
    const uploadToDrive = async () => {
        const base64 = await toBase64(imageFile);
        const res = await fetch(WEB_APP_URL, {
            method: "POST",
            body: new URLSearchParams({
                file: base64.split(",")[1],
                mimeType: imageFile.type,
                filename: imageFile.name,
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
            let imageUrl = form.image;
            if (imageFile) {
                imageUrl = await uploadToDrive();
            }

            const foodRef = doc(db, "foods", id);
            await updateDoc(foodRef, {
                name: form.name,
                description: form.description,
                price: parseInt(form.price),
                stock: parseInt(form.stock),
                image: imageUrl,
            });

            alert("Menu berhasil diperbarui!");
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert("Gagal update menu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Header title="Edit Menu" />
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    placeholder="Nama Menu"
                    className="w-full p-2 border rounded"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Deskripsi Menu"
                    className="w-full p-2 border rounded"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Harga"
                    className="w-full p-2 border rounded"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Stock"
                    className="w-full p-2 border rounded"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                />
                {form.image && (
                    <img
                        src={form.image}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded mt-2"
                    />
                )}
                <button
                    type="submit"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    disabled={loading}
                >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}
