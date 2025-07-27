import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header.jsx";
import SearchBar from "../components/SearchBar.jsx";

const ChatPage = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const chatRef = collection(db, "dummyChats");
                const snapshot = await getDocs(chatRef);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setChats(data);
            } catch (error) {
                console.error("Gagal mengambil data chat:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-500 to-yellow-400 pb-24">
           <Header></Header>
            <SearchBar></SearchBar>

            {/* Chat List */}
            <div className="px-4 mt-4 space-y-3">
                {loading ? (
                    <p className="text-white text-center">Loading chats...</p>
                ) : chats.length === 0 ? (
                    <p className="text-white text-center">Belum ada pesan.</p>
                ) : (
                    chats.map(chat => (
                        <div
                            key={chat.id}
                            className="bg-white rounded-xl px-4 py-3 flex justify-between items-start shadow"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-400" />
                                <div>
                                    <p className="font-semibold text-sm">{chat.name}</p>
                                    <p className="text-gray-600 text-xs">{chat.message}</p>
                                </div>
                            </div>
                            <div className="text-gray-500 text-xs whitespace-nowrap pl-2">
                                {chat.time?.toDate().toLocaleString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomNav active="Chat" />
        </div>
    );
};

export default ChatPage;
