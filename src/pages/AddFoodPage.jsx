import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Header from "../components/Header";

const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });

const uploadToDrive = async (file) => {
    const base64 = await toBase64(file);
    const res = await fetch(WEB_APP_URL, {
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

const INITIAL_FORM = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "Cepat Saji",
    location: "Indralaya",
    status: true,
};

export default function AddFoodPage() {
    const [form, setForm]       = useState(INITIAL_FORM);
    const [image, setImage]     = useState(null);
    const [loading, setLoading] = useState(false);

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert("Pilih gambar dulu");
        setLoading(true);
        try {
            const imageUrl  = await uploadToDrive(image);
            const uid       = auth.currentUser?.uid || "unknown";
            const stockInt  = parseInt(form.stock) || 0;
            const finalStatus = stockInt > 0 ? true : form.status;

            await addDoc(collection(db, "foods"), {
                name: form.name,
                description: form.description,
                price: parseInt(form.price),
                stock: stockInt,
                category: form.category,
                location: form.location,
                image: imageUrl,
                uid,
                rating: 0,
                review: 0,
                status: finalStatus,
            });

            alert("Menu berhasil ditambahkan!");
            setForm(INITIAL_FORM);
            setImage(null);
        } catch (err) {
            console.error(err);
            alert("Gagal upload!");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-2 sm:p-3 border rounded-lg text-sm sm:text-base";
    const labelClass = "block font-semibold text-sm sm:text-base";

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 flex flex-col">
            <Header title="Tambah Menu" />
            <form
                onSubmit={handleSubmit}
                className="flex-1 p-4 sm:p-6 max-w-md w-full mx-auto space-y-4 bg-white rounded-2xl shadow-md mt-4 sm:mt-6"
            >
                <div>
                    <label className={labelClass}>Nama</label>
                    <input
                        type="text"
                        placeholder="Masukan nama menu"
                        className={inputClass}
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>Deskripsi</label>
                    <textarea
                        placeholder="Masukan deskripsi menu"
                        className={inputClass}
                        value={form.description}
                        onChange={(e) => setField("description", e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Harga</label>
                        <input
                            type="number"
                            placeholder="Masukan harga"
                            className={inputClass}
                            value={form.price}
                            onChange={(e) => setField("price", e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Stock</label>
                        <input
                            type="number"
                            placeholder="Masukan stock"
                            className={inputClass}
                            value={form.stock}
                            onChange={(e) => setField("stock", e.target.value)}
                            required
                        />
                    </div>
                </div>

                {!form.stock && (
                    <div>
                        <label className={labelClass}>Status Ketersediaan</label>
                        <select
                            className={inputClass}
                            value={form.status ? "ready" : "habis"}
                            onChange={(e) => setField("status", e.target.value === "ready")}
                        >
                            <option value="ready">Ready</option>
                            <option value="habis">Habis</option>
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Kategori</label>
                        <select
                            className={inputClass}
                            value={form.category}
                            onChange={(e) => setField("category", e.target.value)}
                        >
                            <option value="Cepat Saji">Cepat Saji</option>
                            <option value="Ayam Geprek">Ayam Geprek</option>
                            <option value="Mie">Mie</option>
                            <option value="Sayur">Sayur</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Lokasi</label>
                        <select
                            className={inputClass}
                            value={form.location}
                            onChange={(e) => setField("location", e.target.value)}
                        >
                            <option value="Indralaya">Indralaya</option>
                            <option value="Bukit">Bukit</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Foto</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full text-sm sm:text-base"
                        onChange={(e) => setImage(e.target.files[0])}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-400 text-black py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors text-sm sm:text-base"
                >
                    {loading ? "Mengupload..." : "Simpan"}
                </button>
            </form>
        </div>
    );
}
