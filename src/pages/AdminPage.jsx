import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where,
    getDoc // ✅ TAMBAHKAN INI (Penting!)
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../components/Header";
import Loader from "../components/Loader";
import {
    TrashIcon,
    PencilSquareIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalFoods: 0, totalOrders: 0 });
    const navigate = useNavigate();

    // 🛡️ Cek Akses Admin
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/loginpage"); // Redirect jika tidak login
                return;
            }

            try {
                // 🔍 Cek dokumen user berdasarkan UID untuk memastikan role admin
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef); // ✅ Sekarang getDoc sudah didefinisikan

                if (!docSnap.exists()) {
                    alert("Data pengguna tidak ditemukan.");
                    navigate("/loginpage");
                    return;
                }

                const userData = docSnap.data();

                // 🚫 Tendang jika bukan admin
                if (userData.role !== "admin") {
                    alert("Akses Ditolak! Anda bukan Admin.");
                    navigate("/home");
                    return;
                }

                // ✅ Jika admin, muat data
                fetchData();
            } catch (err) {
                console.error("Gagal verifikasi admin:", err);
                alert("Terjadi kesalahan saat memuat profil admin.");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Ambil Users
            const usersSnap = await getDocs(collection(db, "users"));
            const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);

            // Ambil Foods
            const foodsSnap = await getDocs(collection(db, "foods"));
            const foodsList = foodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFoods(foodsList);

            // Ambil Orders untuk Statistik
            const ordersSnap = await getDocs(collection(db, "order"));

            setStats({
                totalUsers: usersSnap.size,
                totalFoods: foodsSnap.size,
                totalOrders: ordersSnap.size
            });

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🗑️ Hapus User
    const handleDeleteUser = async (id) => {
        if (window.confirm("Yakin ingin menghapus user ini?")) {
            try {
                await deleteDoc(doc(db, "users", id));
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error("Gagal menghapus user:", error);
                alert("Gagal menghapus user.");
            }
        }
    };

    // ✏️ Ubah Role User
    const handleChangeRole = async (id, currentRole) => {
        const newRole = prompt("Masukkan role baru (admin/pemilik/pelanggan):", currentRole);
        if (newRole && ["admin", "pemilik", "pelanggan"].includes(newRole)) {
            try {
                await updateDoc(doc(db, "users", id), { role: newRole });
                setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            } catch (error) {
                console.error("Gagal update role:", error);
                alert("Gagal mengubah role.");
            }
        } else if (newRole) {
            alert("Role tidak valid! Gunakan: admin, pemilik, atau pelanggan.");
        }
    };

    // 🗑️ Hapus Makanan
    const handleDeleteFood = async (id) => {
        if (window.confirm("Hapus makanan ini dari database?")) {
            try {
                await deleteDoc(doc(db, "foods", id));
                setFoods(foods.filter(food => food.id !== id));
            } catch (error) {
                console.error("Gagal menghapus makanan:", error);
                alert("Gagal menghapus makanan.");
            }
        }
    };

    // ✏️ Edit Stok Makanan (Simpel)
    const handleEditFoodStock = async (id, currentStock) => {
        const newStock = prompt("Update stok:", currentStock);
        if (newStock !== null) {
            try {
                const stockValue = parseInt(newStock);
                if (isNaN(stockValue)) return alert("Stok harus berupa angka!");

                await updateDoc(doc(db, "foods", id), { stock: stockValue });
                setFoods(foods.map(f => f.id === id ? { ...f, stock: stockValue } : f));
            } catch (error) {
                console.error("Gagal update stok:", error);
                alert("Gagal mengubah stok.");
            }
        }
    };

    if (loading) return <Loader message="Memuat Data Admin..." />;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
                <Header greeting="Admin Panel" subtitle="Kelola Aplikasi" />
            </div>

            <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-80px)]">
                {/* Sidebar */}
                <aside className="bg-white w-full md:w-64 p-4 shadow-md flex md:flex-col gap-2 overflow-x-auto flex-shrink-0">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-orange-500 text-white shadow-orange-200' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ChartBarIcon className="w-5 h-5" /> Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${activeTab === 'users' ? 'bg-orange-500 text-white shadow-orange-200' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <UserGroupIcon className="w-5 h-5" /> Users
                    </button>
                    <button
                        onClick={() => setActiveTab("foods")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium whitespace-nowrap ${activeTab === 'foods' ? 'bg-orange-500 text-white shadow-orange-200' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ShoppingBagIcon className="w-5 h-5" /> Foods
                    </button>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto">

                    {/* === DASHBOARD === */}
                    {activeTab === "dashboard" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
                                <h3 className="text-gray-500 text-sm font-bold uppercase">Total Users</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
                                <h3 className="text-gray-500 text-sm font-bold uppercase">Total Makanan</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalFoods}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500">
                                <h3 className="text-gray-500 text-sm font-bold uppercase">Total Pesanan</h3>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
                            </div>
                        </div>
                    )}

                    {/* === USERS MANAGEMENT === */}
                    {activeTab === "users" && (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="font-bold text-lg text-gray-700">Daftar Pengguna</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                        <th className="p-4 whitespace-nowrap">Nama</th>
                                        <th className="p-4 whitespace-nowrap">Email</th>
                                        <th className="p-4 whitespace-nowrap">Role</th>
                                        <th className="p-4 text-center whitespace-nowrap">Aksi</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-medium text-gray-800 whitespace-nowrap">{user.nama || "Tanpa Nama"}</td>
                                            <td className="p-4 text-gray-600 whitespace-nowrap">{user.email}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                                        ${user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                                        user.role === 'pemilik' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-green-100 text-green-600'}`}>
                                                        {user.role}
                                                    </span>
                                            </td>
                                            <td className="p-4 flex justify-center gap-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleChangeRole(user.id, user.role)}
                                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                                                    title="Ubah Role">
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                                                    title="Hapus User">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* === FOODS MANAGEMENT === */}
                    {activeTab === "foods" && (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="font-bold text-lg text-gray-700">Daftar Makanan</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
                                        <th className="p-4 whitespace-nowrap">Nama</th>
                                        <th className="p-4 whitespace-nowrap">Kategori</th>
                                        <th className="p-4 whitespace-nowrap">Harga</th>
                                        <th className="p-4 whitespace-nowrap">Stok</th>
                                        <th className="p-4 text-center whitespace-nowrap">Aksi</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                    {foods.map(food => (
                                        <tr key={food.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-medium text-gray-800 whitespace-nowrap">{food.name}</td>
                                            <td className="p-4 text-gray-600 whitespace-nowrap">{food.category}</td>
                                            <td className="p-4 text-gray-600 whitespace-nowrap">Rp {food.price?.toLocaleString()}</td>
                                            <td className="p-4 text-gray-600 whitespace-nowrap">{food.stock}</td>
                                            <td className="p-4 flex justify-center gap-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleEditFoodStock(food.id, food.stock)}
                                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full"
                                                    title="Edit Stok">
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFood(food.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                                                    title="Hapus Makanan">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
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
        </div>
    );
};

export default AdminPage;