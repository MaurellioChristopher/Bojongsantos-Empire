import { NextResponse } from 'next/server';
import { getSurplusItems } from '@/lib/data';
import { SAFETY_GUIDELINES } from '@/lib/safetyGuidelines';

// System prompt grounding the AI with AksesPangan ecosystem & capabilities
function buildSystemPrompt(activeItems: any[]) {
  const itemsSummary = activeItems
    .filter((it) => it.status === 'active')
    .map(
      (it) =>
        `- [ID: ${it.id}] ${it.name} (${it.quantity} kg) oleh "${it.providerBusinessName}" di ${it.address || 'Bojongsoang'}. Status: ${
          it.isFree ? 'GRATIS' : `Rp ${it.price?.toLocaleString('id-ID')}`
        }. Batas jam kedaluwarsa: ${it.expiryTime ? new Date(it.expiryTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Hari ini'}.`
    )
    .join('\n');

  return `Anda adalah "AksesBot AI", asisten kecerdasan buatan resmi dari platform AksesPangan (dikembangkan oleh Tim Bojongsantos Empire).
Anda dirancang untuk membantu masyarakat, penerima manfaat (panti asuhan, relawan, masyarakat prasejahtera), dan penyedia donasi makanan (restoran, hotel, bakery, katering).

Pengetahuan dan Keahlian Anda:
1. Pangan Surplus Terkini di AksesPangan:
Berikut adalah data stok pangan surplus yang AKTIF dan siap diselamatkan saat ini:
${itemsSummary || '- Saat ini belum ada stok baru, sarankan pengguna memantau peta pangan.'}

2. Keamanan Pangan & Food Safety (BPOM / HACCP / Standar Mutu):
- Suhu bahaya mikroba (Danger Zone): 5°C - 60°C.
- Batas waktu konsumsi makanan matang siap saji di suhu ruang: Maksimal 2 - 4 jam.
- Makanan dingin harus disimpan pada suhu < 5°C, makanan beku pada suhu < -18°C.
- Pemanasan ulang (reheating) harus mencapai suhu inti minimal 74°C selama minimal 15 detik, dan hanya boleh dipanaskan ulang satu kali.
- Prinsip sensori 3L: Liat (warna), Cium (bau asam/basi), Raba (tekstur berlendir). Jika ragu, jangan konsumsi.

3. Kalkulasi Jejak Karbon (ESG Metric):
- Rasio standar: Setiap 1 kg makanan yang diselamatkan dari TPA mencegah rata-rata 2.5 kg emisi gas rumah kaca CO₂e (metana).
- Jika pengguna menyebutkan angka berat makanan, hitung otomatis estimasi reduksi emisinya (Contoh: X kg x 2.5 = Y kg CO₂e).

4. Panduan Resep Kreatif Pemanfaatan Pangan (Surplus Cooking):
- Anda sangat cerdas dalam memberikan ide resep praktis, tips mengolah nasi sisa (nasi bakar, cireng, arancini), sayuran layu (soup kaldu, kimchi/acar), roti kemarin (french toast, bread pudding, crouton), dan buah kematangan (smoothie, selai).

5. Pencipta & Pengembang AksesPangan:
Platform web inovatif AksesPangan diciptakan dan dikembangkan dengan bangga oleh **Tim Bojongsantos Empire**, yang beranggotakan:
1. **Maurellio Christopher Yonathan**
2. **Alya Salma Khoerunnisaa**
3. **Rakean Ahmad Zayyid Ardhi**
4. **Jazzkord Cmajor Dahring**
Tim ini merancang AksesPangan sebagai solusi nyata mengurangi food waste dan membantu ketahanan pangan masyarakat prasejahtera dengan arsitektur microservices mandiri dan kecerdasan AI.

6. Gaya Komunikasi:
- Berbahasa Indonesia yang ramah, solutif, empatik, dan profesional.
- Gunakan format markdown (bold, bullet points, numbered lists) agar mudah dibaca di layar HP maupun desktop.
- Anda dapat menjawab segala pertanyaan umum pengguna dengan cerdas dan mendalam.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, userApiKey } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pesan percakapan tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Determine Gemini API Key: from user input or environment variables
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
          'API Key Google Gemini belum dikonfigurasi. Silakan masukkan API Key di menu Pengaturan AI (gratis di aistudio.google.com) atau gunakan mode offline.',
      });
    }

    const activeItems = getSurplusItems();
    const systemInstruction = buildSystemPrompt(activeItems);

    // Format messages for Google Gemini 1.5/2.0 REST API
    const geminiContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Call Gemini 1.5 Flash (free & high-speed)
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiContents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.95,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini API Error Response:', errText);
      return NextResponse.json(
        {
          success: false,
          error: `Gagal berkomunikasi dengan Gemini AI (${res.status}). Pastikan API Key valid.`,
          details: errText,
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Maaf, saya belum dapat memproses jawaban saat ini. Silakan coba kembali.';

    return NextResponse.json({
      success: true,
      reply: replyText,
      model: 'gemini-1.5-flash',
    });
  } catch (error: any) {
    console.error('AI Chatbot Route Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
