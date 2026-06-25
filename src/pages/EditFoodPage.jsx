import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getDriveThumbnail } from "../utils/drive";
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
    throw new Error("Upload gagal");
};

export default function EditFoodPage() {
    const { state }  = useLocation();
    const navigate   = useNavigate();
    const foodId     = state?.foodId;
    const [form, setForm]       = useState({ name:"", description:"", price:"", stock:"", image:"" });
    const [imageFile, setFile]  = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!foodId) { alert("ID makanan tidak ditemukan"); navigate(-1); return; }
        getDoc(doc(db, "foods", foodId)).then((snap) => {
            if (snap.exists()) setForm(snap.data());
            else { alert("Menu tidak ditemukan"); navigate(-1); }
        });
    }, [foodId]);

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); if (!foodId) return;
        setLoading(true);
        try {
            const imageUrl = imageFile ? await uploadToDrive(imageFile) : form.image;
            await updateDoc(doc(db, "foods", foodId), {
                ...form, price: parseInt(form.price)||0, stock: parseInt(form.stock)||0, image: imageUrl,
            });
            alert("Menu berhasil diperbarui!");
            navigate(-1);
        } catch (err) { console.error(err); alert("Gagal update menu!"); }
        finally { setLoading(false); }
    };

    const currentImg = preview || (form.image ? getDriveThumbnail(form.image, "w600-h600") : null);

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}>
                <Header />
                <div className="px-5 pb-5"><h1 className="text-white font-bold text-xl">Edit Menu</h1></div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
                <label className="block cursor-pointer">
                    <div className={`relative w-full h-44 rounded-2xl overflow-hidden flex items-center justify-center bg-white border-2 border-dashed ${currentImg ? "border-transparent" : "border-gray-300"}`}>
                        {currentImg ? (
                            <>
                                <img src={currentImg} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <p className="text-white text-sm font-semibold">Ganti Foto</p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <PhotoIcon className="w-12 h-12 mb-2" />
                                <p className="text-sm font-medium">Klik untuk upload foto</p>
                            </div>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                </label>

                <div className="bg-white rounded-2xl p-4 space-y-4" style={{ border: "1px solid #F3F4F6" }}>
                    <div className="form-group">
                        <label className="label">Nama Menu</label>
                        <input type="text" value={form.name||""} onChange={(e) => setForm({...form,name:e.target.value})} className="input input-muted" required />
                    </div>
                    <div className="form-group">
                        <label className="label">Deskripsi</label>
                        <textarea rows={3} value={form.description||""} onChange={(e) => setForm({...form,description:e.target.value})} className="input input-muted resize-none" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 grid grid-cols-2 gap-3" style={{ border: "1px solid #F3F4F6" }}>
                    <div className="form-group">
                        <label className="label">Harga (Rp)</label>
                        <input type="number" value={form.price||""} onChange={(e) => setForm({...form,price:e.target.value})} className="input input-muted" required />
                    </div>
                    <div className="form-group">
                        <label className="label">Stock</label>
                        <input type="number" value={form.stock||""} onChange={(e) => setForm({...form,stock:e.target.value})} className="input input-muted" required />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}
