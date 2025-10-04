import React, { useEffect, useState } from 'react';
import {
    ArrowLeftIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    QuestionMarkCircleIcon,
    ExclamationCircleIcon,
    LockClosedIcon,
    StarIcon,
    ShareIcon
} from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import Header from "../components/Header.jsx";

const AccountPage = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({ nama: '', email: '', profileImage: '' });

    const getDriveThumbnail = (url, size = "w200-h200") => {
        if (!url) return "/default-food.png";
        const ucMatch = url.match(/id=([^&]+)/);
        if (ucMatch) return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=${size}`;
        const dMatch = url.match(/\/d\/([^/]+)\//);
        if (dMatch) return `https://drive.google.com/thumbnail?id=${dMatch[1]}&sz=${size}`;
        return url;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        nama: data.nama || '',
                        email: data.email || user.email || '',
                        profileImage: data.profileImage || ''
                    });
                } else {
                    setUserData({ nama: '', email: user.email, profileImage: '' });
                }
            } else {
                navigate('/loginpage');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/loginpage');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const imgSrc = getDriveThumbnail(userData.profileImage, "w200-h200");

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-orange-500 to-yellow-400 pb-24">
            <Header />
            <div className="text-white pb-6 pt-10 px-6">
                <div className="flex flex-col items-center mt-4">
                    <div className="bg-white rounded-full p-2 mb-2">
                        <img
                            src={imgSrc}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-xl font-bold">{userData.nama || 'Nama Pengguna'}</h1>
                </div>
            </div>

            {/* Content box */}
            <div className="bg-white rounded-t-3xl p-4 pb-28 min-h-[calc(100vh-200px)]">
                <h2 className="text-lg font-bold text-black mb-4">Pengaturan umum</h2>
                <div className="rounded-xl shadow-sm divide-y divide-gray-200 border border-gray-100">
                    {[
                        { label: 'Edit Profil', icon: ArrowLeftIcon, path: '/edit-profile' },
                        { label: 'Pointku', icon: CurrencyDollarIcon },
                        { label: 'Bahasa', icon: GlobeAltIcon },
                        { label: 'Tentang', icon: QuestionMarkCircleIcon },
                        { label: 'Syarat dan Ketentuan', icon: ExclamationCircleIcon },
                        { label: 'Layanan Privasi', icon: LockClosedIcon },
                        { label: 'Nilai Aplikasi', icon: StarIcon },
                        { label: 'Bagikan Aplikasi', icon: ShareIcon },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => item.path && navigate(item.path)}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <item.icon className="h-6 w-6 text-orange-500" />
                                <span className="text-gray-800 font-medium">{item.label}</span>
                            </div>
                            <span className="text-orange-500 text-xl">›</span>
                        </div>
                    ))}
                </div>

                {/* Logout Button */}
                <div className="text-center mt-8">
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Log out
                    </button>
                </div>
            </div>

            <BottomNav active="Akun" />
        </div>
    );
};

export default AccountPage;
