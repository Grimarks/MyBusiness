import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

const formatDate = (date) => {
    const now = new Date(), d = new Date(date), diff = now - d;
    const same = (a, b) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
    const yday = new Date(now); yday.setDate(now.getDate() - 1);
    if (same(d, now))  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (same(d, yday)) return "Kemarin";
    if (diff < 7*864e5) return d.toLocaleDateString("id-ID", { weekday: "long" });
    return d.toLocaleDateString("id-ID");
};

export default function ChatPage() {
    const [chats, setChats]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            const usersSnap = await getDocs(query(collection(db, "users"), where("uid","==",user.uid)));
            if (usersSnap.empty) return;
            const { role } = usersSnap.docs[0].data();
            try {
                const snap = await getDocs(collection(db, "dummyChats"));
                let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                data = role === "pemilik"
                    ? data.filter((c) => c.name.startsWith("Cust"))
                    : data.filter((c) => !c.name.startsWith("Cust"));
                data.sort((a, b) => new Date(b.time) - new Date(a.time));
                setChats(data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        });
        return () => unsub();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ background: "linear-gradient(160deg,#F97316,#EAB308)", borderRadius: "0 0 24px 24px" }}>
                <Header />
                <div className="px-5 pb-2">
                    <h1 className="text-white font-bold text-xl">Pesan</h1>
                </div>
                <SearchBar placeholder="Cari percakapan..." className="pb-4" searchTerm="" setSearchTerm={() => {}} />
            </div>

            <div className="px-4 pt-5 pb-nav max-w-lg mx-auto">
                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl">
                                <div className="skeleton w-12 h-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-3 w-24 rounded" />
                                    <div className="skeleton h-3 w-40 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : chats.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <span className="text-5xl mb-3">💬</span>
                        <p className="text-gray-400 text-sm">Belum ada percakapan</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {chats.map((chat) => (
                            <div key={chat.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors" style={{ border: "1px solid #F3F4F6" }}>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold text-orange-600">{chat.name?.[0]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{chat.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                    {formatDate(chat.time?.toDate ? chat.time.toDate() : chat.time)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav active="Chat" />
        </div>
    );
}
