# MyBusiness - Aplikasi Pemesanan Kantin Kampus

[![React](https://img.shields.io/badge/React-^19.1.0-blue?logo=react)](https://reactjs.org/) [![Vite](https://img.shields.io/badge/Vite-^6.3.5-purple?logo=vite)](https://vitejs.dev/) [![Firebase](https://img.shields.io/badge/Firebase-^11.8.1-orange?logo=firebase)](https://firebase.google.com/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-^4.1.7-cyan?logo=tailwind-css)](https://tailwindcss.com/)

Aplikasi web prototipe yang dirancang untuk membantu UMKM, khususnya kantin di lingkungan kampus, dalam mengelola dan menjual produk mereka secara online.

**Tujuan Proyek:** Mendigitalisasi proses pemesanan makanan di kantin kampus untuk memudahkan pemilik usaha dan pelanggan.

## ✨ Fitur Utama

Aplikasi ini mendukung dua peran pengguna utama:

### 👤 Pelanggan (Mahasiswa/Staf)

* **Autentikasi:** Daftar dan Login menggunakan email & password.
* **Jelajah Menu:** Lihat daftar makanan dari berbagai kantin.
* **Pencarian & Filter:** Cari makanan berdasarkan nama/deskripsi, filter berdasarkan lokasi (Bukit/Indralaya).
* **Detail Produk:** Lihat informasi lengkap makanan (gambar, deskripsi, harga, rating) via modal pop-up.
* **Favorit:** Simpan makanan kesukaan.
* **Keranjang Belanja:** Tambah/kurangi item, lihat total belanja.
* **Pemesanan:** Checkout dengan pilihan "Ambil di tempat" atau "Di antar" (input alamat).
* **Riwayat Pesanan:** Lihat daftar pesanan sebelumnya dan statusnya (Diproses/Selesai).
* **Manajemen Akun:** Edit profil (nama, email, password, foto) dan Logout.

### 🏪 Pemilik Usaha (Admin Kantin)

* **Autentikasi:** Daftar dan Login khusus pemilik.
* **Dashboard:** Lihat ringkasan pendapatan total dan daftar pesanan masuk.
* **Manajemen Menu:** Tambah, Edit, dan Hapus menu makanan (termasuk foto, harga, stok, kategori, lokasi).
* **Status Menu:** Ubah status ketersediaan menu (Ready/Habis).
* **Manajemen Pesanan:** Lihat detail pesanan masuk dan tandai pesanan sebagai "Selesai".
* **Riwayat Pendapatan:** Lihat detail transaksi dari pesanan yang sudah selesai.
* **Profil Toko:** Edit informasi toko (nama, alamat, deskripsi, foto).
* **Manajemen Akun:** Edit profil pribadi dan Logout.

## 🚀 Teknologi yang Digunakan

* **Frontend:** ReactJS (v19), Vite (Build Tool)
* **Styling:** Tailwind CSS (v4)
* **Routing:** React Router DOM (v7)
* **Backend & Database:** Firebase (Authentication, Firestore)
* **Image Upload:** Google Apps Script (sebagai perantara ke Google Drive - *Perlu setup terpisah*)

## 🛠️ Setup & Instalasi Lokal

1.  **Clone Repository:**
    ```bash
    git clone [URL_REPOSITORY_ANDA]
    cd MyBusiness
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Firebase:**
    * Buat proyek Firebase Anda sendiri di [Firebase Console](https://console.firebase.google.com/).
    * Aktifkan **Authentication** (Email/Password) dan **Firestore Database**.
    * Dapatkan konfigurasi Firebase Anda (apiKey, authDomain, projectId, dll.).
    * Buat file `.env.local` di root proyek (sejajar dengan `package.json`).
    * Masukkan konfigurasi Firebase Anda ke `.env.local` dengan prefix `VITE_`:
        ```dotenv
        VITE_FIREBASE_API_KEY=AIzaSy............
        VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your-project-id
        VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
        VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
        VITE_FIREBASE_APP_ID=your-app-id
        ```
    * **PENTING:** Pastikan file `firebaseConfig.js` diubah untuk membaca variabel dari `import.meta.env` seperti ini:
        ```javascript
        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID
        };
        ```
    * **JANGAN PERNAH** commit file `.env` atau `.env.local` ke repository publik! Tambahkan ke `.gitignore`.

4.  **Konfigurasi Upload Gambar (Google Apps Script):**
    * Kode saat ini menggunakan URL Google Apps Script yang *hardcoded* di `src/pages/EditStorePage.jsx` dan `src/pages/AddFoodPage.jsx` untuk upload gambar.
    * Anda perlu membuat skrip Google Apps Script Anda sendiri yang berfungsi untuk menerima data gambar (base64) dan menyimpannya (misalnya ke Google Drive), lalu mengembalikan URL publik gambar tersebut.
    * Ganti nilai konstanta `WEB_APP_URL` di kedua file tersebut dengan URL deployment Apps Script Anda.

## ▶️ Menjalankan Aplikasi Lokal

```bash
npm run dev
