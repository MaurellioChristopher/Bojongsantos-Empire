# 🌾 DOKUMEN KONTEKS LENGKAP & LAPORAN SISTEM: AKSESPANGAN
**Platform Sirkular Penyelamatan Surplus Pangan, Pengurangan Emisi Karbon ($CO_2e$), & Ekosistem ESG**  
*Tim Pengembang: Bojongsantos Empire | Versi: 1.0 (Production & Competition Ready)*

---

## 📑 DAFTAR ISI
1. [Latar Belakang & Masalah Riil (Problem Statement)](#1-latar-belakang--masalah-riil-problem-statement)
2. [Visi, Misi, & Solusi AksesPangan (Value Proposition)](#2-visi-misi--solusi-aksespangan-value-proposition)
3. [Arsitektur Ekosistem 4 Pemangku Kepentingan (Stakeholders)](#3-arsitektur-ekosistem-4-pemangku-kepentingan-stakeholders)
4. [Alur Transaksi & Interaksi Menyeluruh (End-to-End User Journey)](#4-alur-transaksi--interaksi-menyeluruh-end-to-end-user-journey)
5. [Bedah Fitur Unggulan Sistem (Feature Breakdown)](#5-bedah-fitur-unggulan-sistem-feature-breakdown)
6. [Arsitektur Rekayasa Perangkat Lunak (Technical Architecture)](#6-arsitektur-rekayasa-perangkat-lunak-technical-architecture)
7. [Kepatuhan Standar Keamanan BPOM & HACCP](#7-kepatuhan-standar-keamanan-bpom--haccp)
8. [Dampak Keberlanjutan & Keselarasan SDGs PBB](#8-dampak-keberlanjutan--keselarasan-sdgs-pbb)
9. [Panduan & Skenario Demo Presentasi (Live Pitch Script)](#9-panduan--skenario-demo-presentasi-live-pitch-script)
10. [Status Verifikasi & Deployment Produksi](#10-status-verifikasi--deployment-produksi)

---

## 1. 🌍 Latar Belakang & Masalah Riil (Problem Statement)

Indonesia saat ini menghadapi **"Paradoks Pangan Nasional"** yang sangat kontradiktif:

1. **Pemborosan Pangan Masif (*Food Waste*)**:
   - Berdasarkan data Bappenas dan UNEP, Indonesia membuang **23–48 juta ton makanan per tahun** (setara dengan 115–184 kg per kapita setiap tahunnya).
   - Kerugian ekonomi yang timbul ditaksir mencapai **Rp 213 hingga Rp 551 triliun per tahun** (sekitar 4–5% dari PDB Indonesia).
2. **Kerawanan Pangan & Malnutrisi (*Food Insecurity*)**:
   - Di sisi lain, jutaan keluarga prasejahtera, anak panti asuhan, dan pekerja rentan masih berjuang memenuhi asupan nutrisi harian yang layak.
3. **Ancaman Gas Rumah Kaca & Krisis Iklim**:
   - Sampah makanan yang membusuk di TPA tanpa pemilahan menghasilkan gas **Metana ($CH_4$)**, yang memiliki potensi pemanasan global **25 kali lebih agresif daripada $CO_2$**. Rata-rata 1 kg makanan yang terbuang menghasilkan jejak emisi sekitar **$2.5\text{ kg } CO_2e$**.
4. **Mengapa Cara Tradisional Gagal?**:
   - **Faktor Waktu**: Makanan surplus memiliki *shelf life* yang sangat singkat (beberapa jam saja sebelum kedaluwarsa).
   - **Ketiadaan Transparansi Mutu**: Penerima khawatir makanan sudah basi/berbahaya.
   - **Ketiadaan Insentif Bisnis**: Restoran dan supermarket lebih memilih membuang makanan karena menyumbangkan makanan secara manual memakan biaya logistik dan tidak memiliki pencatatan reputasi/pajak.

---

## 2. 💡 Visi, Misi, & Solusi AksesPangan (Value Proposition)

**AksesPangan** hadir sebagai **jembatan digital terotomasi** yang menghubungkan entitas bisnis kuliner berlebih dengan penerima manfaat secara tepat waktu, higienis, dan terukur secara ekonomi maupun lingkungan.

### 🌟 4 Pilar Solusi AksesPangan:
- **Zero Food Waste Engine**: Mencegah makanan layak konsumsi berakhir di TPA melalui *real-time geolocation marketplace*.
- **Quality & Safety Assurance**: Menjamin standar higienitas berdasarkan parameter resmi BPOM & HACCP.
- **Measurable ESG Incentives**: Mengubah donasi surplus menjadi metrik keberlanjutan yang dapat diaudit, dilengkapi **Sertifikat Hijau Resmi (SDGs 2 & 12)** untuk meningkatkan reputasi perusahaan donor.
- **Gamified Community Engagement**: Mendorong partisipasi publik melalui sistem lencana **Pahlawan Pangan** dan peran aktif kurir relawan.

---

## 3. 👥 Arsitektur Ekosistem 4 Pemangku Kepentingan (Stakeholders)

Platform mengintegrasikan 4 peran (*roles*) dalam satu sistem yang harmonis:

| Peran | Deskripsi Pengguna | Manfaat yang Didapatkan |
| :--- | :--- | :--- |
| **Penerima Manfaat** *(Recipient)* | Masyarakat, panti asuhan, mahasiswa, keluarga prasejahtera, dan komunitas sekitar. | Akses pangan berkualitas tinggi secara gratis atau subsidi terjangkau, panduan resep masak, dan tiket digital bergaransi. |
| **Mitra Penyedia** *(Provider/Donor)* | Restoran, katering hajatan, hotel, toko roti (*bakery*), supermarket, dan toko buah/sayur. | Mencegah biaya pembuangan limbah (*waste fee*), mendapatkan laporan telemetri emisi $CO_2e$, serta sertifikat hijau ESG resmi. |
| **Kurir Relawan** *(Courier/Volunteer)* | Pengemudi ojek online, mahasiswa relawan, dan armada komunitas. | Navigasi pengantaran rute jalan riil (*HUD real-road navigation*), insentif kepedulian sosial, dan reputasi rating. |
| **Administrator Platform** | Pengelola sistem, tim verifikasi mutu, dan pemantau ekosistem. | Dashboard pemantauan server mikro, audit transaksi, mediasi komplain makanan, dan telemetri dampak sosial kota. |

---

## 4. 🔄 Alur Transaksi & Interaksi Menyeluruh (End-to-End User Journey)

Berikut adalah perjalanan data dari tahap prapenyelamatan hingga makanan berhasil dikonsumsi:

```
[MITRA PENYEDIA] ───────────────► Mengunggah Data Surplus Pangan
                                 (Kategori: Siap Santap vs Bahan Baku)
                                         │
                                         ▼
                            [SISTEM ALGORITMA AKSESPANGAN]
                            ├── Memvalidasi Batas Waktu Kadaluarsa
                            ├── Memberikan Tag: "Flash Urgent Rescue" jika < 4 Jam
                            └── Menampilkan Lokasi di Interactive Geolocation Map
                                         │
                                         ▼
[PENERIMA MANFAAT] ─────────────► Menemukan Makanan Terdekat
                                 ├── Membaca "Ide Resep Cerdas" (Jika Bahan Baku)
                                 ├── Meninjau Standar Mutu BPOM & Suhu Simpan
                                 └── Melakukan Checkout (Gratis / Subsidi QRIS)
                                         │
                                         ▼
[TIKET DIGITAL BOARDING PASS] ──► Diterbitkan Otomatis:
                                 ├── QR Matrix Code Unik
                                 └── 4-Digit PIN Verifikasi Pengambilan
                                         │
                                         ▼
[OPSI PENGAMBILAN] ─────────────┬───────────────────────────┐
                                │                           │
                       (Ambil Mandiri / Self-Pickup)   (Kirim via Kurir Relawan)
                                │                           │
                                │                           ▼
                                │             [KURIR RELAWAN]
                                │             ├── Buka Turn-by-Turn Navigation HUD
                                │             ├── Melacak Jalur Jalan Riil (OSRM)
                                │             └── Geofence Alert (Tiba di Lokasi)
                                │                           │
                                └─────────────┬─────────────┘
                                              ▼
[VERIFIKASI SERAH TERIMA] ──────► Mitra Memeriksa PIN / QR Code
                                 └── Status Berubah: 'Diambil' (Selesai)
                                              │
                                              ▼
[DAMPAK OTOMATIS TERUPDATE] ────► ├── Metrik ESG & $CO_2e$ Terakumulasi Real-Time
                                  ├── Pembaharuan Sertifikat Hijau Mitra Donor
                                  └── Buka Lencana Gamifikasi "Pahlawan Pangan"
```

---

## 5. 🔬 Bedah Fitur Unggulan Sistem (Feature Breakdown)

### 1. 🎫 Digital Boarding Pass Ticket & 4-Digit PIN Verifikasi
- **Latar Belakang Desain**: Mencegah salah ambil pesanan atau klaim ganda.
- **Implementasi**:
  - Penerima mendapatkan modal tiket bergaya *boarding pass* maskapai penerbangan.
  - Dilengkapi matriks QR SVG, hitung mundur batas waktu pengambilan (*countdown deadline*), dan **4-Digit PIN acak**.
  - Mitra Penyedia memiliki tombol **"Verifikasi Pengambilan"** yang memvalidasi PIN sebelum menyerahkan makanan. Tersedia kode bypass pengujian `1234` untuk kenyamanan presentasi langsung.

### 2. 📜 Sertifikat Hijau ESG Terverifikasi (SDGs 2 & 12)
- **Latar Belakang Desain**: Perusahaan modern membutuhkan bukti kepatuhan *Environmental, Social, and Governance* (ESG).
- **Implementasi**:
  - Piagam penghargaan digital resmi dengan nomor seri unik (`AP-ESG-2026-XXXXXX`).
  - Menampilkan angka nyata: **Total Kilogram Makanan Diselamatkan**, **Estimasi Porsi Terbagi**, dan **Pencegahan Emisi Karbon ($CO_2e$)**.
  - Mengintegrasikan cap tanda tangan verifikasi resmi platform dan tombol **"Cetak / Simpan PDF"** dengan tata letak dokumen yang dioptimalkan untuk cetak tanpa elemen navigasi.

### 3. ⚡ Flash Urgent Rescue Hub (< 4 Jam)
- **Latar Belakang Desain**: Makanan yang tersisa beberapa jam membutuhkan tindakan kilat agar tidak terbuang percuma.
- **Implementasi**:
  - Filter khusus di katalog pangan untuk item dengan sisa waktu $< 4$ jam.
  - Kartu produk otomatis menampilkan animasi berdenyut (*pulsing*) `⚡ Darurat < 4 Jam` dengan aksen terracotta yang menarik perhatian penerima.

### 4. 💡 Rekomendasi Ide Olah Resep Cerdas (Smart Culinary Ideas)
- **Latar Belakang Desain**: Penerima sering bingung cara mengolah bahan baku mentah (misal: labu siam, singkong, kubis, jamur tiram).
- **Implementasi**:
  - Basis data resep kuliner nusantara terintegrasi di [`src/lib/recipes.ts`](file:///d:/Bojongsantos%20Empire/Bojongsantos-Empire/src/lib/recipes.ts).
  - Memberikan petunjuk waktu masak, porsi, langkah-langkah, kandungan nutrisi, dan **Tips Zero-Waste** (pemanfaatan kulit/tangkai bahan agar tidak ada sampah tersisa).

### 5. 🏆 Gamifikasi Lencana Pahlawan Pangan (Food Hero Badges)
- **Latar Belakang Desain**: Menjaga retensi dan motivasi psikologis pengguna.
- **Implementasi**:
  - 5 tingkatan lencana: *Penyelamat Pemula*, *Pejuang Anti-Mubazir*, *Penjaga Iklim Bumi*, *Pahlawan Pangan Teladan*, dan *Duta Pangan Lestari*.
  - Menghitung progres secara matematis berdasarkan volume kilogram dan frekuensi transaksi selesai.

### 6. 🏍️ Live Turn-by-Turn Courier Navigation HUD
- **Implementasi**:
  - Navigasi kurir berbasis peta interaktif yang menghitung rute di atas jalan raya riil menggunakan mesin OSRM (*Open Source Routing Machine*).
  - Tampilan HUD dinamis dengan spedometer, perkiraan waktu tiba (ETA), bearing arah kendaraan, dan *geofence alert* otomatis saat kurir berada dalam radius $\le 50\text{ meter}$.

### 7. 🤖 SARA: Asisten Cerdas AI (Google Gemini 3.5)
- **Implementasi**:
  - Terintegrasi dengan model LLM Google Gemini 3.5 Flash via streaming endpoint.
  - Membantu pengguna merekomendasikan makanan surplus terdekat, menghitung jejak karbon, memberikan saran keselamatan konsumsi, dan menjawab pertanyaan seputar platform secara humanis.

### 8. 💳 Sandbox Payment Gateway Simulator
- **Implementasi**:
  - Simulator transaksi pembayaran untuk pangan bersubsidi (QRIS dinamis, Virtual Account BCA/Mandiri/BRI, dan COD).
  - Dilengkapi tombol *⚡ Simulasikan Pembayaran Berhasil* untuk kelancaran demo juri tanpa transaksi rekening riil.

---

## 6. 💻 Arsitektur Rekayasa Perangkat Lunak (Technical Architecture)

### Ringkasan Stack Teknologi:
- **Framework**: Next.js 16.3.5 (App Router, Turbopack Engine)
- **Library UI**: React 19, Lucide React Icons, Framer Motion
- **Sistem Pemetaan**: Leaflet, React-Leaflet, OSRM Routing Engine
- **Visualisasi Data**: Recharts (Grafik telemetri emisi dan transaksi)
- **Basis Data**: Supabase PostgreSQL (Cloud) + Local-First Fallback Engine
- **Kecerdasan Buatan**: Google Gemini API (Model: `gemini-2.5-flash` / `gemini-1.5-flash`)
- **Kontainerisasi**: Docker & Docker Compose (Orkestrat 6 Microservices)

### Ketahanan Sistem Hybrid (Zero Single-Point-of-Failure):
Setiap modul di [`src/services`](file:///d:/Bojongsantos%20Empire/Bojongsantos-Empire/src/services) membungkus panggilan REST API dalam blok `try/catch`. Jika terjadi gangguan jaringan, limit kuota API awan, atau ketiadaan internet, sistem secara mulus mengeksekusi fungsi fallback lokal di [`src/lib/data.ts`](file:///d:/Bojongsantos%20Empire/Bojongsantos-Empire/src/lib/data.ts). Pengguna tidak akan pernah melihat halaman *crash* atau *blank error*.

---

## 7. 🛡️ Kepatuhan Standar Keamanan BPOM & HACCP

Untuk memastikan keselamatan konsumsi pangan masyarakat, sistem menyematkan protokol keamanan mutlak:

1. **Parameter Kontrol Suhu (*Danger Zone Alert*)**:
   - Pangan berisiko tinggi wajib disimpan di luar *Danger Zone* ($5^\circ\text{C} - 60^\circ\text{C}$).
   - Standar refrigerasi dingin ($< 4^\circ\text{C}$) atau pemanasan panas ($> 60^\circ\text{C}$).
2. **Aturan 2 Jam / 4 Jam**:
   - Makanan siap santap pada suhu ruang memiliki batas konsumsi maksimal 4 jam sebelum harus dibuang atau dipanaskan kembali hingga suhu inti $\ge 74^\circ\text{C}$.
3. **Pusat Resolusi Keluhan Konsumen**:
   - Jika penerima mendapati kualitas pangan tidak sesuai deskripsi, penerima dapat mengajukan keluhan disertai foto bukti untuk dimediasi langsung oleh Administrator platform.

---

## 8. 🌿 Dampak Keberlanjutan & Keselarasan SDGs PBB

Platform AksesPangan dirancang selaras dengan target global PBB (*Sustainable Development Goals*):

- **SDG 2: Zero Hunger (Tanpa Kelaparan)**
  - *Target 2.1 & 2.2*: Menjamin akses terhadap pangan yang aman, bergizi, dan cukup bagi seluruh masyarakat sepanjang tahun.
- **SDG 12: Responsible Consumption and Production (Konsumsi & Produksi Bertanggung Jawab)**
  - *Target 12.3*: Memangkas separuh dari pemborosan pangan per kapita global di tingkat retail dan konsumen, serta mengurangi kehilangan makanan di sepanjang rantai produksi dan pasokan.
- **SDG 13: Climate Action (Penanganan Perubahan Iklim)**
  - Mengurangi pelepasan gas metana ($CH_4$) dan karbon ($CO_2e$) secara terukur melalui pencegahan pembusukan bahan organik di Tempat Pembuangan Akhir (TPA).

---

## 9. 🎙️ Panduan & Skenario Demo Presentasi (Live Pitch Script)

Untuk mendemonstrasikan platform ini di hadapan juri atau investor dalam waktu 3–5 menit:

1. **Buka Halaman Utama ([Landing Page](https://bojongsantos-empire.vercel.app))**:
   - Tunjukkan hero section, kalkulator dampak emisi real-time, dan pemisahan kategori pangan.
2. **Masuk sebagai Penerima (1-Klik Akun Demo Penerima)**:
   - Buka `/penerima`. Perlihatkan **Tab Bahan Baku Segar** dan klik **"💡 Ide Resep"** pada salah satu sayuran.
   - Perlihatkan **Tab Segera Kedaluwarsa (< 4 Jam)** dengan badge berdenyut.
   - Lakukan pemesanan makanan. Buka riwayat booking dan tampilkan **Tiket Digital Boarding Pass** dengan QR Code & 4-Digit PIN.
3. **Beralih ke Akun Mitra Penyedia (1-Klik Akun Demo Penyedia)**:
   - Buka `/penyedia`. Tunjukkan tombol **"Verifikasi Pengambilan"** pada pesanan yang masuk, masukkan PIN penerima (atau `1234`), dan tunjukkan status berubah menjadi `diambil`.
   - Klik **"Sertifikat Hijau ESG"** dan tunjukkan piagam resmi yang siap dicetak ke PDF untuk laporan keberlanjutan perusahaan.
4. **Tunjukkan Asisten AI SARA**:
   - Klik widget SARA AI di pojok kanan bawah, tanyakan: *"Bagaimana cara mengolah surplus nasi sisa agar tetap bergizi?"* dan perlihatkan respons cerdas berbasis BPOM/HACCP.

---

## 10. ✅ Status Verifikasi & Deployment Produksi

- **Status Kompilasi**: `next build` berhasil (Exit Code: 0) tanpa kesalahan TypeScript.
- **Branch Git**: `main` (Semua commit tersinkronisasi bersih ke remote GitHub).
- **Akses Live URL**: [https://bojongsantos-empire.vercel.app](https://bojongsantos-empire.vercel.app)
- **Repository Sumber**: [https://github.com/MaurellioChristopher/Bojongsantos-Empire](https://github.com/MaurellioChristopher/Bojongsantos-Empire)

---
*Dokumen ini disusun oleh tim rekayasa sistem Bojongsantos Empire sebagai referensi teknis resmi, acuan presentasi kompetisi, dan panduan audit implementasi AksesPangan.*
