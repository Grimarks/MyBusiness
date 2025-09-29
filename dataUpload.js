import { collection, addDoc } from "firebase/firestore";
import { db } from "./src/firebaseConfig.js";

const orders = [
    {
        customerName: "Cust 003",
        ownerId: "FV7xvxggDAQHETkn8CKugAZP0Rn1",
        amount: 45000,
        status: false,
        items: [
            { name: "Mie Ayam Bakso", qty: 1, image: "url", note: "Tanpa sawi" },
            { name: "Es Teh Manis", qty: 2, image: "url", note: "" },
        ],
    },
    {
        customerName: "Cust 004",
        ownerId: "FV7xvxggDAQHETkn8CKugAZP0Rn1",
        amount: 27500,
        status: false,
        items: [
            { name: "Ayam Geprek", qty: 1, image: "url", note: "Level 3" },
            { name: "Nasi Putih", qty: 1, image: "url", note: "" },
        ],
    },
    {
        customerName: "Cust 005",
        ownerId: "FV7xvxggDAQHETkn8CKugAZP0Rn1",
        amount: 52000,
        status: false,
        items: [
            { name: "Sate Ayam", qty: 10, image: "url", note: "Pakai bumbu kacang" },
            { name: "Es Jeruk", qty: 1, image: "url", note: "Dingin banget" },
        ],
    },
];

async function uploadOrders() {
    try {
        for (const order of orders) {
            await addDoc(collection(db, "order"), order);
            console.log(`✅ Order ${order.customerName} berhasil ditambahkan!`);
        }
    } catch (e) {
        console.error("❌ Gagal upload order:", e);
    }
}

uploadOrders();
