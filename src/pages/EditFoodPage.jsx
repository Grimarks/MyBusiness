import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getDriveThumbnail } from "../utils/drive";
import Header from "../components/Header";

const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
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
    throw new Error("Upload gagal");
};

export default function EditFoodPage() {
    const location  = useLocation();
    const navigate  = useNavigate();
    const foodId    = location.state?.foodId;

    const [form, setForm]           = useState({ name: "", description: "", price: "", stock: "", image: "" });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading]     = useState(false);

    useEffect(() => {
        const fetchFood = async () => {
            if (!foodId) {
                alert("ID makanan tidak ditemukan");
                navigate(-1);
                return;
            }
            try {
                const snap = await getDoc(doc(db, "foods", foodId));
                if (snap.exists()) setForm(snap.data());
                else { alert("Menu tidak ditemukan"); navigate(-1); }
            } catch (err) {
                console.error(err);
                alert("Gagal memuat data menu");
            }
        };
        fetchFood();
    }, [foodId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foodId) return;
        setLoading(true);
        try {
            const imageUrl = imageFile ? await uploadToDrive(imageFile) : form.image;
            await updateDoc(doc(db, "foods", foodId), {
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

    const inputClass = "w-full p-2 border rounded text-sm sm:text-base";

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
                    className={inputClass}
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Deskripsi Menu"
                    className={inputClass}
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Harga"
                    className={inputClass}
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Stock"
                    className={inputClass}
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
                    disabled={loading}
                    className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm sm:text-base"
                >
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}
