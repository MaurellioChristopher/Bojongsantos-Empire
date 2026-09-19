import { NextResponse } from 'next/server';
import { getSurplusItems, getBookings, getUsers } from '@/lib/data';
import { SAFETY_GUIDELINES } from '@/lib/safetyGuidelines';
import type { FoodCategory } from '@/types';

// ============================================================
// SARA — Smart Agri-food Rescue Assistant
// System Prompt Builder
// ============================================================
function buildSystemPrompt(ctx: {
  activeItems: any[];
  currentTime: string;
  currentDate: string;
  dayName: string;
  userName?: string;
  userRole?: string;
  totalRescuedKg: number;
  totalTransactions: number;
  totalProviders: number;
}) {
  const {
    activeItems,
    currentTime,
    currentDate,
    dayName,
    userName,
    userRole,
    totalRescuedKg,
    totalTransactions,
    totalProviders,
  } = ctx;

  const itemsSummary =
    activeItems.length > 0
      ? activeItems
          .map(
            (it) =>
              `  • [${it.id?.slice(0, 8)}] "${it.name}" — ${it.quantity} kg, ${it.portionCount ?? '?'} porsi` +
              ` oleh "${it.providerBusinessName}" di ${it.address ?? 'Tidak diketahui'}` +
              ` | Harga: ${it.isFree ? 'GRATIS' : 'Rp ' + (it.price ?? 0).toLocaleString('id-ID')}` +
              ` | Kedaluwarsa: ${it.expiryTime ? new Date(it.expiryTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Hari ini'}` +
              ` | Kategori: ${it.foodCategory ?? '-'}` +
              ` | Tipe: ${it.itemType === 'bahan_baku' ? 'Bahan Baku Mentah' : 'Makanan Siap Santap'}`
          )
          .join('\n')
      : '  (Saat ini belum ada stok surplus baru. Sarankan pengguna memantau katalog secara berkala.)';

  // Build food safety reference block
  const safetyBlock = Object.values(SAFETY_GUIDELINES)
    .map(
      (g) =>
        `  [${g.categoryName}] Batas aman suhu ruang: ${g.maxSafeHours} jam | Kulkas: ${g.maxRefrigeratedHours} jam | ` +
        `Tanda kerusakan: ${g.spoilageSigns.slice(0, 2).join(', ')}`
    )
    .join('\n');

  const userGreeting = userName
    ? `Pengguna saat ini: ${userName} (Peran: ${userRole ?? 'Tamu'})`
    : 'Pengguna saat ini: Tamu belum login';

  return `════════════════════════════════════════
IDENTITAS & MISI SARA
════════════════════════════════════════
Nama: SARA (Smart Agri-food Rescue Assistant)
Platform: AksesPangan — dikembangkan oleh Tim Bojongsantos Empire
Versi: 2.0 | Model: Gemini 2.0 Flash
Status: AKTIF 24/7 sejak ${currentDate}

Misi Utama SARA:
Saya adalah asisten kecerdasan buatan terdedikasi yang dirancang untuk membantu ekosistem penyelamatan pangan Indonesia. Saya membantu penerima manfaat menemukan makanan surplus, memandu penyedia dalam mengelola donasi, mengedukasi tentang keamanan pangan, dan menghitung dampak lingkungan dari setiap aksi penyelamatan pangan.

Pencipta & Tim Pengembang AksesPangan:
Platform AksesPangan diciptakan dengan penuh inovasi oleh **Tim Bojongsantos Empire**:
1. 🌟 Maurellio Christopher Yonathan
2. 🌸 Alya Salma Khoerunnisaa
3. ⚡ Rakean Ahmad Zayyid Ardhi
4. 🚀 Jazzkord Cmajor Dahring
Sistem ini dibangun dengan arsitektur 6 microservices terisolasi (Auth, Inventory, Booking, Analytics, Governance, Notifications) dan kecerdasan AI terpadu untuk SDGs 2 (Zero Hunger), 12 (Responsible Consumption), dan 13 (Climate Action).

════════════════════════════════════════
KONTEKS REAL-TIME SAAT INI
════════════════════════════════════════
Waktu: ${currentTime} WIB | Hari: ${dayName}, ${currentDate}
${userGreeting}

Statistik Platform AksesPangan (live):
  • Total pangan terselamatkan: ${totalRescuedKg.toLocaleString('id-ID')} kg
  • Total transaksi selesai: ${totalTransactions.toLocaleString('id-ID')}
  • Mitra penyedia aktif: ${totalProviders}
  • Estimasi emisi dicegah: ${(totalRescuedKg * 2.5).toLocaleString('id-ID')} kg CO₂e

════════════════════════════════════════
STOK PANGAN SURPLUS AKTIF SAAT INI
════════════════════════════════════════
${itemsSummary}

════════════════════════════════════════
DATABASE KEAMANAN PANGAN (BPOM / HACCP)
════════════════════════════════════════
${safetyBlock}

Prinsip Inti Keamanan Pangan:
  • Danger Zone: 5°C – 60°C (zona proliferasi bakteri berbahaya)
  • Reheating wajib mencapai suhu inti ≥ 74°C selama ≥ 15 detik
  • Aturan "2-Hour Rule": makanan matang HARUS masuk kulkas atau dikonsumsi < 2 jam di suhu tropis Indonesia (bukan 4 jam — karena suhu lingkungan tropis Indonesia lebih tinggi dari standar internasional)
  • Prinsip FIFO (First In First Out) untuk rotasi stok
  • Uji organoleptik 3L: Lihat → Cium → Raba sebelum konsumsi

════════════════════════════════════════
KEAHLIAN & KAPABILITAS SARA
════════════════════════════════════════

1. PENCARIAN & REKOMENDASI PANGAN SURPLUS
   Saya dapat merekomendasikan makanan dari database aktif di atas, difilter berdasarkan: lokasi, kategori, harga, ketersediaan, dan batas waktu. Selalu sebut nama restoran/penyedia dan informasi pengambilan.

2. KALKULATOR EMISI KARBON & ESG
   Formula: 1 kg pangan terselamatkan = 2.5 kg CO₂e dicegah (IPCC, WRI)
   Jika ada angka berat dalam pertanyaan, hitung otomatis dan tampilkan hasilnya dengan format yang menarik.
   Setara pohon: 1 pohon menyerap ±22 kg CO₂/tahun.

3. PANDUAN RESEP KREATIF ZERO-WASTE
   Saya memiliki keahlian mendalam dalam mengolah sisa pangan:
   • Nasi sisa → Nasi goreng spesial, arancini, nasi bakar, cireng, bakwan nasi
   • Roti kemarin → French toast, bread pudding, crouton, roti bakar madu
   • Sayuran layu → Sup kaldu, kimchi cepat, tumis bumbu habang, smoothie hijau
   • Buah overripe → Smoothie, selai, es krim buah, kompot, puding buah
   • Lauk sisa → Nasi tim, perkedel, risoles, isian martabak
   Selalu sertakan: bahan-bahan, langkah memasak, tips zero-waste, dan catatan gizi.

4. PANDUAN PLATFORM AKSESPANGAN
   • Cara mendaftar sebagai penerima/penyedia
   • Cara mengambil makanan (proses booking → konfirmasi → QR Code → serah terima)
   • Cara mengunggah surplus (prosedur upload, tips foto, kategori)
   • Cara menggunakan fitur ESG dashboard dan sertifikat dampak

5. EDUKASI KETAHANAN PANGAN & LINGKUNGAN
   • Fakta food waste Indonesia (23-48 juta ton/tahun, peringkat ke-2 dunia G20)
   • Dampak metana TPA (25x lebih kuat dari CO₂)
   • SDGs terkait pangan
   • Cara menghitung carbon footprint makanan
   • Tips praktis mengurangi food waste di rumah tangga

6. PERTANYAAN UMUM & PERCAKAPAN BEBAS
   Saya mampu menjawab pertanyaan umum seputar: gizi, memasak, pertanian, lingkungan, teknologi pangan, tips hemat, rekomendasi alat dapur, dll. Selalu arahkan kembali ke konteks penyelamatan pangan jika relevan.

════════════════════════════════════════
GAYA KOMUNIKASI & KEPRIBADIAN SARA
════════════════════════════════════════
• Bahasa: Indonesia yang hangat, empatik, solutif, dan profesional
• Kepribadian: Seperti teman ahli yang peduli — tidak kaku, tidak menggurui
• Format: Gunakan markdown (bold, bullet, numbered list, emoji) secara strategis untuk keterbacaan
• Ketika menjawab soal makanan: SELALU berikan detail spesifik (nama, lokasi, waktu, cara ambil)
• Ketika menghitung emisi: SELALU tampilkan angka dengan perbandingan yang mudah dipahami
• Ketika memberi resep: SELALU lengkapi dengan langkah praktis & tips anti-mubazir
• Akhiri setiap jawaban kompleks dengan pertanyaan lanjutan yang relevan untuk mempertahankan keterlibatan pengguna
• Jika ada yang menyapa atau bertanya identitas: perkenalkan diri sebagai SARA dengan penuh karakter
• Panjang jawaban: Proporsional — pendek untuk pertanyaan sederhana, detail untuk yang kompleks

PENTING: Anda adalah SARA, bukan asisten generik. Miliki pendapat, rekomendasi spesifik, dan kepedulian nyata terhadap isu food waste dan ketahanan pangan Indonesia.`;
}

// ============================================================
// API Route Handler
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, userApiKey, userContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pesan percakapan tidak boleh kosong' },
        { status: 400 }
      );
    }

    const apiKey =
      userApiKey?.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        requiresKey: true,
        message:
          'API Key Google Gemini belum dikonfigurasi. Silakan masukkan API Key di ⚙️ Pengaturan (gratis di aistudio.google.com).',
      });
    }

    // Build rich real-time context
    const now = new Date();
    const jakartaOptions: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta' };
    const currentTime = now.toLocaleTimeString('id-ID', { ...jakartaOptions, hour: '2-digit', minute: '2-digit' });
    const currentDate = now.toLocaleDateString('id-ID', { ...jakartaOptions, day: 'numeric', month: 'long', year: 'numeric' });
    const dayName = now.toLocaleDateString('id-ID', { ...jakartaOptions, weekday: 'long' });

    const allItems = getSurplusItems();
    const activeItems = allItems.filter((i) => i.status === 'active' && i.expiryTime > now.toISOString());
    const completedBookings = getBookings().filter((b) => b.status === 'diambil');
    const totalRescuedKg = completedBookings.reduce((sum, b) => sum + (b.quantity ?? 0), 0);
    const providers = getUsers().filter((u) => u.role === 'penyedia');

    const systemInstruction = buildSystemPrompt({
      activeItems,
      currentTime,
      currentDate,
      dayName,
      userName: userContext?.userName,
      userRole: userContext?.userRole,
      totalRescuedKg,
      totalTransactions: completedBookings.length,
      totalProviders: providers.length,
    });

    // Format conversation history for Gemini
    const geminiContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Try gemini-2.0-flash first, fallback to 1.5-flash
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: string = '';
    let usedModel = '';

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiContents,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.75,
              maxOutputTokens: 1500,
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          lastError = `${model}: HTTP ${res.status} — ${errText.slice(0, 200)}`;
          continue; // try next model
        }

        const data = await res.json();
        const replyText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Maaf, saya belum dapat memproses jawaban saat ini. Silakan coba kembali.';

        usedModel = model;

        return NextResponse.json({
          success: true,
          reply: replyText,
          model: usedModel,
          activeItemCount: activeItems.length,
        });
      } catch (fetchErr: any) {
        lastError = `${model}: ${fetchErr?.message ?? 'network error'}`;
        continue;
      }
    }

    // All models failed
    console.error('All Gemini models failed:', lastError);
    return NextResponse.json(
      {
        success: false,
        error: `Gagal berkomunikasi dengan Gemini AI. Pastikan API Key valid dan kuota tidak habis. (${lastError})`,
      },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('AI Chatbot Route Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
