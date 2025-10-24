import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";

// Format tanggal & waktu
const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);

    const sameDay =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

    if (sameDay) {
        return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } else if (isYesterday) {
        return "Kemarin";
    } else if (now - d < 7 * 24 * 60 * 60 * 1000) {
        return d.toLocaleDateString("id-ID", { weekday: "long" });
    } else {
        return d.toLocaleDateString("id-ID");
    }
};

export default function ChatPage() {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Ambil role dari collection users
                const usersSnap = await getDocs(
                    query(collection(db, "users"), where("uid", "==", user.uid))
                );
                if (!usersSnap.empty) {
                    const userData = usersSnap.docs[0].data();
                    setRole(userData.role);

                    try {
                        const chatRef = collection(db, "dummyChats");
                        const snapshot = await getDocs(chatRef);
                        let data = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        }));

                        // Filter sesuai role
                        if (userData.role === "pemilik") {
                            data = data.filter((c) => c.name.startsWith("Cust"));
                        } else {
                            data = data.filter((c) => !c.name.startsWith("Cust"));
                        }

                        data.sort((a, b) => new Date(b.time) - new Date(a.time));
                        setChats(data);
                    } catch (error) {
                        console.error("Gagal mengambil data chat:", error);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-500 to-yellow-400 pb-24">
            <Header />
            <SearchBar placeholder="Cari pesan" />

            <div className="px-3 sm:px-6 mt-4 space-y-3 sm:space-y-4 max-w-2xl mx-auto w-full">
                {loading ? (
                    <p className="text-white text-center text-sm sm:text-base">Loading chats...</p>
                ) : chats.length === 0 ? (
                    <p className="text-white text-center text-sm sm:text-base">Belum ada pesan.</p>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className="bg-white rounded-xl px-4 py-3 flex justify-between items-center shadow hover:shadow-md transition-all duration-200 w-full"
                        >
                            <div className="flex items-center space-x-3 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm sm:text-base truncate">{chat.name}</p>
                                    <p className="text-gray-600 text-xs sm:text-sm truncate max-w-[10rem] sm:max-w-[14rem]">
                                        {chat.message}
                                    </p>
                                </div>
                            </div>
                            <div className="text-gray-500 text-xs sm:text-sm ml-2 flex-shrink-0 whitespace-nowrap">
                                {formatDate(chat.time?.toDate ? chat.time.toDate() : chat.time)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomNav active="Chat" />
        </div>
    );
}
