import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    BellIcon,
    ShoppingCartIcon
} from "@heroicons/react/24/outline";
import BottomNav from "../components/BottomNav.jsx";

const ChatPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="bg-gradient-to-br from-orange-500 to-yellow-400 p-4 sticky top-0 z-40 shadow-md">
                <div className="container mx-auto flex items-center justify-between max-w-2xl">
                    <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors">
                        <ArrowLeftIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-white text-lg font-semibold">Chat</h1>
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
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <h2 className="text-lg font-semibold mb-2">Daftar Chat</h2>
                    {/* Daftar Chat */}
                    <div className="flex items-center space-x-4 py-3 border-b border-gray-200">
                        <img
                            src="/profile-placeholder.jpg" // Ganti dengan gambar profil lawan bicara
                            alt="Profile"
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <p className="text-gray-800 font-semibold">Nama Lawan Bicara</p> {/* Ganti dengan nama lawan bicara */}
                            <p className="text-gray-600 text-sm">Pesan terakhir...</p> {/* Ganti dengan pesan terakhir */}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 py-3 border-b border-gray-200">
                        <img
                            src="/profile-placeholder.jpg" // Ganti dengan gambar profil lawan bicara
                            alt="Profile"
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <p className="text-gray-800 font-semibold">Nama Lawan Bicara</p> {/* Ganti dengan nama lawan bicara */}
                            <p className="text-gray-600 text-sm">Pesan terakhir...</p> {/* Ganti dengan pesan terakhir */}
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav active="Chat" />
        </div>
    );
};

export default ChatPage;