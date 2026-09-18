'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Sparkles,
  RefreshCw,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Leaf,
  Clock,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  Settings,
  Key,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { getSurplusItems } from '@/lib/data';
import { SAFETY_GUIDELINES } from '@/lib/safetyGuidelines';
import { formatPrice, getSurplusPhoto } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { SurplusItem } from '@/types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  items?: SurplusItem[];
  actionLink?: { label: string; href: string };
  esgMetric?: { kg: number; co2: number };
  isLLM?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: 'Halo! Saya **AksesBot AI** 🤖, asisten cerdas platform AksesPangan.\n\nSaya bisa membantu Anda:\n• 🍲 **Mencari makanan surplus** di sekitar Bojongsoang & Bandung\n• 🌡️ **Pedoman keamanan pangan BPOM & HACCP**\n• 🌱 **Kalkulator reduksi emisi karbon (CO₂e)**\n• 🍳 **Resep kreatif olahan sisa pangan** (Powered by Gemini AI)\n\nAda yang bisa saya bantu hari ini?',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  },
];

const QUICK_PROMPTS = [
  '🍲 Cari Makanan Gratis Terdekat',
  '📍 Cek Makanan di Bojongsoang & Bandung',
  '🌡️ Panduan Mutu & Cara Reheating',
  '🌱 Hitung Reduksi Emisi 10 kg Makanan',
  '🍳 Ide Resep Olahan Nasi Sisa',
  '🏪 Cara Mendaftar Jadi Mitra Donor',
];

export function AIChatbotWidget() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Settings & Gemini API Key state
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);

  // Selected Food Item for Detail Modal
  const [selectedFoodItem, setSelectedFoodItem] = useState<SurplusItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API Key from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aksespangan_gemini_key') || '';
      if (stored) {
        setGeminiApiKey(stored);
        setTempApiKey(stored);
      }
    } catch (e) {
      console.warn('Cannot read localStorage key:', e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setGeminiApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('aksespangan_gemini_key', trimmed);
      } else {
        localStorage.removeItem('aksespangan_gemini_key');
      }
    } catch (e) {
      console.warn('Cannot save localStorage key:', e);
    }
    setShowSettings(false);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
  };

  // Fallback Offline Semantic Engine
  const processOfflineQuery = (rawQuery: string): ChatMessage => {
    const q = rawQuery.toLowerCase();
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const allItems = getSurplusItems().filter((i) => i.status === 'active');

    // 1. Food Search & Recommendations
    if (
      q.includes('cari') ||
      q.includes('makanan') ||
      q.includes('gratis') ||
      q.includes('bojongsoang') ||
      q.includes('bandung') ||
      q.includes('stok') ||
      q.includes('roti') ||
      q.includes('nasi') ||
      q.includes('sayur') ||
      q.includes('buah')
    ) {
      let matched = allItems;
      if (q.includes('gratis')) {
        matched = matched.filter((i) => i.isFree);
      }
      if (q.includes('bojongsoang')) {
        matched = matched.filter(
          (i) =>
            i.address?.toLowerCase().includes('bojongsoang') ||
            i.providerBusinessName?.toLowerCase().includes('bojongsoang')
        );
      } else if (q.includes('bandung')) {
        matched = matched.filter(
          (i) =>
            i.address?.toLowerCase().includes('bandung') ||
            i.providerBusinessName?.toLowerCase().includes('bandung')
        );
      }

      if (q.includes('roti')) {
        matched = matched.filter((i) => i.foodCategory === 'roti');
      } else if (q.includes('nasi')) {
        matched = matched.filter((i) => i.foodCategory === 'nasi');
      } else if (q.includes('sayur')) {
        matched = matched.filter((i) => i.foodCategory === 'sayur');
      }

      const topItems = (matched.length > 0 ? matched : allItems).slice(0, 3);

      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Saya menemukan **${topItems.length} makanan surplus** yang siap diselamatkan saat ini!\n\n👇 **Klik salah satu kartu makanan di bawah untuk melihat rincian lengkap & cara mengambil:**`,
        timestamp: nowTime,
        items: topItems,
        actionLink: { label: 'Buka Katalog Lengkap di Peta →', href: '#/penerima' },
      };
    }

    // 2. Food Safety & BPOM/HACCP Guidelines
    if (
      q.includes('suhu') ||
      q.includes('hangat') ||
      q.includes('reheat') ||
      q.includes('basi') ||
      q.includes('aman') ||
      q.includes('bpom') ||
      q.includes('haccp') ||
      q.includes('simpan') ||
      q.includes('mutu')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🛡️ **Standar Keamanan Pangan BPOM & HACCP:**\n\n• **Zona Bahaya (Danger Zone):** Suhu **5°C s/d 60°C** adalah rentang di mana bakteri berkembang biak paling cepat.\n• **Batas Waktu Konsumsi:** Makanan matang siap saji harus dikonsumsi dalam maksimal **2 - 4 jam** di suhu ruang.\n• **Pemanasan Ulang (Reheating):** Panaskan hingga suhu inti minimal **74°C** selama 15 detik. Hanya lakukan 1x pemanasan ulang.\n• **Uji Sensori 3L:** **Lihat** (tidak berubah warna/berjamur), **Cium** (tidak berbau asam/tengik), **Raba** (tidak berlendir).`,
        timestamp: nowTime,
        actionLink: { label: 'Baca Standar Mutu Lengkap →', href: '#/terms' },
      };
    }

    // 3. Carbon Emissions & ESG Metric
    if (
      q.includes('karbon') ||
      q.includes('emisi') ||
      q.includes('co2') ||
      q.includes('esg') ||
      q.includes('hitung') ||
      q.includes('jejak')
    ) {
      const matchNumber = q.match(/\d+/);
      const kg = matchNumber ? parseInt(matchNumber[0], 10) : 10;
      const co2 = Number((kg * 2.5).toFixed(1));

      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🌱 **Kalkulator Emisi Karbon (ESG):**\n\nSetiap **1 kg pangan terselamatkan** mencegah pelepasan rata-rata **2.5 kg gas rumah kaca (CO₂e)** ke atmosfer akibat pembusukan metana di TPA.\n\nJika Anda menyelamatkan **${kg} kg makanan**, Anda telah mereduksi:`,
        timestamp: nowTime,
        esgMetric: { kg, co2 },
        actionLink: { label: 'Buka Dashboard ESG & Unduh Sertifikat →', href: '#/dashboard' },
      };
    }

    // 4. Provider / Donor Onboarding Guidance
    if (
      q.includes('penyedia') ||
      q.includes('daftar') ||
      q.includes('mitra') ||
      q.includes('restoran') ||
      q.includes('donasi')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🏪 **Cara Menjadi Mitra Penyedia Donasi Pangan:**\n\n1. **Registrasi Akun:** Daftar di menu registrasi dan pilih peran **Mitra Usaha (Penyedia)**.\n2. **Unggah Makanan Surplus:** Masukkan nama makanan, porsi, batas kedaluwarsa, dan foto.\n3. **Verifikasi Pengambilan:** Penerima akan datang membawa **Kode PIN / QR Code** untuk serah terima.\n4. **Peroleh Sertifikat ESG:** Dapatkan rekapan tonase pangan terselamatkan untuk laporan audit CSR/ESG usaha Anda!`,
        timestamp: nowTime,
        actionLink: { label: 'Daftar Sebagai Mitra Sekarang →', href: '#/register' },
      };
    }

    // 5. General Platform / Team FAQ
    if (
      q.includes('siapa') ||
      q.includes('tim') ||
      q.includes('aksespangan') ||
      q.includes('aplikasi') ||
      q.includes('visi')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🌾 **Tentang AksesPangan:**\n\nAksesPangan dikembangkan oleh **Tim Bojongsantos Empire** sebagai ekosistem sirkular digital untuk memecahkan paradoks *Food Waste* dan *Food Insecurity* di Indonesia.\n\nSistem ini dirancang dengan **arsitektur 6 microservices mandiri terisolasi** dan mendukung tujuan pembangunan berkelanjutan (SDGs 2, 12, dan 13).`,
        timestamp: nowTime,
      };
    }

    // Default Fallback Response
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `Saya mengerti pertanyaan Anda tentang *"${rawQuery}"*.\n\n💡 **Tips:** Untuk membuat saya bisa menjawab **semua pertanyaan bebas** (seperti resep masakan, tips dapur, sains pangan, dll), Anda dapat memasukkan **Google Gemini API Key** melalui tombol ⚙️ di pojok kanan atas obrolan ini (Gratis & aktif dalam 1 menit)!\n\nSaat ini Anda juga bisa menanyakan:\n• 🍲 Pencarian makanan surplus aktif di sekitar\n• 🌡️ Pedoman mutu pangan & reheating BPOM\n• 🌱 Hitung reduksi emisi karbon (ESG)`,
      timestamp: nowTime,
      actionLink: { label: 'Jelajahi Peta Pangan Sekarang →', href: '#/penerima' },
    };
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Prepare message history for LLM
    const chatHistory = [...messages, userMsg].map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text,
    }));

    try {
      // 1. Attempt to call Next.js AI API (/api/ai-chat)
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          userApiKey: geminiApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.reply) {
        // Successful response from Gemini AI!
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: nowTime,
          isLLM: true,
        };

        // If query asks for food items, also attach surplus cards
        const q = text.toLowerCase();
        if (
          q.includes('makanan') ||
          q.includes('cari') ||
          q.includes('gratis') ||
          q.includes('stok') ||
          q.includes('bojongsoang')
        ) {
          const items = getSurplusItems().filter((i) => i.status === 'active').slice(0, 3);
          botReply.items = items;
        }

        setMessages((prev) => [...prev, botReply]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('API AI Chat fallback to local semantic engine:', err);
    }

    // 2. Fallback to offline semantic intelligence engine
    setTimeout(() => {
      const botReply = processOfflineQuery(text);
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // When clicking a food card, open interactive detail modal
  const handleCardClick = (item: SurplusItem) => {
    setSelectedFoodItem(item);
  };

  const handleClaimFood = (item: SurplusItem) => {
    setSelectedFoodItem(null);
    setIsOpen(false);
    if (!isAuthenticated) {
      window.location.hash = '#/login';
    } else {
      window.location.hash = '#/penerima';
    }
  };

  return (
    <>
      {/* 1. Floating Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-5 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] py-3 px-4 rounded-full shadow-2xl border border-[#2D6A4F]/60 transition-all cursor-pointer select-none"
          aria-label="Buka Asisten AI AksesBot"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm shadow-inner">
              <Bot size={18} className="text-[#86EFAC]" />
            </div>
            {/* Online Green Pulsing Beacon */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E] border-2 border-[#143628]" />
            </span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight flex items-center gap-1">
              <span>AksesBot AI</span>
              <Sparkles size={11} className="text-[#FBBF24]" />
            </div>
            <div className="text-[10px] text-white/70 leading-tight">
              {geminiApiKey ? 'Gemini Live AI' : 'Asisten Pangan & ESG'}
            </div>
          </div>
        </motion.button>
      </div>

      {/* 2. Floating AI Chat Modal Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-[#DCE5DB] flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-3 md:inset-8 w-auto h-auto max-w-4xl max-h-[85vh] m-auto'
                : 'bottom-20 md:bottom-20 right-3 sm:right-6 w-[94vw] sm:w-[410px] h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-[#143628] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#86EFAC]">
                    <Bot size={18} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-2 border-[#143628] rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold leading-tight">AksesBot AI</h3>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-semibold border ${
                        geminiApiKey
                          ? 'bg-[#22C55E]/20 text-[#86EFAC] border-[#22C55E]/40'
                          : 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                      }`}
                    >
                      {geminiApiKey ? 'Gemini 1.5' : 'Smart Engine'}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/75 m-0 leading-tight">
                    {geminiApiKey ? 'Model LLM Aktif (Semua Pertanyaan)' : 'Konsultasi Pangan & ESG 24/7'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80">
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showSettings ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'
                  }`}
                  title="Pengaturan AI API Key"
                >
                  <Settings size={15} />
                </button>

                {/* Resize Button */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title={isExpanded ? 'Kecilkan' : 'Perbesar'}
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                {/* Reset Button */}
                <button
                  onClick={() => setMessages(INITIAL_MESSAGES)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Reset Percakapan"
                >
                  <RefreshCw size={14} />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white ml-0.5"
                  title="Tutup"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Key Saved Toast Banner */}
            {keySavedToast && (
              <div className="bg-[#2E7D32] text-white text-[11px] px-3 py-1.5 flex items-center justify-between font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Pengaturan API Key Google Gemini berhasil disimpan!</span>
                </div>
                <button onClick={() => setKeySavedToast(false)}>
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Settings Dialog Overlay */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#EDF2EC] border-b border-[#CAD6C8] p-3.5 text-xs text-[#143628] shrink-0"
                >
                  <div className="flex items-center justify-between font-bold mb-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Key size={14} className="text-[#2D6A4F]" />
                      <span>Konfigurasi Google Gemini AI API</span>
                    </div>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-[#597367] hover:text-[#143628]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#597367] mb-2 leading-relaxed">
                    Masukkan <strong>Gemini API Key</strong> agar AksesBot AI memiliki kecerdasan penuh untuk menjawab segala pertanyaan (resep, sains, tips, gizi, dll).
                  </p>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Tempel AI Studio API Key (AIzaSy...)"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#CAD6C8] rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-[#2D6A4F]"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#2D6A4F] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Dapatkan Key Gratis di Google AI Studio</span>
                        <ExternalLink size={10} />
                      </a>
                      <div className="flex gap-1.5">
                        <button
                          onClick={handleSaveApiKey}
                          className="bg-[#2D6A4F] hover:bg-[#1C4736] text-white px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer active:scale-95"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Suggestions Bar - Clean touch scroll without visible gray scrollbar */}
            <div
              className="bg-[#F7F9F6] border-b border-[#DCE5DB] px-3 py-2 flex items-center gap-1.5 overflow-x-auto select-none"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap bg-white hover:bg-[#EDF2EC] active:scale-95 text-[#143628] border border-[#DCE5DB] text-[11px] font-medium py-1 px-2.5 rounded-full transition-all shrink-0 hover:border-[#CAD6C8] shadow-2xs cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Body & Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7F2]/40 relative">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 rounded-full bg-[#143628] text-[#86EFAC] flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                        <Bot size={15} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-[18px] p-3.5 text-xs leading-relaxed shadow-2xs ${
                        isBot
                          ? 'bg-white text-[#143628] border border-[#DCE5DB]'
                          : 'bg-[#143628] text-white rounded-tr-xs'
                      }`}
                    >
                      {/* Message Content with Markdown rendering */}
                      <div className="whitespace-pre-line">
                        {msg.text.split('\n').map((line, lIdx) => {
                          const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          return (
                            <span
                              key={lIdx}
                              dangerouslySetInnerHTML={{ __html: formattedLine }}
                              className="block"
                            />
                          );
                        })}
                      </div>

                      {/* Optional Rich Metric Box (ESG) */}
                      {msg.esgMetric && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#EBF7EE] border border-[#C8E6C9] text-[#143628] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Leaf size={16} className="text-[#2E7D32]" />
                            <span className="font-semibold text-xs">{msg.esgMetric.kg} kg Makanan</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-[#597367]">Mereduksi Emisi</span>
                            <div className="font-mono font-bold text-sm text-[#2E7D32]">
                              -{msg.esgMetric.co2} kg CO₂e
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Food Cards Carousel */}
                      {msg.items && msg.items.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-[11px] font-bold text-[#2D6A4F] flex items-center gap-1">
                            <ShoppingBag size={13} />
                            <span>Pilih Makanan untuk Rincian:</span>
                          </div>
                          {msg.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleCardClick(item)}
                              role="button"
                              tabIndex={0}
                              className="p-2.5 bg-[#F7F9F6] hover:bg-[#EDF2EC] active:scale-[0.98] rounded-xl border border-[#DCE5DB] flex items-center gap-2.5 cursor-pointer transition-all hover:border-[#2D6A4F] hover:shadow-xs group"
                            >
                              <img
                                src={getSurplusPhoto(item)}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover border border-[#DCE5DB] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs text-[#143628] group-hover:text-[#2D6A4F] transition-colors truncate">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-[#597367] truncate">
                                  {item.providerBusinessName} • {item.quantity} kg
                                </div>
                                <div className="text-[10px] text-[#2D6A4F] font-medium flex items-center gap-1 mt-0.5">
                                  <span>Lihat Info & Ambil</span>
                                  <ArrowRight size={10} />
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  item.isFree ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-800'
                                }`}
                              >
                                {item.isFree ? 'Gratis' : formatPrice(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Optional Action Button Link */}
                      {msg.actionLink && (
                        <a
                          href={msg.actionLink.href}
                          onClick={() => setIsOpen(false)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D6A4F] hover:underline"
                        >
                          <span>{msg.actionLink.label}</span>
                          <ExternalLink size={12} />
                        </a>
                      )}

                      <div
                        className={`text-[9px] mt-1.5 text-right ${
                          isBot ? 'text-[#597367]' : 'text-white/60'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Animation Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#143628] text-[#86EFAC] flex items-center justify-center shrink-0 text-xs">
                    <Bot size={15} />
                  </div>
                  <div className="bg-white border border-[#DCE5DB] rounded-[16px] px-3.5 py-2 text-xs flex items-center gap-1 text-[#597367] shadow-2xs">
                    <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#2D6A4F] rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] ml-1.5 text-[#597367]">AksesBot sedang berpikir...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 3. Interactive Food Item Modal Detail Overlay */}
            <AnimatePresence>
              {selectedFoodItem && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 15 }}
                    className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#DCE5DB] flex flex-col max-h-[90%]"
                  >
                    {/* Header Image */}
                    <div className="relative h-36 bg-stone-100">
                      <img
                        src={getSurplusPhoto(selectedFoodItem)}
                        alt={selectedFoodItem.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setSelectedFoodItem(null)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                      <div className="absolute bottom-2 left-2 flex gap-1.5">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${
                            selectedFoodItem.isFree
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-[#143628]'
                          }`}
                        >
                          {selectedFoodItem.isFree ? '100% GRATIS' : formatPrice(selectedFoodItem.price)}
                        </span>
                        <span className="text-xs bg-black/70 text-white px-2.5 py-1 rounded-full backdrop-blur-xs font-semibold">
                          Tersedia {selectedFoodItem.quantity} kg
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 overflow-y-auto space-y-3">
                      <div>
                        <h4 className="font-bold text-sm text-[#143628] leading-snug">
                          {selectedFoodItem.name}
                        </h4>
                        <p className="text-xs text-[#597367] mt-0.5">
                          {selectedFoodItem.description || 'Pangan surplus layak konsumsi kualitas prima.'}
                        </p>
                      </div>

                      <div className="bg-[#F7F9F6] p-2.5 rounded-xl border border-[#DCE5DB] text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-[#143628]">
                          <MapPin size={13} className="text-[#2D6A4F] shrink-0" />
                          <span className="font-semibold truncate">
                            {selectedFoodItem.providerBusinessName}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#597367] pl-5">
                          {selectedFoodItem.address}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#597367] pt-1">
                          <Clock size={13} className="text-[#2D6A4F] shrink-0" />
                          <span>
                            Ambil: {selectedFoodItem.expiryTime ? 'Sebelum ' + new Date(selectedFoodItem.expiryTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : 'Hari ini (17:00 - 21:00 WIB)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900">
                        <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                        <span>Telah terverifikasi uji organoleptik & standar keamanan pangan BPOM.</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          onClick={() => handleClaimFood(selectedFoodItem)}
                          className="w-full py-2.5 bg-[#2D6A4F] hover:bg-[#1C4736] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                        >
                          <ShoppingBag size={14} />
                          <span>
                            {!isAuthenticated
                              ? 'Masuk untuk Klaim Makanan Ini'
                              : 'Ambil / Pesan Makanan Ini Sekarang'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedFoodItem(null);
                            setIsOpen(false);
                            window.location.hash = '#/penerima';
                          }}
                          className="w-full py-2 bg-white hover:bg-stone-50 border border-[#DCE5DB] text-[#143628] rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MapPin size={13} />
                          <span>Lihat Titik Lokasi di Peta</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#DCE5DB] shrink-0">
              <div className="flex items-center gap-2 bg-[#F7F9F6] border border-[#DCE5DB] focus-within:border-[#2D6A4F] focus-within:bg-white rounded-full px-3.5 py-1.5 transition-all shadow-2xs">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    geminiApiKey
                      ? 'Tanya apa saja (resep, pangan, emisi, umum)...'
                      : 'Ketik pertanyaan atau cari makanan...'
                  }
                  className="flex-1 bg-transparent text-xs text-[#143628] focus:outline-hidden placeholder:text-[#597367]/60"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputValue.trim() && !isTyping
                      ? 'bg-[#2D6A4F] hover:bg-[#1C4736] text-white shadow-xs'
                      : 'bg-[#DCE5DB] text-white/70 cursor-not-allowed'
                  }`}
                  aria-label="Kirim Pesan"
                >
                  <Send size={13} className="translate-x-[0.5px]" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1.5 px-2 text-[9px] text-[#597367]/80">
                <span>
                  {geminiApiKey ? '🟢 Didukung oleh Google Gemini Live AI' : '🟡 Mode Cerdas AksesPangan Engine'}
                </span>
                <button
                  onClick={() => setShowSettings(true)}
                  className="hover:underline text-[#2D6A4F] font-semibold cursor-pointer"
                >
                  {geminiApiKey ? 'Ubah API' : '⚡ Bikin Lebih Pintar (+API)'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
