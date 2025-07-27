import React from 'react';
import {
    ArrowLeftIcon,
    BellIcon,
    ShoppingCartIcon
} from "@heroicons/react/24/outline";
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="bg-gradient-to-br from-orange-500 to-yellow-400 p-4 sticky top-0 z-40 shadow-md">
                <div className="container mx-auto flex items-center justify-between max-w-2xl">
                    <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-white text-lg font-semibold">Akun</h1>
                    <div className="flex items-center space-x-3">
                        <button className="text-white p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                            <BellIcon className="h-6 w-6" />
                        </button>
                        <button className="text-white p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                            <ShoppingCartIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 max-w-2xl">
                {/* Profile Section */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-2">Informasi Profil</h2>
                    <div className="flex items-center space-x-4">
                        <img
                            src="/profile-placeholder.jpg" // Ganti dengan gambar profil pengguna
                            alt="Profile"
                            className="w-16 h-16 rounded-full"
                        />
                        <div>
                            <p className="text-gray-800 font-semibold">Nama Pengguna</p> {/* Ganti dengan nama pengguna */}
                            <p className="text-gray-600 text-sm">email@example.com</p> {/* Ganti dengan email pengguna */}
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-2">Pengaturan Akun</h2>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span>Ubah Password</span>
                            <button className="text-orange-500">Ubah</button>
                        </li>
                        <li className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span>Notifikasi</span>
                            <button className="text-orange-500">Atur</button>
                        </li>
                        <li className="flex items-center justify-between py-2">
                            <span>Bahasa</span>
                            <button className="text-orange-500">Indonesia</button>
                        </li>
                    </ul>
                </div>

                {/* Other Actions */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-2">Lainnya</h2>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span>Pusat Bantuan</span>
                            <button className="text-orange-500">Buka</button>
                        </li>
                        <li className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span>Tentang Kami</span>
                            <button className="text-orange-500">Baca</button>
                        </li>
                        <li className="flex items-center justify-between py-2">
                            <span>Keluar</span>
                            <button className="text-red-500">Keluar</button>
                        </li>
                    </ul>
                </div>
            </main>

            <BottomNav active="Akun" />
        </div>
    );
};

export default AccountPage;