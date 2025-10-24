import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Header from "../components/Header.jsx";

// === Helpers ===
const getDriveThumbnail = (url, size = "w200-h200") => {
    if (!url) return "/default-food.png";
    const ucMatch = url.match(/id=([^&]+)/);
    if (ucMatch) return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=${size}`;
    const dMatch = url.match(/\/d\/([^/]+)\//);
    if (dMatch) return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=${size}`;
    return url;
};

export default function EditFoodPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const foodId = location.state?.foodId;

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const WEB_APP_URL =
        "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";

    useEffect(() => {
        const fetchFood = async () => {
            if (!foodId) {
                alert("ID makanan tidak ditemukan");
                navigate(-1);
                return;
            }
            try {
                const foodRef = doc(db, "foods", foodId);
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
    }, [foodId, navigate]);

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
        if (!foodId) return;
        setLoading(true);

        try {
            let imageUrl = form.image;
            if (imageFile) {
                imageUrl = await uploadToDrive();
            }

            const foodRef = doc(db, "foods", foodId);
            await updateDoc(foodRef, {
                ...form,
                price: parseInt(form.price) || 0,
                stock: parseInt(form.stock) || 0,
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
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400">
            <Header title="Edit Menu" />
            <form
                className="p-4 sm:p-6 max-w-lg mx-auto space-y-4 bg-white rounded-2xl shadow-md mt-4 sm:mt-8 w-[90%] sm:w-full"
                onSubmit={handleSubmit}
            >
                <input
                    type="text"
                    placeholder="Nama Menu"
                    className="w-full p-2 border rounded text-sm sm:text-base"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Deskripsi Menu"
                    className="w-full p-2 border rounded text-sm sm:text-base"
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Harga"
                    className="w-full p-2 border rounded text-sm sm:text-base"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Stock"
                    className="w-full p-2 border rounded text-sm sm:text-base"
                    value={form.stock || ""}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="text-sm"
                />
                {form.image && (
                    <img
                        src={getDriveThumbnail(form.image, "w300-h300")}
                        alt="Preview"
                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded mt-2 mx-auto"
                    />
                )}
                <button
                    type="submit"
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm sm:text-base"
                    disabled={loading}
                >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}
