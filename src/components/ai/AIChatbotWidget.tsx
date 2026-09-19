'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Leaf,
  Clock,
  Maximize2,
  Minimize2,
  Settings,
  Key,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  Zap,
  Utensils,
  Calculator,
  BookOpen,
  Users,
  MessageCircle,
  Star,
} from 'lucide-react';
import { getSurplusItems, calculateImpact } from '@/lib/data';
import { formatPrice, getSurplusPhoto, formatCountdown } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { SurplusItem } from '@/types';

// ============================================================
// Types
// ============================================================
interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  items?: SurplusItem[];
  actionLink?: { label: string; href: string };
  esgMetric?: { kg: number; co2: number; trees: number };
  isLLM?: boolean;
  modelUsed?: string;
}

// ============================================================
// SARA Avatar Component
// ============================================================
function SaraAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const icon = size === 'sm' ? 16 : size === 'lg' ? 24 : 18;
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center shrink-0 relative`}
      style={{
        background: 'linear-gradient(135deg, #143628 0%, #2D6A4F 50%, #1a5c40 100%)',
        boxShadow: '0 2px 8px rgba(45,106,79,0.4)',
      }}
    >
      {/* Leaf icon as SARA's visual identity */}
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" className="text-[#86EFAC]">
        <path
          d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
          fill="rgba(134,239,172,0.2)"
        />
        <path
          d="M17 8c-2.5-.5-5 .5-6.5 2.5C9 12.5 9 15 10 17c1.5-1 2.5-2.5 2.5-4 1 1 1.5 2.5 1 4 1.5-1 2.5-3 2-5 1 .5 1.5 1.5 1.5 2.5.5-1.5.5-3-.5-4.5C17.5 10 17.5 9 17 8z"
          fill="currentColor"
          className="text-[#86EFAC]"
        />
      </svg>
      {/* Online beacon */}
      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E] border border-[#143628]" />
      </span>
    </div>
  );
}

// ============================================================
// Initial welcome message
// ============================================================
const makeWelcomeMessage = (): ChatMessage => ({
  id: 'welcome-1',
  sender: 'bot',
  text: `Halo! Saya **SARA** 🌿 — *Smart Agri-food Rescue Assistant* dari platform **AksesPangan**.\n\nSaya siap membantu Anda 24/7:\n\n🍲 **Cari makanan surplus** terdekat di Bojongsoang & Bandung\n🌡️ **Panduan keamanan pangan** BPOM & HACCP yang akurat\n🌱 **Kalkulator emisi karbon** (CO₂e) dari aksi penyelamatan Anda\n🍳 **Resep kreatif zero-waste** dari sisa bahan makanan\n🏪 **Panduan lengkap** mendaftar & menggunakan AksesPangan\n💬 **Pertanyaan bebas** seputar pangan, gizi, & lingkungan\n\nApa yang ingin Anda ketahui hari ini?`,
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
});

// ============================================================
// Quick prompt categories
// ============================================================
const QUICK_PROMPTS = [
  { icon: '🍲', label: 'Cari Makanan Gratis' },
  { icon: '🌱', label: 'Hitung Emisi 5 kg' },
  { icon: '🍳', label: 'Resep Nasi Sisa' },
  { icon: '🛡️', label: 'Cara Reheating Aman' },
  { icon: '🏪', label: 'Cara Daftar Mitra' },
  { icon: '👑', label: 'Siapa Pembuat Web Ini?' },
  { icon: '📍', label: 'Stok di Bojongsoang' },
  { icon: '🥬', label: 'Resep Sayur Layu' },
  { icon: '🥐', label: 'Olah Roti Sisa' },
  { icon: '❓', label: 'Apa itu AksesPangan?' },
];

// ============================================================
// Offline semantic engine — 15+ smart categories
// ============================================================
function processOfflineQuery(rawQuery: string, allItems: SurplusItem[]): ChatMessage {
  const q = rawQuery.toLowerCase().trim();
  const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const active = allItems.filter((i) => i.status === 'active');

  // Helper
  const mkBot = (text: string, extras: Partial<ChatMessage> = {}): ChatMessage => ({
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender: 'bot',
    text,
    timestamp: nowTime,
    ...extras,
  });

  // ── 1. GREETINGS ──────────────────────────────────────────
  if (/^(halo|hai|hi|hello|selamat|hei|pagi|siang|malam|assalamu|permisi|ada\?)/.test(q)) {
    const hour = new Date().getHours();
    const salam = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
    return mkBot(
      `${salam}! 🌿 Saya **SARA**, asisten AI AksesPangan.\n\nSaya bisa membantu Anda menemukan makanan surplus gratis, menghitung jejak karbon, memberikan resep kreatif, atau menjawab pertanyaan seputar pangan dan lingkungan.\n\nMau mulai dari mana?`
    );
  }

  // ── 2. IDENTITY (SARA / BOT) ──────────────────────────────
  if (/(siapa kamu|kamu siapa|apa itu sara|perkenalkan|tentang bot|tentang ai|bot ini)/.test(q)) {
    return mkBot(
      `Perkenalkan, saya **SARA** (Smart Agri-food Rescue Assistant) 🌿\n\nSaya adalah asisten kecerdasan buatan resmi platform **AksesPangan**, yang dirancang khusus untuk:\n\n• 🍲 Membantu Anda menemukan & mengambil makanan surplus\n• 🌱 Mengedukasi tentang keamanan pangan & lingkungan\n• 🍳 Memberikan inspirasi resep zero-waste\n• 📊 Menghitung dampak ESG dari aksi penyelamatan pangan\n\nSaya dikembangkan oleh **Tim Bojongsantos Empire** dan didukung teknologi **Google Gemini AI**. Saya aktif 24/7 untuk mendukung misi nol sampah makanan Indonesia! 🇮🇩`
    );
  }

  // ── 3. CREATOR / TEAM ────────────────────────────────────
  if (/(pembuat|developer|siapa yang|tim|anggota|bojongsantos|diciptakan|dibikin|author|penemu|founder)/.test(q)) {
    return mkBot(
      `👑 **Platform AksesPangan** diciptakan oleh **Tim Bojongsantos Empire**:\n\n1. 🌟 **Maurellio Christopher Yonathan**\n2. 🌸 **Alya Salma Khoerunnisaa**\n3. ⚡ **Rakean Ahmad Zayyid Ardhi**\n4. 🚀 **Jazzkord Cmajor Dahring**\n\nMereka merancang sistem ini dengan arsitektur **6 microservices** (Auth, Inventory, Booking, Analytics, Governance, Notifications) dan AI terpadu untuk mewujudkan **SDGs 2, 12, dan 13** — Zero Hunger, Konsumsi Bertanggung Jawab, dan Aksi Iklim.\n\nSebuah karya nyata untuk Indonesia! 🇮🇩🌿`
    );
  }

  // ── 4. WHAT IS AKSESPANGAN ───────────────────────────────
  if (/(apa itu aksespangan|tentang aksespangan|aksespangan itu|platform ini|website ini|fungsi web)/.test(q)) {
    return mkBot(
      `🌿 **AksesPangan** adalah platform digital penyelamatan pangan surplus Indonesia.\n\n**Cara kerjanya:**\n1. 🏪 Restoran, hotel, & katering mengunggah makanan surplus mereka\n2. 🍲 Masyarakat & penerima manfaat bisa mengklaim secara gratis/murah\n3. 📱 Verifikasi serah terima via **PIN** atau **scan QR Code**\n4. 🌱 Setiap kilogram yang terselamatkan = **2.5 kg CO₂e** dicegah\n\n**Dampak nyata:**\n• Mengurangi food waste Indonesia (23-48 juta ton/tahun)\n• Membantu masyarakat prasejahtera mendapat gizi layak\n• Menghasilkan laporan ESG/CSR untuk mitra bisnis\n\nMau cari makanan sekarang atau daftar jadi mitra?`,
      { actionLink: { label: 'Mulai Jelajahi Platform →', href: '#/penerima' } }
    );
  }

  // ── 5. FOOD SEARCH ───────────────────────────────────────
  if (/(cari|makanan|surplus|gratis|ambil|klaim|bojongsoang|bandung|nasi|roti|sayur|buah|lauk|minuman|stok|tersedia|ada apa)/.test(q)) {
    let matched = [...active];

    if (q.includes('gratis')) matched = matched.filter((i) => i.isFree);
    if (q.includes('bojongsoang')) matched = matched.filter((i) => (i.address + i.providerBusinessName).toLowerCase().includes('bojongsoang'));
    else if (q.includes('bandung')) matched = matched.filter((i) => (i.address + i.providerBusinessName).toLowerCase().includes('bandung'));

    const categoryMap: Record<string, string> = {
      nasi: 'nasi', roti: 'roti', sayur: 'sayur', buah: 'buah',
      lauk: 'lauk', kue: 'kue', minuman: 'minuman',
    };
    for (const [key, cat] of Object.entries(categoryMap)) {
      if (q.includes(key)) { matched = matched.filter((i) => i.foodCategory === cat); break; }
    }

    const topItems = matched.slice(0, 4);
    if (topItems.length === 0) {
      return mkBot(
        `Maaf, saat ini belum ada stok surplus untuk kriteria pencarian tersebut. 😔\n\n💡 **Saran:**\n• Coba cari dengan kategori berbeda (nasi, roti, sayur, dll)\n• Periksa kembali dalam beberapa jam — stok baru sering ditambah sore hari (15:00–18:00 WIB)\n• Aktifkan notifikasi untuk dapat pemberitahuan stok baru`,
        { actionLink: { label: 'Buka Peta Surplus Lengkap →', href: '#/penerima' } }
      );
    }

    return mkBot(
      `✅ Ditemukan **${topItems.length} makanan surplus** yang siap diselamatkan!\n\n👇 Ketuk kartu di bawah untuk info lengkap & cara mengambilnya:`,
      {
        items: topItems,
        actionLink: { label: 'Lihat Semua di Katalog →', href: '#/penerima' },
      }
    );
  }

  // ── 6. FOOD SAFETY ───────────────────────────────────────
  if (/(aman|keamanan|bpom|haccp|suhu|reheat|panaskan|basi|rusak|simpan|kulkas|expire|kedaluwarsa|bahaya|standar mutu|food safety|danger zone)/.test(q)) {
    return mkBot(
      `🛡️ **Panduan Keamanan Pangan (BPOM & HACCP):**\n\n**⚠️ Danger Zone:** Suhu **5°C – 60°C** adalah zona proliferasi bakteri tercepat. Hindari makanan berada di zona ini lebih dari **2 jam** (di iklim tropis Indonesia).\n\n**🌡️ Standar Penyimpanan:**\n• Makanan matang di suhu ruang: maks **2–4 jam**\n• Di lemari es (< 4°C): maks **24 jam** (lauk matang)\n• Di freezer (< -18°C): maks **1–3 bulan**\n\n**🔥 Reheating yang Benar:**\n• Panaskan hingga suhu inti minimal **74°C** selama **≥ 15 detik**\n• Hanya boleh dipanaskan ulang **1 kali** saja\n• Tambahkan sedikit air agar nasi tidak kering\n\n**👁️ Uji Sensori 3L sebelum konsumsi:**\n• **Lihat:** tidak berjamur, warna normal\n• **Cium:** tidak berbau asam/tengik/menyengat\n• **Raba:** tidak berlendir atau bertekstur aneh\n\n*Jika ragu pada salah satu tanda — **jangan dikonsumsi**.*`,
      { actionLink: { label: 'Baca Standar Mutu Lengkap →', href: '#/terms' } }
    );
  }

  // ── 7. CARBON / ESG CALCULATOR ───────────────────────────
  if (/(karbon|emisi|co2|esg|jejak|lingkungan|hitung|reduksi|iklim|metana|co₂|gas rumah kaca|pohon)/.test(q)) {
    const numMatch = q.match(/(\d+(?:[.,]\d+)?)\s*kg?/);
    const kg = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 10;
    const co2 = Math.round(kg * 2.5 * 10) / 10;
    const trees = Math.round((co2 / 22) * 10) / 10;

    return mkBot(
      `🌱 **Kalkulator Reduksi Emisi Karbon:**\n\nSetiap **1 kg makanan terselamatkan** = **2.5 kg CO₂e dicegah** *(Sumber: IPCC & WRI)*\n\nMakanan yang membusuk di TPA menghasilkan gas **metana (CH₄)** yang 25× lebih kuat dari CO₂ dalam memperparah pemanasan global.\n\n---\n\n✅ Dengan menyelamatkan **${kg} kg makanan**, Anda telah:`,
      {
        esgMetric: { kg, co2, trees },
        actionLink: { label: 'Lihat Dashboard ESG & Sertifikat →', href: '#/dashboard' },
      }
    );
  }

  // ── 8. RICE / NASI RECIPE ────────────────────────────────
  if (/(resep nasi|olah nasi|nasi sisa|nasi kemarin|nasi basi|nasi dingin|nasi goreng)/.test(q)) {
    return mkBot(
      `🍚 **5 Resep Kreatif dari Nasi Sisa:**\n\n**1. Nasi Goreng Spesial** *(10 menit)*\n   Tumis bawang putih + bawang merah → tambah nasi dingin + kecap + telur ceplok → tabur daun bawang & kerupuk.\n\n**2. Arancini Bola Nasi Goreng** *(20 menit)*\n   Campur nasi + keju parut + kocokan telur → bentuk bola → gulingkan tepung roti → goreng hingga keemasan.\n\n**3. Nasi Bakar Daun Pisang** *(15 menit)*\n   Campur nasi + bumbu teri/ayam + sereh → bungkus daun pisang → bakar di atas bara api.\n\n**4. Bubur Instan Hemat** *(15 menit)*\n   Tambahkan kaldu ayam ke nasi → masak sambil terus diaduk → tambah jahe, merica, & topping suka-suka.\n\n**5. Crispy Rice Snack** *(30 menit + oven)*\n   Pipihkan nasi di loyang → panggang 180°C 20 menit → potong-potong → tabur garam & wijen.\n\n🌿 **Tips Zero-Waste:** Nasi terlalu basi untuk dimakan? Jadikan kompos atau campuran pakan ternak!`
    );
  }

  // ── 9. BREAD / ROTI RECIPE ───────────────────────────────
  if (/(resep roti|olah roti|roti sisa|roti keras|roti kemarin|baguette|sourdough)/.test(q)) {
    return mkBot(
      `🍞 **5 Cara Kreatif Olah Roti Sisa:**\n\n**1. French Toast Klasik** *(10 menit)*\n   Celup irisan roti ke kocokan telur + susu + kayu manis → goreng mentega hingga keemasan → sajikan dengan madu.\n\n**2. Bread Pudding** *(45 menit)*\n   Potong roti → rendam campuran susu + telur + gula + vanilla → tuang ke loyang → panggang 180°C 30 mnt.\n\n**3. Crouton Salad** *(15 menit)*\n   Potong dadu roti → lumuri minyak zaitun + oregano + bawang putih → panggang 160°C 15 mnt hingga renyah.\n\n**4. Bruschetta Tomat** *(10 menit)*\n   Panggang irisan roti → olesi bawang putih segar → taruh tomat cincang + basil + minyak zaitun.\n\n**5. Pizza Roti Dadakan** *(15 menit)*\n   Oles saus tomat + keju mozzarella + topping pilihan → panggang 200°C 10 mnt.\n\n🌿 **Tips:** Roti yang sudah sangat keras? Rendam air lalu kukus 5 menit — hasilnya seperti baru!`
    );
  }

  // ── 10. VEGETABLE / SAYUR RECIPE ─────────────────────────
  if (/(resep sayur|olah sayur|sayur layu|sayur sisa|bayam|kangkung|brokoli|wortel|kubis)/.test(q)) {
    return mkBot(
      `🥬 **Resep dari Sayuran Layu / Sisa:**\n\n**1. Kaldu Sayuran Kaya Gizi** *(30 menit)*\n   Rebus semua sisa sayuran (wortel, seledri, bawang, dll) + air → saring → gunakan sebagai kaldu sup/masakan.\n\n**2. Kimchi Cepat** *(10 menit + fermentasi 1 hari)*\n   Potong kubis/sawi → lumuri garam → peras air → campur pasta gochugaru + bawang putih + jahe + gula.\n\n**3. Tumis Bumbu Habang** *(15 menit)*\n   Haluskan cabai merah + bawang + tomat → tumis → masukkan semua sayuran sisa → kecap manis + garam.\n\n**4. Vegetable Smoothie Hijau** *(5 menit)*\n   Blender bayam/kangkung + pisang matang + susu/yogurt + madu → kaya zat besi & serat.\n\n**5. Keripik Sayur Oven** *(25 menit)*\n   Iris tipis wortel/zucchini/bayam → lumuri minyak + garam → panggang 160°C 20 mnt hingga kering.\n\n🌿 **Tips:** Sayuran yang sangat layu masih bisa digunakan untuk kaldu — jangan langsung dibuang!`
    );
  }

  // ── 11. FRUIT / BUAH RECIPE ──────────────────────────────
  if (/(resep buah|olah buah|buah matang|buah layu|pisang|mangga|pepaya|jeruk|semangka)/.test(q)) {
    return mkBot(
      `🍎 **Resep dari Buah Terlalu Matang:**\n\n**1. Banana Ice Cream** *(5 menit + beku)*\n   Bekukan pisang terlalu matang → blender hingga creamy → tambah cokelat/stroberi → jadi es krim sehat!\n\n**2. Smoothie Bowl Tropis** *(5 menit)*\n   Blender mangga/pepaya + pisang + susu → tuang ke mangkuk → hias granola + madu + buah segar.\n\n**3. Selai Buah Homemade** *(30 menit)*\n   Potong buah → masak dengan gula (50% berat buah) + air perasan lemon → aduk hingga mengental.\n\n**4. Kompot Buah Spiced** *(20 menit)*\n   Masak semua buah + air + kayu manis + cengkeh + gula → saring → minum sebagai minuman segar/hangat.\n\n**5. Kulit Buah Permen Alami** *(dried fruit)*\n   Kupas & iris tipis buah → rendam air gula → jemur/oven suhu rendah 70°C hingga kering.\n\n🌿 **Bonus:** Kulit pisang → pupuk alami tanaman. Biji pepaya → bumbu lada alternatif setelah dikeringkan!`
    );
  }

  // ── 12. PROVIDER ONBOARDING ──────────────────────────────
  if (/(daftar|cara daftar|mitra|penyedia|restoran|hotel|katering|donor|upload surplus|cara upload|unggah)/.test(q)) {
    return mkBot(
      `🏪 **Panduan Menjadi Mitra Penyedia AksesPangan:**\n\n**Langkah 1 — Registrasi (2 menit)**\n   Buka menu "Daftar" → pilih peran **Mitra Penyedia** → isi nama bisnis, alamat, kontak.\n\n**Langkah 2 — Unggah Surplus (1 menit/item)**\n   Dashboard → Kelola Surplus → "+ Tambah Bahan Baku" atau "+ Tambah Sisa Makanan"\n   Isi: nama item, kategori, berat (kg), estimasi porsi, batas waktu aman, harga (gratis/berbayar).\n\n**Langkah 3 — Terima Pesanan**\n   Notifikasi masuk saat ada penerima yang memesan → konfirmasi atau tolak → chat koordinasi langsung.\n\n**Langkah 4 — Verifikasi Serah Terima**\n   Penerima datang bawa **QR Code** atau **PIN 4 digit** → scan/input PIN → pesanan selesai!\n\n**Langkah 5 — Dapatkan Laporan ESG**\n   Setiap bulan dapatkan **Sertifikat Dampak Lingkungan** dengan tonase pangan & CO₂ yang berhasil diselamatkan — cocok untuk laporan CSR!\n\n🌟 *Bergabung sekarang dan jadilah pahlawan pangan!*`,
      { actionLink: { label: 'Daftar Jadi Mitra Sekarang →', href: '#/register' } }
    );
  }

  // ── 13. RECIPIENT ONBOARDING ─────────────────────────────
  if (/(cara ambil|cara klaim|cara pesan|prosedur|pengambilan|booking|penerima|qr code|pin|tiket)/.test(q)) {
    return mkBot(
      `📱 **Cara Mengambil Makanan Surplus di AksesPangan:**\n\n**1. Daftar/Masuk** sebagai Penerima Manfaat\n\n**2. Cari Makanan** di Katalog — filter berdasarkan lokasi, kategori, atau harga.\n\n**3. Klik "Detail & Pesan"** → konfirmasi pemesanan → tunggu konfirmasi dari penyedia.\n\n**4. Tiket QR Code** — setelah dikonfirmasi, Anda mendapat **tiket digital** berisi QR Code + PIN 4 digit di menu "Pesanan Saya".\n\n**5. Datang ke Lokasi** — tunjukkan QR Code atau sebutkan PIN kepada penyedia saat pengambilan.\n\n**6. Pesanan Selesai!** — penyedia scan QR/input PIN → status berubah "Diambil" → pangan terselamatkan! 🎉\n\n⏰ *Perhatikan batas waktu pengambilan yang tertera di tiket!*`,
      { actionLink: { label: 'Cari Makanan Tersedia →', href: '#/penerima' } }
    );
  }

  // ── 14. FOOD WASTE FACTS / EDUCATION ─────────────────────
  if (/(fakta|statistik|data|food waste|sampah makanan|pembuangan|indonesia|dunia|masalah pangan|kelaparan|edukasi)/.test(q)) {
    return mkBot(
      `📊 **Fakta Food Waste Indonesia yang Mengejutkan:**\n\n🇮🇩 **Indonesia = Pembuang Makanan Terbesar Ke-2 di G20**\n   23 – 48 juta ton makanan terbuang per tahun *(Bappenas)*\n\n☁️ **Dampak Iklim yang Serius:**\n   Makanan busuk di TPA hasilkan **metana (CH₄)** yang 25× lebih merusak iklim dari CO₂.\n   Food waste global = **8–10%** dari total emisi gas rumah kaca bumi.\n\n🍽️ **Paradoks Pangan:**\n   Di saat jutaan ton makanan terbuang, **28 juta warga Indonesia** masih mengalami kerawanan pangan.\n\n💰 **Kerugian Ekonomi:**\n   Indonesia kehilangan **Rp 213–551 triliun/tahun** akibat food waste *(Bappenas 2021)*.\n\n🌱 **Solusinya:**\n   Jika 25% food waste Indonesia berhasil diselamatkan, bisa memberi makan **70 juta orang** per hari!\n\n*AksesPangan hadir sebagai solusi nyata untuk masalah ini.* 💚`,
      { actionLink: { label: 'Lihat Dampak Nyata di Dashboard ESG →', href: '#/dashboard' } }
    );
  }

  // ── 15. NUTRITION / GIZI QUESTIONS ───────────────────────
  if (/(gizi|nutrisi|vitamin|kalori|protein|karbohidrat|lemak|serat|mineral|kesehatan makan|diet|obesitas)/.test(q)) {
    return mkBot(
      `🥗 **Tips Gizi & Nutrisi dari Makanan Surplus:**\n\nMakanan surplus dari restoran dan hotel umumnya berkualitas tinggi. Berikut panduan memaksimalkan nilai gizinya:\n\n**🍚 Karbohidrat (nasi, roti):**\n   Sumber energi utama. Konsumsi porsi sedang (100-150g) — pilih nasi merah jika tersedia.\n\n**🍗 Protein (lauk ayam/ikan/tahu/tempe):**\n   Penting untuk regenerasi sel. Pastikan dipanaskan ulang dengan benar sebelum dikonsumsi.\n\n**🥬 Serat (sayuran, buah):**\n   Jaga kesehatan pencernaan & turunkan kolesterol. Cuci bersih dan konsumsi sesegera mungkin.\n\n**💧 Hidrasi:**\n   Minum minimal 8 gelas air/hari — terutama penting saat mengonsumsi makanan reheat yang lebih padat garam.\n\n**⚠️ Catatan Keamanan:**\n   Makanan surplus tetap aman dan bergizi selama dikonsumsi dalam batas waktu yang tertera dan disimpan dengan benar.\n\n*Ingin tahu nilai gizi spesifik dari makanan tertentu? Tanyakan saja!* 😊`
    );
  }

  // ── 16. ESG / DASHBOARD / CERTIFICATE ────────────────────
  if (/(dashboard|laporan|sertifikat|esg|csr|audit|dampak|impact|telemetri)/.test(q)) {
    return mkBot(
      `📈 **Dashboard ESG & Sertifikat Dampak AksesPangan:**\n\nSetiap transaksi penyelamatan pangan tercatat dan diukur dampaknya secara otomatis:\n\n📊 **Yang bisa dilihat di Dashboard:**\n• Total kilogram pangan terselamatkan\n• Estimasi emisi CO₂e yang dicegah\n• Jumlah porsi makanan terdistribusi\n• Timeline tren penyelamatan pangan\n• Setara pohon yang ditanam (1 pohon = ±22 kg CO₂/tahun)\n\n🏆 **Sertifikat ESG untuk Penyedia:**\nMitra penyedia otomatis mendapat laporan dampak yang dapat digunakan untuk:\n• Laporan keberlanjutan CSR perusahaan\n• Audit ESG dan sertifikasi green business\n• Materi promosi brand bertanggung jawab lingkungan\n\n*Semua data real-time dan transparan!*`,
      { actionLink: { label: 'Buka Dashboard ESG →', href: '#/dashboard' } }
    );
  }

  // ── DEFAULT FALLBACK ──────────────────────────────────────
  return mkBot(
    `Terima kasih atas pertanyaan Anda tentang *"${rawQuery}"* 💬\n\nSaya SARA, asisten AI AksesPangan. Untuk pertanyaan yang lebih kompleks dan bebas seperti ini, saya bekerja jauh lebih optimal dengan **Google Gemini AI** aktif.\n\n⚡ **Aktifkan AI Penuh:**\nKlik tombol ⚙️ di pojok kanan atas → masukkan **Gemini API Key** gratis dari [aistudio.google.com](https://aistudio.google.com) → saya bisa menjawab **semua pertanyaan** secara mendalam!\n\nSementara itu, saya tetap bisa membantu:\n• 🍲 Cari makanan surplus tersedia\n• 🌱 Hitung reduksi emisi karbon\n• 🍳 Ide resep zero-waste\n• 🛡️ Panduan keamanan pangan`,
    { actionLink: { label: 'Jelajahi Katalog Surplus →', href: '#/penerima' } }
  );
}

// ============================================================
// Main Widget Component
// ============================================================
export function AIChatbotWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcomeMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<SurplusItem | null>(null);
  const [activeModel, setActiveModel] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aksespangan_gemini_key') || '';
      const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const active = stored || envKey;
      if (active) { setGeminiApiKey(active); setTempApiKey(active); }
    } catch { /* ignore */ }
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping, scrollToBottom]);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setGeminiApiKey(trimmed);
    try {
      trimmed
        ? localStorage.setItem('aksespangan_gemini_key', trimmed)
        : localStorage.removeItem('aksespangan_gemini_key');
    } catch { /* ignore */ }
    setShowSettings(false);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3500);
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Build message history for Gemini (last 10 turns to stay within context)
    const historyForApi = [...messages, userMsg]
      .slice(-20)
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text }));

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          userApiKey: geminiApiKey || undefined,
          userContext: {
            userName: user?.name,
            userRole: user?.role,
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.reply) {
        const q = text.toLowerCase();
        const shouldAttachItems =
          q.includes('makanan') || q.includes('cari') || q.includes('gratis') ||
          q.includes('stok') || q.includes('surplus') || q.includes('ambil') ||
          q.includes('bojongsoang') || q.includes('bandung');

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: nowTime,
          isLLM: true,
          modelUsed: data.model,
        };

        if (shouldAttachItems) {
          const items = getSurplusItems().filter((i) => i.status === 'active').slice(0, 3);
          if (items.length > 0) botMsg.items = items;
        }

        if (data.model) setActiveModel(data.model);
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('SARA API fallback to offline engine:', err);
    }

    // Offline fallback
    setTimeout(() => {
      const allItems = getSurplusItems();
      const botReply = processOfflineQuery(text, allItems);
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    setMessages([makeWelcomeMessage()]);
    setActiveModel('');
  };

  const handleClaimFood = () => {
    setSelectedFoodItem(null);
    setIsOpen(false);
    window.location.hash = isAuthenticated ? '#/penerima' : '#/login';
  };

  const hasKey = !!geminiApiKey;

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Launcher Button ── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 py-2.5 px-4 rounded-full shadow-2xl border cursor-pointer select-none transition-all"
          style={{
            background: 'linear-gradient(135deg, #143628 0%, #1C4736 100%)',
            borderColor: 'rgba(45,106,79,0.5)',
            boxShadow: '0 8px 24px rgba(20,54,40,0.45)',
          }}
          aria-label="Buka Asisten SARA AI"
        >
          <SaraAvatar size="sm" />
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
              SARA
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#2D6A4F]/60 border border-[#2D6A4F]/40 text-[#86EFAC]">
                {hasKey ? 'Gemini AI' : 'AI'}
              </span>
            </div>
            <div className="text-[10px] text-white/65 leading-tight">
              {hasKey ? 'Aktif & Siap Menjawab' : 'Asisten Pangan & ESG'}
            </div>
          </div>
          {/* Notification dot when closed */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FBBF24] rounded-full border-2 border-white flex items-center justify-center">
              <Sparkles size={8} className="text-[#78350F]" />
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Chat Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-[#DCE5DB] flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-3 md:inset-8 w-auto h-auto max-w-4xl max-h-[88vh] m-auto'
                : 'bottom-20 md:bottom-20 right-3 sm:right-6 w-[95vw] sm:w-[420px] h-[600px] max-h-[88vh]'
            }`}
          >
            {/* ── Header ── */}
            <div
              className="text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #0d2a1c 0%, #143628 60%, #1a4a32 100%)' }}
            >
              <div className="flex items-center gap-2.5">
                <SaraAvatar size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold leading-tight tracking-tight">SARA</h3>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-semibold border ${
                        hasKey
                          ? 'bg-emerald-500/20 text-[#86EFAC] border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                      }`}
                    >
                      {activeModel
                        ? activeModel === 'gemini-2.0-flash' ? 'Gemini 2.0' : 'Gemini 1.5'
                        : hasKey ? 'Gemini AI' : 'Smart Engine'}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/70 m-0 leading-tight">
                    Smart Agri-food Rescue Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-0.5 text-white/80">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
                  title="Pengaturan API Key"
                ><Settings size={14} /></button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title={isExpanded ? 'Kecilkan' : 'Perbesar'}
                >{isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
                <button
                  onClick={handleReset}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Reset Percakapan"
                ><RefreshCw size={13} /></button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white ml-0.5"
                  title="Tutup"
                ><X size={16} /></button>
              </div>
            </div>

            {/* ── Key Saved Toast ── */}
            {keySavedToast && (
              <div className="bg-emerald-700 text-white text-[11px] px-3 py-1.5 flex items-center justify-between font-medium shrink-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>API Key Gemini berhasil disimpan! SARA sekarang aktif dengan AI penuh.</span>
                </div>
                <button onClick={() => setKeySavedToast(false)}><X size={12} /></button>
              </div>
            )}

            {/* ── Settings Panel ── */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#EDF2EC] border-b border-[#CAD6C8] p-3.5 shrink-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#143628]">
                      <Key size={13} className="text-[#2D6A4F]" />
                      <span>Konfigurasi Google Gemini AI</span>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="text-[#597367] hover:text-[#143628]">
                      <X size={13} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#597367] mb-2.5 leading-relaxed">
                    Aktifkan <strong>Gemini API Key</strong> agar SARA menjadi lebih pintar — bisa menjawab segala pertanyaan bebas (resep, gizi, sains, dll).
                  </p>
                  <input
                    type="password"
                    placeholder="AIzaSy... (tempel Gemini API Key)"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#CAD6C8] rounded-lg text-xs text-[#143628] focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1"
                    >
                      Dapatkan Key Gratis → Google AI Studio
                      <ExternalLink size={9} />
                    </a>
                    <button
                      onClick={handleSaveApiKey}
                      className="bg-[#2D6A4F] hover:bg-[#1C4736] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                    >
                      Simpan & Aktifkan
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Quick Prompts Bar ── */}
            <div
              className="bg-[#F7F9F6] border-b border-[#DCE5DB] px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(`${p.icon} ${p.label}`)}
                  className="whitespace-nowrap bg-white hover:bg-[#EDF2EC] text-[#143628] border border-[#DCE5DB] text-[11px] font-medium py-1 px-2.5 rounded-full transition-all shrink-0 hover:border-[#2D6A4F] shadow-2xs cursor-pointer active:scale-95"
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]/40">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
                    {isBot && <SaraAvatar size="sm" />}

                    <div
                      className={`max-w-[86%] rounded-[18px] p-3.5 text-xs leading-relaxed shadow-2xs ${
                        isBot
                          ? 'bg-white text-[#143628] border border-[#DCE5DB] rounded-tl-sm'
                          : 'text-white rounded-tr-sm'
                      }`}
                      style={isBot ? {} : {
                        background: 'linear-gradient(135deg, #143628 0%, #1C4736 100%)',
                      }}
                    >
                      {/* Markdown-lite renderer */}
                      <div className="whitespace-pre-line space-y-0.5">
                        {msg.text.split('\n').map((line, li) => {
                          const html = line
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>');
                          return (
                            <span
                              key={li}
                              dangerouslySetInnerHTML={{ __html: html }}
                              className="block"
                            />
                          );
                        })}
                      </div>

                      {/* ESG Metric Card */}
                      {msg.esgMetric && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-emerald-200">
                          <div className="bg-emerald-50 px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Leaf size={15} className="text-emerald-700" />
                              <span className="font-bold text-xs text-emerald-900">{msg.esgMetric.kg} kg Pangan Diselamatkan</span>
                            </div>
                          </div>
                          <div className="bg-white px-3 py-2.5 grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <div className="font-mono font-black text-lg text-emerald-700">−{msg.esgMetric.co2}</div>
                              <div className="text-[10px] text-emerald-600 font-semibold">kg CO₂e Dicegah</div>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <div className="font-mono font-black text-lg text-emerald-700">≈{msg.esgMetric.trees}</div>
                              <div className="text-[10px] text-emerald-600 font-semibold">Pohon/Tahun</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Food Item Cards */}
                      {msg.items && msg.items.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-[11px] font-bold text-[#2D6A4F] flex items-center gap-1">
                            <ShoppingBag size={12} />
                            <span>Klik untuk info lengkap & cara ambil:</span>
                          </div>
                          {msg.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedFoodItem(item)}
                              role="button"
                              tabIndex={0}
                              className="p-2.5 bg-[#F7F9F6] hover:bg-[#EDF2EC] rounded-xl border border-[#DCE5DB] hover:border-[#2D6A4F] flex items-center gap-2.5 cursor-pointer transition-all group active:scale-[0.98]"
                            >
                              <img
                                src={getSurplusPhoto(item)}
                                alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover border border-[#DCE5DB] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-[11px] text-[#143628] group-hover:text-[#2D6A4F] truncate transition-colors">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-[#597367] truncate">{item.providerBusinessName}</div>
                                <div className="text-[10px] text-[#2D6A4F] font-medium flex items-center gap-1 mt-0.5">
                                  <Clock size={9} />
                                  <span>{formatCountdown(item.expiryTime)}</span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                item.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'
                              }`}>
                                {item.isFree ? 'Gratis' : formatPrice(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Link */}
                      {msg.actionLink && (
                        <a
                          href={msg.actionLink.href}
                          onClick={() => setIsOpen(false)}
                          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2D6A4F] hover:underline"
                        >
                          <ArrowRight size={11} />
                          <span>{msg.actionLink.label}</span>
                        </a>
                      )}

                      {/* Timestamp + model badge */}
                      <div className={`text-[9px] mt-1.5 flex items-center justify-between ${isBot ? 'text-[#597367]' : 'text-white/50'}`}>
                        <span>{msg.timestamp}</span>
                        {msg.isLLM && msg.modelUsed && (
                          <span className="text-[8px] font-mono text-[#2D6A4F]/70 flex items-center gap-0.5">
                            <Zap size={7} />
                            {msg.modelUsed}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5">
                  <SaraAvatar size="sm" />
                  <div className="bg-white border border-[#DCE5DB] rounded-[16px] rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2 shadow-2xs">
                    <div className="flex gap-1 items-center">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-[#597367] font-medium">SARA sedang berpikir…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Food Item Detail Modal ── */}
            <AnimatePresence>
              {selectedFoodItem && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3"
                >
                  <motion.div
                    initial={{ scale: 0.92, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, y: 15 }}
                    className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#DCE5DB] flex flex-col max-h-[90%]"
                  >
                    <div className="relative h-40 bg-stone-100 shrink-0">
                      <img src={getSurplusPhoto(selectedFoodItem)} alt={selectedFoodItem.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSelectedFoodItem(null)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center cursor-pointer transition-all"
                      ><X size={14} /></button>
                      <div className="absolute bottom-2 left-2 flex gap-1.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${selectedFoodItem.isFree ? 'bg-emerald-600 text-white' : 'bg-white text-[#143628]'}`}>
                          {selectedFoodItem.isFree ? '100% GRATIS' : formatPrice(selectedFoodItem.price)}
                        </span>
                        <span className="text-[11px] bg-black/70 text-white px-2.5 py-1 rounded-full font-semibold">
                          {selectedFoodItem.quantity} kg
                        </span>
                      </div>
                    </div>

                    <div className="p-4 overflow-y-auto space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-[#143628] leading-snug">{selectedFoodItem.name}</h4>
                        <p className="text-xs text-[#597367] mt-0.5 leading-relaxed">
                          {selectedFoodItem.description || 'Pangan surplus layak konsumsi berkualitas tinggi.'}
                        </p>
                      </div>

                      <div className="bg-[#F7F9F6] p-2.5 rounded-xl border border-[#DCE5DB] text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-[#143628] font-semibold">
                          <MapPin size={12} className="text-[#2D6A4F] shrink-0" />
                          <span className="truncate">{selectedFoodItem.providerBusinessName}</span>
                        </div>
                        <div className="text-[11px] text-[#597367] pl-4">{selectedFoodItem.address}</div>
                        <div className="flex items-center gap-2 text-[11px] text-[#597367] pt-0.5">
                          <Clock size={11} className="text-[#B8401A] shrink-0" />
                          <span>
                            Ambil sebelum: {selectedFoodItem.expiryTime
                              ? new Date(selectedFoodItem.expiryTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
                              : 'Hari ini'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                        <span className="text-[11px] text-emerald-900">Terverifikasi standar keamanan pangan BPOM.</span>
                      </div>

                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          onClick={handleClaimFood}
                          className="w-full py-2.5 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                          style={{ background: 'linear-gradient(135deg, #143628 0%, #2D6A4F 100%)' }}
                        >
                          <ShoppingBag size={13} />
                          {isAuthenticated ? 'Ambil / Pesan Sekarang' : 'Masuk untuk Klaim Makanan'}
                        </button>
                        <button
                          onClick={() => { setSelectedFoodItem(null); setIsOpen(false); window.location.hash = '#/penerima'; }}
                          className="w-full py-2 bg-white hover:bg-stone-50 border border-[#DCE5DB] text-[#143628] rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MapPin size={12} />
                          Lihat di Peta Katalog
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input Bar ── */}
            <div className="p-3 bg-white border-t border-[#DCE5DB] shrink-0">
              <div className="flex items-center gap-2 bg-[#F7F9F6] border border-[#DCE5DB] focus-within:border-[#2D6A4F] focus-within:bg-white rounded-full px-3.5 py-2 transition-all shadow-2xs">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={hasKey ? 'Tanya apa saja ke SARA…' : 'Cari makanan, resep, atau tanya pangan…'}
                  className="flex-1 bg-transparent text-xs text-[#143628] focus:outline-none placeholder:text-[#597367]/55"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputValue.trim() && !isTyping
                      ? 'text-white shadow-xs'
                      : 'bg-[#DCE5DB] text-white/60 cursor-not-allowed'
                  }`}
                  style={inputValue.trim() && !isTyping ? {
                    background: 'linear-gradient(135deg, #143628 0%, #2D6A4F 100%)',
                  } : {}}
                  aria-label="Kirim"
                >
                  <Send size={13} className="translate-x-[0.5px]" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1.5 px-1 text-[9px] text-[#597367]/75">
                <span className="flex items-center gap-1">
                  {hasKey
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Didukung Google Gemini AI</>
                    : <><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Mode Cerdas SARA Engine</>
                  }
                </span>
                <button
                  onClick={() => setShowSettings(true)}
                  className="hover:underline text-[#2D6A4F] font-semibold cursor-pointer"
                >
                  {hasKey ? 'Ubah API Key' : '⚡ Aktifkan AI Penuh'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
