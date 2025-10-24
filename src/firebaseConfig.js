import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🧩 Ambil credential dari .env
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🚀 Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// 📦 Ekspor instance Firebase
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 🧰 Ekspor fungsi Firestore biar tetap bisa dipakai langsung
export {
    app,
    db,
    auth,
    storage,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
};
