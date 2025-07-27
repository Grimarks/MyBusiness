import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Tambahkan ini untuk Auth

const firebaseConfig = {
    apiKey: "AIzaSyCgCEQDcouDobhaiD_frDny7qjpqUh-9iM",
    authDomain: "mybusiness-4ad43.firebaseapp.com",
    projectId: "mybusiness-4ad43",
    storageBucket: "mybusiness-4ad43.firebasestorage.app",
    messagingSenderId: "389417803870",
    appId: "1:389417803870:web:f5b6ce03fa269a3f8014cf"
};

// Inisialisasi Firebase App dan ekspor
export const app = initializeApp(firebaseConfig); // <-- Tambahkan 'export' di sini
export const db = getFirestore(app);
export const auth = getAuth(app); // <-- Ekspor juga instance Auth

// Export Firestore functions for easier use
export { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc };