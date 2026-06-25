import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDriveThumbnail } from "../utils/drive";
import { CameraIcon } from "@heroicons/react/24/outline";
import Header from "../components/Header";

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzgie9Ywen5NRZbMTISiGQV-AlgjhEA6MtiF3Ag1Ko9qm5o-7siAFPrCpp38D_v4HRV/exec";
const toBase64 = (f) => new Promise((res, rej) => { const r=new FileReader(); r.readAsDataURL(f); r.onload=()=>res(r.result); r.onerror=rej; });
const uploadToDrive = async (file) => {
    const b64 = await toBase64(file);
    const res = await fetch(WEB_APP_URL, { method:"POST", body: new URLSearchParams({ file: b64.split(",")[1], mimeType: file.type, filename: file.name }) });
    const result = await res.json();
    if (result.success) return result.url;
    throw new Error(result.error || "Upload gagal");
};

export default function EditProfilePage() {
    const navigate  = useNavigate();
    const [userData, setUserData] = useState({ nama:"", email:"", profileImage:"" });
    const [image, setImage]       = useState(null);
    const [preview, setPreview]   = useState(null);
    const [newPassword, setNewPw] = useState("");
    const [loading, setLoading]   = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return navigate("/loginpage");
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
                const d = snap.data();
                setUserData({ nama: d.nama||"", email: d.email||user.email, profileImage: d.profileImage||"" });
            }
        });
        return () => unsub();
    }, [navigate]);

    const handleFile = (e) => {
        const f = e.target.files[0]; if (!f) return;
        setImage(f); setPreview(URL.createObjectURL(f));
    };

    const handleSave = async () => {
        const user = auth.currentUser; if (!user) return;
        setLoading(true);
        try {
            const photoUrl = image ? await uploadToDrive(image) : userData.profileImage;
            await updateDoc(doc(db, "users", user.uid), { nama: userData.nama, email: userData.email, profileImage: photoUrl });
            if (userData.email !== user.email) await updateEmail(user, userData.email);
            if (newPassword) await updatePassword(user, newPassword);
            alert("Profil berhasil diperbarui!");
            navigate("/account");
        } catch (err) { console.error(err); alert("Gagal memperbarui profil."); }
        finally { setLoading(false); }
    };

    const currentImg = preview || getDriveThumbnail(userData.profileImage, "w200-h200");

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}>
                <Header />
                <div className="px-5 pb-5"><h1 className="text-white font-bold text-xl">Edit Profil</h1></div>
            </div>

            <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-4">
                {/* Avatar */}
                <div className="flex justify-center">
                    <label className="relative cursor-pointer">
                        <img src={currentImg} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <CameraIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center border-2 border-white">
                            <CameraIcon className="w-4 h-4 text-white" />
                        </span>
                        <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                    </label>
                </div>

                {/* Fields */}
                <div className="bg-white rounded-2xl p-4 space-y-4" style={{ border: "1px solid #F3F4F6" }}>
                    <div className="form-group">
                        <label className="label">Nama</label>
                        <input type="text" value={userData.nama} onChange={(e) => setUserData({...userData,nama:e.target.value})} className="input input-muted" />
                    </div>
                    <div className="form-group">
                        <label className="label">Email</label>
                        <input type="email" value={userData.email} onChange={(e) => setUserData({...userData,email:e.target.value})} className="input input-muted" />
                    </div>
                    <div className="form-group">
                        <label className="label">Password Baru</label>
                        <input type="password" placeholder="Kosongkan jika tidak diubah" value={newPassword} onChange={(e) => setNewPw(e.target.value)} className="input input-muted" />
                    </div>
                </div>

                <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-full btn-lg">
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </div>
    );
}
