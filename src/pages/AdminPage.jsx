import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Loader from "../components/Loader";
import {
    TrashIcon,
    PencilSquareIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    ChartBarIcon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalFoods: 0, totalOrders: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/admin");
                return;
            }
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists() || docSnap.data().role !== "admin") {
                    alert("Akses Ditolak! Anda bukan Admin.");
                    navigate("/home");
                    return;
                }
                fetchData();
            } catch (err) {
                console.error(err);
                navigate("/admin");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const foodsSnap = await getDocs(collection(db, "foods"));
            setFoods(foodsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const ordersSnap = await getDocs(collection(db, "order"));

            setStats({
                totalUsers: usersSnap.size,
                totalFoods: foodsSnap.size,
                totalOrders: ordersSnap.size
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/admin");
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Hapus user ini?")) {
            await deleteDoc(doc(db, "users", id));
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleChangeRole = async (id, currentRole) => {
        const newRole = prompt("Role baru (admin/pemilik/pelanggan):", currentRole);
        if (newRole && ["admin", "pemilik", "pelanggan"].includes(newRole)) {
            await updateDoc(doc(db, "users", id), { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        }
    };

    const handleDeleteFood = async (id) => {
        if (window.confirm("Hapus makanan ini?")) {
            await deleteDoc(doc(db, "foods", id));
            setFoods(foods.filter(f => f.id !== id));
        }
    };

    const handleEditFoodStock = async (id, currentStock) => {
        const newStock = prompt("Update stok:", currentStock);
        if (newStock !== null && !isNaN(newStock)) {
            await updateDoc(doc(db, "foods", id), { stock: parseInt(newStock) });
            setFoods(foods.map(f => f.id === id ? { ...f, stock: parseInt(newStock) } : f));
        }
    };

    if (loading) return <Loader message="Memuat Dashboard Admin..." />;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-6 py-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
                <div>
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-white/80 text-sm">Kelola MyBusiness</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition text-sm font-semibold backdrop-blur-sm"
                >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
                </button>
            </header>

            <div className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full mt-6 px-4 pb-10 gap-6">
                <aside className="w-full md:w-64 flex flex-col gap-2">
                    {[
                        { id: "dashboard", label: "Dashboard", icon: ChartBarIcon },
                        { id: "users", label: "Pengguna", icon: UserGroupIcon },
                        { id: "foods", label: "Makanan", icon: ShoppingBagIcon },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-semibold ${
                                activeTab === item.id
                                    ? "bg-white text-orange-500 shadow-md border-l-4 border-orange-500"
                                    : "text-gray-500 hover:bg-white hover:text-orange-400"
                            }`}
                        >
                            <item.icon className="w-6 h-6" /> {item.label}
                        </button>
                    ))}
                </aside>
                <main className="flex-1">
                    {activeTab === "dashboard" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
                            <StatsCard
                                title="Total Pengguna"
                                count={stats.totalUsers}
                                icon={<UserGroupIcon className="w-8 h-8 text-white" />}
                                color="bg-gradient-to-br from-blue-400 to-blue-600"
                            />
                            <StatsCard
                                title="Total Makanan"
                                count={stats.totalFoods}
                                icon={<ShoppingBagIcon className="w-8 h-8 text-white" />}
                                color="bg-gradient-to-br from-green-400 to-green-600"
                            />
                            <StatsCard
                                title="Total Pesanan"
                                count={stats.totalOrders}
                                icon={<ChartBarIcon className="w-8 h-8 text-white" />}
                                color="bg-gradient-to-br from-orange-400 to-orange-600"
                            />
                        </div>
                    )}
                    {activeTab === "users" && (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in">
                            <div className="p-5 border-b bg-gray-50">
                                <h2 className="font-bold text-lg text-gray-700">Daftar Pengguna</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-orange-50 text-orange-600 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Nama</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4 text-center">Role</th>
                                        <th className="p-4 text-center">Aksi</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-semibold text-gray-800">{user.nama || "Tanpa Nama"}</td>
                                            <td className="p-4 text-gray-500">{user.email}</td>
                                            <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                                            user.role === 'pemilik' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-green-100 text-green-600'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                            </td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <ActionButton onClick={() => handleChangeRole(user.id, user.role)} icon={PencilSquareIcon} color="text-blue-500 bg-blue-50" />
                                                <ActionButton onClick={() => handleDeleteUser(user.id)} icon={TrashIcon} color="text-red-500 bg-red-50" />
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === "foods" && (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-fade-in">
                            <div className="p-5 border-b bg-gray-50">
                                <h2 className="font-bold text-lg text-gray-700">Daftar Makanan</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-orange-50 text-orange-600 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Nama Menu</th>
                                        <th className="p-4">Kategori</th>
                                        <th className="p-4">Harga</th>
                                        <th className="p-4 text-center">Stok</th>
                                        <th className="p-4 text-center">Aksi</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm">
                                    {foods.map(food => (
                                        <tr key={food.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4 font-semibold text-gray-800">{food.name}</td>
                                            <td className="p-4 text-gray-500">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{food.category}</span>
                                            </td>
                                            <td className="p-4 text-orange-600 font-bold">Rp {food.price?.toLocaleString()}</td>
                                            <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded font-bold text-xs ${food.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {food.stock}
                                                    </span>
                                            </td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <ActionButton onClick={() => handleEditFoodStock(food.id, food.stock)} icon={PencilSquareIcon} color="text-blue-500 bg-blue-50" />
                                                <ActionButton onClick={() => handleDeleteFood(food.id)} icon={TrashIcon} color="text-red-500 bg-red-50" />
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

const StatsCard = ({ title, count, icon, color }) => (
    <div className={`p-6 rounded-2xl shadow-lg text-white flex items-center justify-between ${color} transform hover:scale-105 transition-transform`}>
        <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-bold mt-1">{count}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            {icon}
        </div>
    </div>
);

const ActionButton = ({ onClick, icon: Icon, color }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition hover:brightness-90 ${color}`}
    >
        <Icon className="w-5 h-5" />
    </button>
);

export default AdminPage;