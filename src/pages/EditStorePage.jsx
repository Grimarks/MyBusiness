import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";
const toBase64 = (f) => new Promise((res, rej) => { const r=new FileReader(); r.readAsDataURL(f); r.onload=()=>res(r.result); r.onerror=rej; });
const uploadToDrive = async (file) => {
    const b64 = await toBase64(file);
    const res = await fetch(WEB_APP_URL, { method:"POST", body: new URLSearchParams({ file: b64.split(",")[1], mimeType: file.type, filename: file.name }) });
    const result = await res.json();
    if (result.success) return result.url;
    throw new Error("Upload gagal");
};

export default function EditStorePage() {
    const [form, setForm]     = useState({ kedaiName:"", kedaiAlamat:"", kedaiDeskripsi:"", kedaiImage:"" });
    const [image, setImage]   = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const uid = auth.currentUser?.uid; if (!uid) return;
        getDoc(doc(db, "users", uid)).then((s) => { if (s.exists()) setForm(s.data()); });
    }, []);

    const handleFile = (e) => {
        const f = e.target.files[0]; if (!f) return;
        setImage(f); setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const imageUrl = image ? await uploadToDrive(image) : form.kedaiImage;
            const uid = auth.currentUser?.uid;
            await updateDoc(doc(db, "users", uid), {
                kedaiName: form.kedaiName, kedaiAlamat: form.kedaiAlamat,
                kedaiDeskripsi: form.kedaiDeskripsi, kedaiImage: imageUrl,
            });
            alert("Profil toko berhasil diperbarui!");
        } catch (err) { console.error(err); alert("Gagal update profil!"); }
        finally { setLoading(false); }
    };

    const currentImg = preview || form.kedaiImage;

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}>
                <Header />
                <div className="px-5 pb-5"><h1 className="text-white font-bold text-xl">Edit Profil Toko</h1></div>
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
                                <p className="text-sm font-medium">Upload foto toko</p>
                            </div>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                </label>

                <div className="bg-white rounded-2xl p-4 space-y-4" style={{ border: "1px solid #F3F4F6" }}>
                    <div className="form-group">
                        <label className="label">Nama Toko</label>
                        <input type="text" placeholder="Nama toko kamu" value={form.kedaiName} onChange={(e) => setForm({...form,kedaiName:e.target.value})} className="input input-muted" />
                    </div>
                    <div className="form-group">
                        <label className="label">Alamat</label>
                        <input type="text" placeholder="Alamat lengkap" value={form.kedaiAlamat} onChange={(e) => setForm({...form,kedaiAlamat:e.target.value})} className="input input-muted" />
                    </div>
                    <div className="form-group">
                        <label className="label">Deskripsi Toko</label>
                        <textarea rows={3} placeholder="Ceritakan tentang tokomu..." value={form.kedaiDeskripsi} onChange={(e) => setForm({...form,kedaiDeskripsi:e.target.value})} className="input input-muted resize-none" />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-full btn-lg">
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}
