import { collection, addDoc } from "firebase/firestore";
import { db } from "./src/firebaseConfig.js";

const chats = [
    {
        name: "Bakso Layanan",
        message: "Pesanan kamu sudah siap ya!",
        time: new Date("2025-09-30T08:45:00+07:00"),
    },
    {
        name: "Ayam Geprek Lunjuk",
        message: "Makanannya sedang diantar ke alamatmu.",
        time: new Date("2025-09-29T16:20:00+07:00"), // kemarin
    },
    {
        name: "Cimol Bukit",
        message: "Stok cimol keju masih ada, mau pesan lagi?",
        time: new Date("2025-09-28T14:00:00+07:00"), // Senin
    },
    {
        name: "Batagor Fisip",
        message: "Terima kasih sudah order ya!",
        time: new Date("2025-09-26T19:30:00+07:00"), // Jumat
    },
    {
        name: "Basreng Bukit",
        message: "Diskon spesial untuk pelanggan setia 💥",
        time: new Date("2025-09-25T09:15:00+07:00"),
    },
    {
        name: "Nasi Padang Indralaya",
        message: "Pesananmu akan segera diproses.",
        time: new Date("2025-09-24T12:10:00+07:00"),
    },
];

async function uploadChats() {
    try {
        for (const chat of chats) {
            await addDoc(collection(db, "dummyChats"), chat);
            console.log(`✅ Chat ${chat.name} ditambahkan!`);
        }
    } catch (e) {
        console.error("❌ Gagal upload chat:", e);
    }
}

uploadChats();
