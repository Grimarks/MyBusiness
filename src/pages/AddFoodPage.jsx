import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Header from "../components/Header.jsx"

export default function AddFoodPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("Cepat Saji");
    const [location, setLocation] = useState("Indralaya");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const WEB_APP_URL =
        "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";

    // Upload ke Google Drive via Apps Script
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
        if (result.success) {
            return result.url;
        } else {
            throw new Error(result.error || "Upload gagal");
        }
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert("Pilih gambar dulu");
        setLoading(true);

        try {
            const imageUrl = await uploadToDrive();
            const uid = auth.currentUser?.uid || "unknown";

            await addDoc(collection(db, "foods"), {
                name,
                description,
                price: parseInt(price),
                stock: parseInt(stock),
                category,
                location,
                image: imageUrl,
                uid,
                rating: 0,
                review: 0,
            });

            alert("Menu berhasil ditambahkan!");
            setName("");
            setDescription("");
            setPrice("");
            setStock("");
            setCategory("Cepat Saji");
            setLocation("Indralaya");
            setImage(null);
        } catch (err) {
            console.error(err);
            alert("Gagal upload!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 ">
            <Header title="Tambah Menu" />

            <form
                onSubmit={handleSubmit}
                className="p-4 max-w-md mx-auto space-y-4 bg-white rounded-2xl shadow-md mt-4"
            >
                <div>
                    <label className="block font-semibold">Nama</label>
                    <input
                        type="text"
                        placeholder="Masukan nama menu"
                        className="w-full p-2 border rounded-lg"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block font-semibold">Deskripsi</label>
                    <textarea
                        placeholder="Masukan deskripsi menu"
                        className="w-full p-2 border rounded-lg"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block font-semibold">Harga</label>
                    <input
                        type="number"
                        placeholder="Masukan harga menu"
                        className="w-full p-2 border rounded-lg"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block font-semibold">Stock</label>
                    <input
                        type="number"
                        placeholder="Masukan stock"
                        className="w-full p-2 border rounded-lg"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block font-semibold">Kategori</label>
                    <select
                        className="w-full p-2 border rounded-lg"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Cepat Saji">Cepat Saji</option>
                        <option value="Ayam Geprek">Ayam Geprek</option>
                        <option value="Mie">Mie</option>
                        <option value="Sayur">Sayur</option>
                    </select>
                </div>

                <div>
                    <label className="block font-semibold">Lokasi</label>
                    <select
                        className="w-full p-2 border rounded-lg"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <option value="Indralaya">Indralaya</option>
                        <option value="Bukit">Bukit</option>
                    </select>
                </div>

                <div>
                    <label className="block font-semibold">Foto</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full"
                        onChange={(e) => setImage(e.target.files[0])}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-yellow-400 text-black py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Mengupload..." : "Simpan"}
                </button>
            </form>
        </div>
    );
}
