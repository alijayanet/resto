# 🍽️ Resto - Platform E-Menu & Manajemen Restoran Terintegrasi

<p align="center">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express" />
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white" alt="Sequelize" />
  <img src="https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/alpine.js-%238BC0D0.svg?style=for-the-badge&logo=alpine.js&logoColor=white" alt="Alpine.js" />
</p>

Aplikasi E-Menu & Management Restoran Modern yang didesain 100% dinamis untuk menggantikan sistem katalog tradisional. Dilengkapi dengan **Katalog Digital Interaktif, Dashboard Kasir (Admin), Panel Pemantau Antrean Dapur (Pelayan), Kalkulator Kembalian Tunai, Cetak Struk Bluetooth Thermal, serta QRIS Dinamis Nominal Terkunci** menggunakan enkripsi EMV-Co.

> 🔗 **Tautan Repositori Utama**: [https://github.com/alijayanet/resto](https://github.com/alijayanet/resto)

---

## ✨ Fitur Unggulan

### 🛍️ 1. Katalog Digital E-Menu (Pelanggan)
* **Katalog Responsif & Cantik**: Desain premium glassmorphism dengan transisi halus, kolom pencarian instan, dan filter kategori menu dinamis.
* **Keranjang Belanja Pintar**: Mengelola item belanja secara real-time via Alpine.js dengan penyimpanan lokal (*LocalStorage*).
* **Fleksibilitas Layanan**: Mendukung pemesanan makan di tempat (*Dine-In* dengan dropdown nomor meja kustom) dan pengantaran rumah (*Delivery*).
* **Kontrol Katalog**: Opsi mengaktifkan/menonaktifkan pemesanan online langsung melalui panel admin (katalog-saja vs e-order aktif).

### 🤵 2. Mode Input Pelayan (*Waiter Ordering*)
* **Bypass Layanan**: Pelayan tetap dapat melakukan input pesanan di meja pelanggan meskipun fitur order mandiri pelanggan umum sedang dikunci/dinonaktifkan.
* **Sticky Status Banner**: Indikator visual berwarna biru di bagian atas halaman katalog untuk memberi tahu bahwa sesi pemesanan staf sedang berjalan.
* **Instant Paid Override**: Opsi kustomisasi status pembayaran langsung di drawer checkout: **Antrean (Belum Bayar)** atau **Langsung Lunas (Paid)**.
* **Redirection Pasca-Order**: Tombol pintas cepat untuk mencetak struk thermal serta kembali ke dashboard pemantau dalam sekali ketuk.

### 🍳 3. Dashboard Pelayan & Antrean Dapur
* **Live Order Queue Polling**: Memantau daftar pesanan aktif di dapur secara *real-time* tanpa perlu memuat ulang halaman secara manual.
* **Workflow Dapur**: Memperbarui status kemajuan pesanan (*Pending* ➔ *Processing* ➔ *Completed*).
* **Kalkulator Kembalian Tunai**: Menghitung secara otomatis nominal kembalian atau kekurangan uang pembayaran tunai pelanggan secara instan di layar.
* **Dynamic QRIS Modal Overlay**: Menampilkan kode QRIS dinamis nominal terkunci langsung di HP/tablet pelayan untuk di-scan oleh pelanggan di meja.

### 📊 4. Dashboard Admin & Kasir
* **Reset Omzet Harian**: Statistik omzet penjualan lunas otomatis di-reset menjadi **Rp 0** setiap hari (pukul `00:00:00`) untuk rekap harian bersih.
* **Filter Periode Penjualan**: Filter grafik dan ringkasan keuangan berdasarkan opsi **Hari Ini**, **Bulan Ini**, **Semua Waktu**, atau **Kustom (Date-to-Date)** menggunakan kalender interaktif.
* **CRUD Terpadu**: Manajemen menu makanan/minuman, data akun staf, dan file gambar menu lokal secara efisien.

### ⚡ 5. Integrasi QRIS Dinamis & EMV-Co
* **Ekstraktor QRIS AJAX**: Unggah gambar QR Code QRIS statis Anda dan sistem akan otomatis mengekstrak payload teks menggunakan pembaca ganda (**ZXing + jsQR fallback**) untuk menjamin keberhasilan 100%.
* **Nominal Terkunci & CRC16**: Mengonversi QRIS statis menjadi dinamis secara instan dengan mengunci nominal tagihan serta kalkulasi ulang checksum **CRC16-CCITT False** untuk kepatuhan standar EMV-Co.
* **Responsive Layout**: Modal QR Code didesain anti-terpotong (*overflow-safe*) pada layar HP beresolusi kecil.

### 🖨️ 6. Cetak Struk Thermal & Share WhatsApp
* **58mm/80mm Layout**: Halaman khusus cetak struk (`/orders/:id/print`) monokrom monospaced yang dioptimalkan untuk printer thermal bluetooth portabel dengan perintah auto-print bawaan.
* **WhatsApp Share**: Membagikan bukti pembayaran digital instan beserta rincian belanja ke nomor WhatsApp pelanggan.

---

## 🛠️ Tech Stack & Arsitektur

* **Backend**: Node.js, Express.js
* **Database & ORM**: Sequelize ORM dengan SQLite (berbasis file lokal, tidak perlu instalasi server database eksternal)
* **Frontend**: HTML5, Tailwind CSS (styling modern), Alpine.js (reactive state management)
* **Image Processing & QR Decode**: Jimp, @zxing/library, jsqr
* **File Upload**: Multer

---

## 🚀 Panduan Instalasi & Penggunaan

### Prerequisites
Pastikan perangkat Anda telah menginstal **Node.js** (Minimal v16, direkomendasikan v18 atau v20 LTS).

### Langkah Cepat Menjalankan Aplikasi:

1. **Unduh Repositori**
   ```bash
   git clone https://github.com/alijayanet/resto.git
   cd resto
   ```

2. **Instal Seluruh Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment (.env)**
   Salin file `env.example.txt` menjadi `.env` dan sesuaikan konfigurasinya (seperti nomor PORT dan kunci SESSION_SECRET):
   * **Windows (PowerShell / Command Prompt)**:
     ```cmd
     copy env.example.txt .env
     ```
   * **Linux / macOS (Terminal)**:
     ```bash
     cp env.example.txt .env
     ```

4. **Inisialisasi Database (Seeding)**
   Gunakan perintah ini untuk membuat tabel database SQLite awal, mengisi sampel menu masakan, pengaturan awal, serta akun kasir/waiter default:
   ```bash
   npm run seed
   ```
   > [!WARNING]
   > Menjalankan perintah `seed` akan mereset dan menghapus seluruh database lama jika sudah ada. Lakukan pencadangan file database jika diperlukan.

4. **Nyalakan Aplikasi**
   ```bash
   npm start
   ```

5. **Buka Aplikasi di Browser**
   * **Katalog Pelanggan / E-Menu**: `http://localhost:3000`
   * **Login Panel Staf**: `http://localhost:3000/login`

---

## 🔑 Akun Uji Coba Default

Setelah database disemai (*seeding*), Anda dapat masuk dengan kredensial berikut:

| Peran (Role) | Username | Password | Dashboard Tujuan |
| :--- | :--- | :--- | :--- |
| **Administrator / Kasir** | `admin` | `admin123` | `http://localhost:3000/admin/dashboard` |
| **Pelayan / Waiter** | `pelayan` | `pelayan123` | `http://localhost:3000/waiter/orders` |

---

## 📂 Struktur File Utama

```text
resto/
├── controllers/        # Logika handler route (Order, Menu, Setting, Auth, Home)
├── models/             # Schema database Sequelize (Order, Menu, Setting, User)
├── public/             # File statis (CSS kustom, JS, unggahan gambar lokal)
│   └── uploads/        # Penyimpanan lokal untuk gambar menu & logo
├── routes/             # Pemetaan routing rute web
├── utils/              # Modul utilitas pembantu (QRIS parser, CRC16)
├── views/              # Templating EJS (Admin, Waiter, Staff, Partials)
├── app.js              # Entry point utama aplikasi Express
└── seed.js             # Generator database awal & sampel data
```

---

## 📝 Lisensi & Modifikasi

Aplikasi ini bersifat *open-source* dan didesain agar sangat mudah disesuaikan untuk kafe, angkringan, katering, maupun restoran Anda.
Untuk kontribusi pengembangan, silakan merujuk pada repositori: [alijayanet/resto](https://github.com/alijayanet/resto).
