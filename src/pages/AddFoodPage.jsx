import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";

const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader(); r.readAsDataURL(file);
    r.onload = () => res(r.result); r.onerror = rej;
});

const uploadToDrive = async (file) => {
    const b64 = await toBase64(file);
    const res = await fetch(WEB_APP_URL, {
        method: "POST",
        body: new URLSearchParams({ file: b64.split(",")[1], mimeType: file.type, filename: file.name }),
    });
    const result = await res.json();
    if (result.success) return result.url;
    throw new Error(result.error || "Upload gagal");
};

const INIT = { name:"", description:"", price:"", stock:"", category:"Cepat Saji", location:"Indralaya", status: true };
const CATEGORIES = ["Cepat Saji","Ayam Geprek","Mie","Sayur","Steak","Jamur","Kopi"];
const LOCATIONS  = ["Indralaya","Bukit"];

export default function AddFoodPage() {
    const [form, setForm]     = useState(INIT);
    const [image, setImage]   = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setImage(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return alert("Pilih gambar dulu");
        setLoading(true);
        try {
            const imageUrl   = await uploadToDrive(image);
            const uid        = auth.currentUser?.uid || "unknown";
            const stockInt   = parseInt(form.stock) || 0;
            await addDoc(collection(db, "foods"), {
                name: form.name, description: form.description,
                price: parseInt(form.price), stock: stockInt,
                category: form.category, location: form.location,
                image: imageUrl, uid, rating: 0, review: 0,
                status: stockInt > 0 ? true : form.status,
            });
            alert("Menu berhasil ditambahkan!");
            setForm(INIT); setImage(null); setPreview(null);
        } catch (err) { console.error(err); alert("Gagal upload!"); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}>
                <Header />
                <div className="px-5 pb-5"><h1 className="text-white font-bold text-xl">Tambah Menu</h1></div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
                {/* Image picker */}
                <label className="block cursor-pointer">
                    <div className={`relative w-full h-44 rounded-2xl overflow-hidden flex items-center justify-center bg-white border-2 border-dashed transition-colors ${preview ? "border-transparent" : "border-gray-300 hover:border-orange-400"}`}>
                        {preview ? (
                            <>
                                <img src={preview} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <p className="text-white text-sm font-semibold">Ganti Foto</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <PhotoIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm font-medium">Klik untuk upload foto</p>
                                <p className="text-xs mt-0.5">JPG, PNG (max 5MB)</p>
                            </div>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFile} className="sr-only" required />
                </label>

                {/* Name */}
                <div className="bg-white rounded-2xl p-4 space-y-4" style={{ border: "1px solid #F3F4F6" }}>
                    <div className="form-group">
                        <label className="label">Nama Menu</label>
                        <input type="text" placeholder="contoh: Ayam Geprek Spesial" value={form.name} onChange={(e) => set("name", e.target.value)} className="input input-muted" required />
                    </div>
                    <div className="form-group">
                        <label className="label">Deskripsi</label>
                        <textarea placeholder="Deskripsikan menu ini..." rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className="input input-muted resize-none" required />
                    </div>
                </div>

                {/* Price & Stock */}
                <div className="bg-white rounded-2xl p-4 grid grid-cols-2 gap-3" style={{ border: "1px solid #F3F4F6" }}>
                    <div className="form-group">
                        <label className="label">Harga (Rp)</label>
                        <input type="number" placeholder="15000" value={form.price} onChange={(e) => set("price", e.target.value)} className="input input-muted" required />
                    </div>
                    <div className="form-group">
                        <label className="label">Stock</label>
                        <input type="number" placeholder="10" value={form.stock} onChange={(e) => set("stock", e.target.value)} className="input input-muted" required />
                    </div>
                </div>

                {/* Category & Location */}
                <div className="bg-white rounded-2xl p-4 grid grid-cols-2 gap-3" style={{ border: "1px solid #F3F4F6" }}>
                    <div className="form-group">
                        <label className="label">Kategori</label>
                        <select value={form.category} onChange={(e) => set("category", e.target.value)} className="input input-muted">
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Lokasi</label>
                        <select value={form.location} onChange={(e) => set("location", e.target.value)} className="input input-muted">
                            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                {!form.stock && (
                    <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F3F4F6" }}>
                        <label className="label">Status</label>
                        <select value={form.status ? "ready" : "habis"} onChange={(e) => set("status", e.target.value === "ready")} className="input input-muted">
                            <option value="ready">Tersedia</option>
                            <option value="habis">Habis</option>
                        </select>
                    </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
                    {loading ? "Mengupload..." : "Simpan Menu"}
                </button>
            </form>
        </div>
    );
}
