import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
    TrashIcon, PencilSquareIcon, UserGroupIcon, ShoppingBagIcon,
    ChartBarIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Loader from "../components/Loader";

const ROLE_BADGE = {
    admin:     "bg-red-100 text-red-600",
    pemilik:   "bg-blue-100 text-blue-600",
    pelanggan: "bg-green-100 text-green-600",
};

export default function AdminPage() {
    const [tab, setTab]       = useState("dashboard");
    const [users, setUsers]   = useState([]);
    const [foods, setFoods]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats]   = useState({ users:0, foods:0, orders:0 });
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return navigate("/admin");
            try {
                const snap = await getDoc(doc(db,"users",user.uid));
                if (!snap.exists() || snap.data().role !== "admin") { alert("Akses Ditolak!"); navigate("/home"); return; }
                load();
            } catch { navigate("/admin"); }
        });
        return () => unsub();
    }, []);

    const load = async () => {
        setLoading(true);
        const [us, fs, os] = await Promise.all([
            getDocs(collection(db,"users")),
            getDocs(collection(db,"foods")),
            getDocs(collection(db,"order")),
        ]);
        setUsers(us.docs.map((d) => ({ id:d.id,...d.data() })));
        setFoods(fs.docs.map((d) => ({ id:d.id,...d.data() })));
        setStats({ users:us.size, foods:fs.size, orders:os.size });
        setLoading(false);
    };

    const delUser  = async (id) => { if (!window.confirm("Hapus user ini?")) return; await deleteDoc(doc(db,"users",id)); setUsers((p) => p.filter((u) => u.id!==id)); };
    const roleUser = async (id, cur) => { const r=prompt("Role baru (admin/pemilik/pelanggan):",cur); if (r&&["admin","pemilik","pelanggan"].includes(r)) { await updateDoc(doc(db,"users",id),{role:r}); setUsers((p) => p.map((u) => u.id===id?{...u,role:r}:u)); } };
    const delFood  = async (id) => { if (!window.confirm("Hapus makanan ini?")) return; await deleteDoc(doc(db,"foods",id)); setFoods((p) => p.filter((f) => f.id!==id)); };
    const editStock= async (id, cur) => { const s=prompt("Update stok:",cur); if (s!==null&&!isNaN(s)) { await updateDoc(doc(db,"foods",id),{stock:parseInt(s)}); setFoods((p) => p.map((f) => f.id===id?{...f,stock:parseInt(s)}:f)); } };

    if (loading) return <Loader message="Memuat dashboard..." />;

    const TABS = [
        { id:"dashboard", label:"Dashboard", icon:ChartBarIcon },
        { id:"users",     label:"Pengguna",  icon:UserGroupIcon },
        { id:"foods",     label:"Makanan",   icon:ShoppingBagIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top bar */}
            <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50" style={{ borderBottom:"1px solid #F3F4F6" }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center">
                        <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900 text-sm">Admin Panel</h1>
                        <p className="text-gray-400 text-xs">MyBusiness</p>
                    </div>
                </div>
                <button
                    onClick={async () => { await signOut(auth); navigate("/admin"); }}
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-semibold"
                >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                </button>
            </header>

            {/* Nav tabs */}
            <div className="bg-white border-b border-gray-100 flex gap-1 px-4 sticky top-[61px] z-40">
                {TABS.map((t) => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                            tab===t.id ? "border-orange-500 text-orange-500" : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}>
                        <t.icon className="w-4 h-4" />{t.label}
                    </button>
                ))}
            </div>

            <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
                {/* Dashboard */}
                {tab==="dashboard" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        {[
                            { title:"Total Pengguna", val:stats.users,  icon:UserGroupIcon,  color:"from-blue-400 to-blue-600" },
                            { title:"Total Makanan",  val:stats.foods,  icon:ShoppingBagIcon, color:"from-green-400 to-green-600" },
                            { title:"Total Pesanan",  val:stats.orders, icon:ChartBarIcon,    color:"from-orange-400 to-orange-600" },
                        ].map((s) => (
                            <div key={s.title} className={`bg-gradient-to-br ${s.color} p-5 rounded-2xl text-white flex items-center justify-between shadow-md`}>
                                <div>
                                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{s.title}</p>
                                    <p className="text-4xl font-bold mt-1">{s.val}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <s.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users */}
                {tab==="users" && (
                    <div className="mt-4 bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border:"1px solid #F3F4F6" }}>
                        <div className="p-4 border-b border-gray-50">
                            <h2 className="font-bold text-gray-900">Daftar Pengguna</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nama</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-center">Role</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-gray-900">{u.nama||"Tanpa Nama"}</td>
                                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`badge text-[11px] ${ROLE_BADGE[u.role]||""}`}>{u.role}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => roleUser(u.id,u.role)} className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"><PencilSquareIcon className="w-4 h-4"/></button>
                                                    <button onClick={() => delUser(u.id)}          className="p-2 rounded-lg bg-red-50  text-red-400  hover:bg-red-100  transition-colors"><TrashIcon         className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Foods */}
                {tab==="foods" && (
                    <div className="mt-4 bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border:"1px solid #F3F4F6" }}>
                        <div className="p-4 border-b border-gray-50">
                            <h2 className="font-bold text-gray-900">Daftar Makanan</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nama Menu</th>
                                        <th className="px-4 py-3 text-left">Kategori</th>
                                        <th className="px-4 py-3 text-right">Harga</th>
                                        <th className="px-4 py-3 text-center">Stok</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {foods.map((f) => (
                                        <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-gray-900">{f.name}</td>
                                            <td className="px-4 py-3"><span className="badge badge-orange text-[11px]">{f.category}</span></td>
                                            <td className="px-4 py-3 text-right font-semibold text-orange-500">Rp {f.price?.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`badge text-[11px] ${f.stock>0?"badge-success":"badge-error"}`}>{f.stock}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => editStock(f.id,f.stock)} className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"><PencilSquareIcon className="w-4 h-4"/></button>
                                                    <button onClick={() => delFood(f.id)}           className="p-2 rounded-lg bg-red-50  text-red-400  hover:bg-red-100  transition-colors"><TrashIcon         className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
