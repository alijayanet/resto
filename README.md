# Resto - Aplikasi E-Menu & Manajemen Restoran Dinamis

Aplikasi Web E-Menu, Kasir, dan Manajemen Dapur Restoran berbasis **Node.js, Express, Sequelize (SQLite/MySQL), Tailwind CSS, dan Alpine.js**. Aplikasi ini didesain agar sepenuhnya dinamis dan dapat dikustomisasi untuk berbagai macam tema restoran/kafe (tidak terbatas pada seafood saja).

Repository Link: [https://github.com/alijayanet/resto](https://github.com/alijayanet/resto)

---

## 🚀 Fitur Utama

### 1. Katalog E-Menu Digital (Pelanggan)
* **Katalog Interaktif**: Pencarian menu instan, filter kategori masakan dinamis, dan penambahan item ke keranjang belanja (*shopping cart*) menggunakan penyimpanan lokal (*local storage*).
* **Mode Pemesanan Fleksibel**:
  * Pilihan layanan Makan di Sini (*Dine-In* dengan dropdown nomor meja) maupun Kirim (*Delivery*).
  * Fitur Aktif/Nonaktifkan Pemesanan Mandiri dari Pengaturan Admin (mode katalog saja).

### 2. Mode Input Order Pelayan (*Waiter Order Mode*)
* **Bypass Kunci Pemesanan**: Pelayan tetap dapat melakukan input pesanan di meja pelanggan meskipun fitur pemesanan mandiri untuk pelanggan umum sedang dinonaktifkan.
* **Banner Indikator Staf**: Menampilkan banner indikator *sticky* di bagian atas halaman katalog ketika akun pelayan/staf terdeteksi aktif.
* **Opsi Pembayaran Langsung**: Menu checkout untuk pelayan memiliki pilihan status awal pembayaran: **Antrean (Belum Bayar)** atau **Langsung Lunas (Paid)**.
* **Aksi Pasca-Order**: Tombol cetak struk thermal dan kembali ke dashboard staff secara instan setelah pesanan dikirim.

### 3. Dashboard Pelayan & Antrean Dapur (`/waiter/orders`)
* **Real-Time Polling**: Antrean diperbarui secara berkala otomatis tanpa reload halaman.
* **Manajemen Alur Kerja**: Mengubah status pesanan dari *Pending* -> *Processing* (dimasak di dapur) -> *Completed* (selesai masak & siap disajikan).
* **Kalkulator Kembalian Tunai**: Menghitung jumlah uang kembalian atau kekurangan bayar secara *real-time* di layar ketika pelanggan membayar tunai (*cash*).
* **Tombol Pembayaran QRIS Dinamis**: Membuka modal overlay QRIS dinamis terkunci nominal untuk ditunjukkan ke pelanggan di meja.

### 4. Dashboard Admin & Kasir (`/admin/dashboard`)
* **Reset Pendapatan Harian Otomatis**: Nilai total omzet/pendapatan lunas otomatis dimulai dari **Rp 0** setiap pagi hari (pukul `00:00:00`).
* **Laporan Periode Tanggal**: Menyediakan filter periode penjualan terpadu: **Hari Ini**, **Bulan Ini**, **Semua Waktu**, atau **Pilih Tanggal (Kustom/Date-to-Date)**.
* **Statistik Visual**: Ringkasan total pendapatan, total transaksi, serta status antrean (Pending, Processing, Completed) yang ter-update otomatis mengikuti filter tanggal yang dipilih.
* **Manajemen Data (CRUD)**: Kelola data pengguna/staf restoran dan kelola data menu makanan/minuman (termasuk upload gambar menu lokal).

### 5. Integrasi QRIS Dinamis Nominal Terkunci
* **Ekstraksi QRIS Statis AJAX**: Unggah gambar QR Code QRIS statis di pengaturan admin, lalu klik tombol **"Ekstrak QRIS"** untuk mendecode gambar tersebut menjadi teks payload secara otomatis menggunakan *dual-decoder pipeline* (**ZXing** + fallback **jsQR**).
* **Enkripsi EMV-Co & CRC16**: Mengubah data QRIS statis menjadi dinamis secara otomatis dengan mengunci nominal tagihan pesanan beserta kalkulasi checksum **CRC16-CCITT False** di akhir string payload.
* **Modal Overlay Responsif**: Modal QRIS ramah perangkat seluler (*mobile-responsive*) dengan pembatasan tinggi layar (`max-h-[90vh]`) dan gulir internal (*scrollable*) agar tombol close tidak terpotong di layar HP kecil.

### 6. Cetak Struk & Integrasi WhatsApp
* **Struk Thermal Printer**: Halaman khusus cetak struk (`/orders/:id/print`) monokrom monospaced yang dirancang pas untuk printer bluetooth thermal portabel ukuran **58mm atau 80mm** (otomatis memicu dialog cetak browser).
* **Kirim WhatsApp Manual**: Tombol untuk membagikan detail struk pesanan & link bukti pembayaran digital langsung ke nomor WhatsApp pelanggan.

### 7. Pengaturan Dinamis Restoran (`/admin/settings`)
Semua konten teks utama pada website dapat diubah melalui panel admin sehingga aplikasi dinamis untuk resto manapun:
* Nama Restoran, No WhatsApp, Alamat Resto, & Unggah Logo Restoran.
* Jam Buka Operasional (Weekday & Weekend).
* Kustomisasi Judul Menu Utama, Sub-Judul Menu, & Placeholder pencarian.
* **Daftar Kategori Resto Dinamis**: Input daftar kategori dipisah koma dengan format **`Label:value`** (contoh: `Makanan:makanan, Kopi:kopi, Dessert:dessert`) agar nama kategori bebas diganti tanpa merusak relasi menu database.

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database & ORM**: Sequelize ORM dengan SQLite (default, *file-based database* tanpa ribet install DB server)
* **Frontend**: HTML5, Tailwind CSS, Alpine.js (reactive state management)
* **Image Processing & QR Decode**: Jimp, @zxing/library, jsqr
* **File Upload**: Multer

---

## ⚙️ Cara Instalasi & Menjalankan Aplikasi

### Prerequisites
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di perangkat Anda (Direkemendasikan v18 atau v20 LTS).

### Langkah-Langkah:

1. **Clone Repository**
   ```bash
   git clone https://github.com/alijayanet/resto.git
   cd resto
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Seeding Database (Opsional / Reset Database)**
   Untuk membuat tabel database awal dan mengisinya dengan menu seafood bawaan, akun admin default, dan setelan awal:
   ```bash
   node seed.js
   ```
   > **Catatan**: Script `seed.js` akan menghapus database lama jika sudah ada (`force: true`). Jika aplikasi baru dijalankan pertama kali, proses sinkronisasi database dan pembuatan sampel data akan dilakukan otomatis oleh server.

4. **Jalankan Server**
   ```bash
   # Menjalankan di port default (3000) atau via environment PORT
   npm start
   ```

5. **Akses Aplikasi di Browser**
   * Halaman Depan (Katalog / E-Menu): [http://localhost:3000](http://localhost:3000)
   * Halaman Login Staf: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 Akun Login Default (Hasil Seed)

Setelah menjalankan `node seed.js`, Anda dapat login menggunakan kredensial bawaan berikut:

| Peran (Role) | Username | Password | Tautan Halaman Utama |
|---|---|---|---|
| **Administrator / Kasir** | `admin` | `admin123` | `/admin/dashboard` |
| **Pelayan / Waiter** | `pelayan` | `pelayan123` | `/waiter/orders` |

---

## 📂 Struktur Folder Proyek

```text
resto/
├── config/             # Konfigurasi database Sequelize
├── controllers/        # Logika pengontrol route (Order, Menu, Setting, Auth, Home)
├── models/             # Definisi skema tabel database (Order, OrderItem, Menu, Setting, User)
├── public/             # File statis (CSS, Javascript, Uploads gambar menu & logo)
├── routes/             # Berkas routing web (web.js)
├── utils/              # Modul utilitas penunjang (QRIS decoder, CRC16 generator)
├── views/              # Templating EJS (Admin, Waiter, Staff, Partials)
├── app.js              # Entry point utama aplikasi Express
├── seed.js             # Script generator database awal
└── package.json        # Manifest file dependensi Node.js
```

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan komersial mandiri restoran Anda. Silakan dikembangkan dan disesuaikan lebih lanjut!
Tautan repositori utama: [https://github.com/alijayanet/resto](https://github.com/alijayanet/resto).
