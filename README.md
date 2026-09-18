# 🌾 AksesPangan — Solusi Digital Penyelamatan Surplus Pangan & Pengurangan Emisi Karbon

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://bojongsantos-empire.vercel.app)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices%20Docker-blue?style=for-the-badge&logo=docker)](https://github.com/MaurellioChristopher/Bojongsantos-Empire)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Cloud%20DB-Supabase-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📌 Ringkasan Proyek (Project Overview)

**AksesPangan** adalah platform ekosistem sirkular berbasis web dan microservices yang dirancang untuk mengatasi paradoks **Food Waste** (makanan berlebih terbuang) dan **Food Insecurity** (kerawanan pangan) di Indonesia. Platform ini menghubungkan penyedia makanan surplus (restoran, katering, supermarket, toko roti, hotel) dengan penerima manfaat (organisasi sosial, panti asuhan, dapur umum, dan masyarakat sekitar) secara *real-time* sebelum makanan melewati batas aman konsumsi.

AksesPangan dilengkapi dengan telemetri **ESG (Environmental, Social, and Governance)** yang melacak reduksi emisi karbon ($CO_2e$), sertifikat keberlanjutan digital terverifikasi, kepatuhan mutu pangan berbasis standar BPOM & HACCP, serta sistem komunikasi langsung antar-pihak.

- **Live Demo Platform:** [https://bojongsantos-empire.vercel.app](https://bojongsantos-empire.vercel.app)
- **GitHub Repository:** [https://github.com/MaurellioChristopher/Bojongsantos-Empire](https://github.com/MaurellioChristopher/Bojongsantos-Empire)
- **Tim Pengembang:** Bojongsantos Empire

---

## 🚀 Fitur Unggulan (Key Features)

1. **Interactive Geolocation Surplus Map (`/penerima`):**
   - Peta interaktif berbasis Leaflet dengan visualisasi pin kategori pangan secara dinamis.
   - Filter radius, harga (Gratis / Subsidi), dan kategori mutu (*Siap Santap* vs *Bahan Baku Olahan*).
   - Zona **Darurat Pangan (Urgent Rescue)** untuk makanan dengan masa kedaluwarsa $< 4$ jam.

2. **Jaminan Mutu & Panduan Konsumsi BPOM/HACCP:**
   - Standar keamanan otomatis per kategori pangan (suhu simpan, batas aman suhu ruang, instruksi pemanasan ulang, dan daftar *Do's & Don'ts*).

3. **Booking & Distribusi Terisolasi:**
   - Reservasi stok makanan terintegrasi kode verifikasi pengambilan (*Pickup PIN*) dan batas waktu pengambilan (*Pickup Deadline*).

4. **Telemetri Dampak Lingkungan & ESG Real-Time (`/penyedia/esg`):**
   - Kalkulasi otomatis reduksi emisi gas rumah kaca ($1\text{ kg makanan} \approx 2.5\text{ kg } CO_2e$).
   - Akumulasi porsi terselamatkan dan nilai ekonomi pangan.
   - Penerbitan **Sertifikat Audit ESG Digital** yang dapat diunduh langsung oleh mitra donor.

5. **Chat Lintas Perangkat & Resolusi Keluhan Konsumen (`ChatModal`):**
   - Komunikasi langsung antara penyedia dan penerima pesanan dengan sinkronisasi awan berbasis Supabase.
   - Pusat mediasi keluhan mutu bagi Administrator platform.

6. **Observabilitas Arsitektur Microservices (`/#/admin` Tab Sistem):**
   - Dashboard observabilitas berstandar Apple Server Monitoring dengan telemetri *health-check* aktif (200 OK / 503 DOWN) terhadap masing-masing kontainer layanan mandiri.

---

## 🛠️ Technology Stack

| Layer | Teknologi / Tools | Keterangan |
| :--- | :--- | :--- |
| **Frontend Core** | Next.js 16 (App Router, Turbopack), React 19, TypeScript | Server Components & Client Hydration berkinerja tinggi |
| **Styling & UI** | Vanilla CSS Design Tokens, Tailwind CSS, Framer Motion | Desain elegan, transisi mikro halus, estetika Apple Design |
| **Icons & Maps** | Lucide React, Leaflet & React-Leaflet | Visualisasi spasial dan ikonografi modern |
| **Backend & Gateway** | Next.js Standalone API Routes & Node.js Microservices | REST API murni dengan sistem isolasi kegagalan (*Fault Tolerance*) |
| **Cloud Database** | Supabase (PostgreSQL, Realtime, Row Level Security) | Penyimpanan data awan persisten & sinkronisasi multi-device |
| **Local Cache / Fallback** | LocalStorage Engine + In-Memory Store | Menjamin sistem tetap beroperasi normal (*Offline-First*) |
| **Containerization** | Docker, Docker Compose | Orkes 6 container mandiri terhubung via bridge network |

---

## 🏛️ Arsitektur Sistem (System Architecture)

Sistem mengadopsi pola **Decoupled Autonomous Microservices dengan API Gateway**:

```
                              [ User Browser ]
                                     │
                             (HTTP / Port 3000)
                                     ▼
                      ┌─────────────────────────────┐
                      │    aksespangan-web-gateway  │ (Next.js Reverse Proxy & UI)
                      └──────────────┬──────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   auth-service     │    │ inventory-service  │    │  booking-service   │
│    (Port 3001)     │    │    (Port 3002)     │    │    (Port 3003)     │
└────────────────────┘    └────────────────────┘    └────────────────────┘
           │                         │                         │
           ▼                         ▼                         ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ analytics-service  │    │ governance-service │    │  Supabase Cloud DB │
│    (Port 3004)     │    │    (Port 3005)     │    │  (PostgreSQL)      │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

Setiap kontainer berjalan independen di dalam `aksespangan-network`. Jika salah satu backend kontainer dihentikan, aplikasi web gateway tetap beroperasi dan dashboard admin mendeteksi status layanan terputus secara *real-time*.

---

## 💻 Panduan Instalasi & Penggunaan (Installation & Setup Guide)

### Prasyarat
- [Node.js](https://nodejs.org/) v18.17+ atau v20+
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Opsional, untuk menjalankan mode Multi-Container)

---

### Opsi 1: Menjalankan Lokal (Standard Development)

1. **Clone repository:**
   ```bash
   git clone https://github.com/MaurellioChristopher/Bojongsantos-Empire.git
   cd Bojongsantos-Empire
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file `.env.local` di root proyek:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Jalankan dev server:**
   ```bash
   npm run dev
   ```
   Buka browser di [http://localhost:3000](http://localhost:3000).

---

### Opsi 2: Menjalankan dengan Docker Microservices (Multi-Container)

1. **Pastikan Docker Desktop aktif.**
2. **Jalankan Docker Compose:**
   ```bash
   docker compose up --build
   ```
3. Docker akan mengompilasi dan mengaktifkan 6 kontainer:
   - `aksespangan-web-gateway` (Port 3000)
   - `aksespangan-auth-service` (Port 3001)
   - `aksespangan-inventory-service` (Port 3002)
   - `aksespangan-booking-service` (Port 3003)
   - `aksespangan-analytics-service` (Port 3004)
   - `aksespangan-governance-service` (Port 3005)
4. Akses antarmuka pengguna di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Demo Pengujian (Demo Credentials)

Untuk pengujian cepat juri/evaluator, gunakan akun demo berikut di halaman Login:

| Peran (Role) | Email | Password | Hak Akses Fitur |
| :--- | :--- | :--- | :--- |
| **Penyedia (Donor)** | `restoran@demo.com` | `demo123` | Input Surplus Makanan, Kelola Reservasi, Dashboard ESG |
| **Penerima (Rescue)** | `penerima@demo.com` | `demo123` | Peta Surplus, Booking Makanan, Tiket PIN, Chat Mitra |
| **Administrator** | `admin@demo.com` | `admin123` | Observabilitas Microservices, Mediasi Keluhan, Audit ESG |

---

## 📄 Kepatuhan Lisensi Pihak Ketiga (Third-Party Resources & Licenses)

Seluruh pustaka pihak ketiga yang digunakan dalam proyek ini mematuhi lisensi *open-source* yang berlaku:
- **Next.js & React**: MIT License
- **Tailwind CSS & Framer Motion**: MIT License
- **Lucide Icons**: ISC License
- **Leaflet & OpenStreetMap**: BSD 2-Clause License & ODbL
- **Supabase Client**: Apache-2.0 License

---

## 👥 Tim Pengembang (Team)
- **Tim:** Bojongsantos Empire
- **Repository:** [https://github.com/MaurellioChristopher/Bojongsantos-Empire](https://github.com/MaurellioChristopher/Bojongsantos-Empire)
- **Deployment:** [https://bojongsantos-empire.vercel.app](https://bojongsantos-empire.vercel.app)
