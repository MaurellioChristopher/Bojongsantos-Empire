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
} from 'lucide-react';
import { getSurplusItems } from '@/lib/data';
import { SAFETY_GUIDELINES } from '@/lib/safetyGuidelines';
import { formatPrice, getSurplusPhoto } from '@/lib/utils';
import type { SurplusItem, FoodCategory } from '@/types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  items?: SurplusItem[];
  actionLink?: { label: string; href: string };
  esgMetric?: { kg: number; co2: number };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: 'Halo! Saya **AksesBot AI** 🤖, asisten cerdas platform AksesPangan.\n\nSaya bisa membantu Anda mencari makanan surplus di sekitar, panduan mutu pangan BPOM & HACCP, atau kalkulasi reduksi emisi karbon ESG.',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  },
];

const QUICK_PROMPTS = [
  '🍲 Cari Makanan Gratis Terdekat',
  '📍 Cek Makanan di Bojongsoang & Bandung',
  '🌡️ Panduan Mutu & Cara Reheating',
  '🌱 Hitung Reduksi Emisi 10 kg Makanan',
  '🏪 Cara Mendaftar Jadi Mitra Donor',
];

export function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  // Intelligent Natural Language Understanding & Knowledge Engine
  const processQuery = (rawQuery: string): ChatMessage => {
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
          (i) => i.address.toLowerCase().includes('bojongsoang') || i.providerBusinessName.toLowerCase().includes('bojongsoang')
        );
      } else if (q.includes('bandung')) {
        matched = matched.filter(
          (i) => i.address.toLowerCase().includes('bandung') || i.providerBusinessName.toLowerCase().includes('bandung')
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
        text: `Saya menemukan **${topItems.length} makanan surplus** yang siap diselamatkan saat ini:${
          matched.length === 0 ? '\n*(Menampilkan rekomendasi stok aktif)*' : ''
        }`,
        timestamp: nowTime,
        items: topItems,
        actionLink: { label: 'Buka Katalog Lengkap di Peta →', href: '#/penerima' },
      };
    }

    // 2. Food Safety & BPOM/HACCP Guidelines
    if (
      q.includes('aman') ||
      q.includes('mutu') ||
      q.includes('panas') ||
      q.includes('reheat') ||
      q.includes('bpom') ||
      q.includes('haccp') ||
      q.includes('basi') ||
      q.includes('simpan')
    ) {
      let guideline = SAFETY_GUIDELINES.nasi;
      let catName = 'Nasi & Hidangan Matang';

      if (q.includes('roti') || q.includes('pastry')) {
        guideline = SAFETY_GUIDELINES.roti;
        catName = 'Roti & Pastry';
      } else if (q.includes('sayur')) {
        guideline = SAFETY_GUIDELINES.sayur;
        catName = 'Sayuran Segar';
      } else if (q.includes('buah')) {
        guideline = SAFETY_GUIDELINES.buah;
        catName = 'Buah-buahan';
      }

      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🛡️ **Panduan Mutu & Keselamatan (${catName}):**\n\n• **Batas Suhu Ruang:** Maks. ${guideline.maxSafeHours} jam setelah diambil.\n• **Batas Kulkas (<4°C):** Hingga ${guideline.maxRefrigeratedHours} jam.\n• **Tata Cara Pemanasan Ulang (Reheating):** ${guideline.reheatingInstructions}\n\n⚠️ **Larangan Penting:** Jangan panaskan ulang lebih dari 1 kali dan selalu periksa aroma serta tekstur sebelum disantap.`,
        timestamp: nowTime,
        actionLink: { label: 'Buka Standar Lengkap ESG & Mutu →', href: '#/admin' },
      };
    }

    // 3. ESG Carbon Footprint Calculator
    if (
      q.includes('emisi') ||
      q.includes('karbon') ||
      q.includes('co2') ||
      q.includes('hitung') ||
      q.includes('esg') ||
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
        actionLink: { label: 'Buka Dashboard ESG & Unduh Sertifikat →', href: '#/penyedia/esg' },
      };
    }

    // 4. Provider / Donor Onboarding Guidance
    if (q.includes('penyedia') || q.includes('daftar') || q.includes('mitra') || q.includes('restoran') || q.includes('donasi')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🏪 **Cara Menjadi Mitra Penyedia Donasi Pangan:**\n\n1. **Registrasi Akun:** Daftar di menu registrasi dan pilih peran **Mitra Usaha (Penyedia)**.\n2. **Unggah Makanan Surplus:** Masukkan nama makanan, porsi, batas kedaluwarsa, dan foto.\n3. **Verifikasi Pengambilan:** Penerima akan datang membawa **Kode PIN / QR Code** untuk serah terima.\n4. **Peroleh Sertifikat ESG:** Dapatkan rekapan tonase pangan terselamatkan untuk laporan audit CSR/ESG usaha Anda!`,
        timestamp: nowTime,
        actionLink: { label: 'Daftar Sebagai Mitra Sekarang →', href: '#/register' },
      };
    }

    // 5. General Platform / Team FAQ
    if (q.includes('siapa') || q.includes('tim') || q.includes('aksespangan') || q.includes('aplikasi') || q.includes('visi')) {
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
      text: `Saya mengerti pertanyaan Anda tentang *"${rawQuery}"*.\n\nAnda dapat menanyakan hal-hal seputar:\n• 🍲 **Pencarian makanan surplus** gratis atau subsidi terdekat.\n• 🌡️ **Panduan mutu pangan & reheating** standar BPOM/HACCP.\n• 🌱 **Kalkulasi reduksi emisi karbon (CO₂e)** dari makanan yang Anda selamatkan.\n• 📱 **Panduan penggunaan tiket dan kode PIN pickup**.`,
      timestamp: nowTime,
      actionLink: { label: 'Jelajahi Peta Pangan Sekarang →', href: '#/penerima' },
    };
  };

  const handleSend = (textToSend?: string) => {
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

    // Realistic AI Thinking & Typing delay (600ms)
    setTimeout(() => {
      const botReply = processQuery(text);
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 650);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* 1. Floating Launcher Button (Floating Above Mobile Nav & Desktop) */}
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
            {/* Live Green Pulsing Dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#22C55E] border-2 border-[#143628] animate-pulse" />
          </div>

          <div className="text-left pr-1 hidden sm:block">
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>AksesBot AI</span>
              <span className="text-[9px] bg-[#2D6A4F] text-[#86EFAC] px-1.5 py-0.2 rounded-full font-mono uppercase">
                Online
              </span>
            </div>
            <div className="text-[11px] text-white/70 font-normal leading-tight">Asisten Cerdas Pangan</div>
          </div>

          <Sparkles size={16} className="text-[#FBBF24] hidden sm:block" />
        </motion.button>
      </div>

      {/* 2. Floating AI Chat Dialog Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.94 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`fixed bottom-24 md:bottom-20 right-4 sm:right-6 z-50 bg-[#FFFFFF] rounded-[24px] border border-[#DCE5DB] shadow-2xl flex flex-col overflow-hidden text-[#143628] transition-all duration-300 ${
              isExpanded
                ? 'w-[95vw] sm:w-[580px] h-[82vh] max-w-2xl'
                : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh]'
            }`}
          >
            {/* Header Bar */}
            <div className="bg-[#143628] text-white p-4 flex items-center justify-between border-b border-[#2D6A4F]/60 select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#86EFAC] border border-[#86EFAC]/30 shadow-xs">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold leading-tight">AksesBot AI</h3>
                    <span className="text-[10px] font-mono bg-[#22C55E]/20 text-[#86EFAC] px-2 py-0.2 rounded-full font-semibold border border-[#22C55E]/30">
                      GPT Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-white/75 m-0 leading-tight">Konsultasi Pangan & ESG 24/7</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-white/80">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title={isExpanded ? 'Kecilkan' : 'Perbesar'}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={() => setMessages(INITIAL_MESSAGES)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                  title="Reset Percakapan"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white ml-1"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Chips Bar */}
            <div className="bg-[#F7F9F6] border-b border-[#DCE5DB] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap bg-white hover:bg-[#EDF2EC] text-[#143628] border border-[#DCE5DB] text-[11px] font-medium py-1 px-2.5 rounded-full transition-all shrink-0 hover:border-[#CAD6C8] shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Body & Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF7F2]/40">
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
                          // Simple bold parser
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

                      {/* Optional Food Cards Carousel */}
                      {msg.items && msg.items.length > 0 && (
                        <div className="mt-2.5 space-y-2">
                          {msg.items.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                window.location.hash = '#/penerima';
                                setIsOpen(false);
                              }}
                              className="p-2 bg-[#F7F9F6] hover:bg-[#EDF2EC] rounded-xl border border-[#DCE5DB] flex items-center gap-2.5 cursor-pointer transition-all hover:border-[#CAD6C8]"
                            >
                              <img
                                src={getSurplusPhoto(item)}
                                alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover border border-[#DCE5DB]"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs text-[#143628] truncate">{item.name}</div>
                                <div className="text-[10px] text-[#597367] truncate">
                                  {item.providerBusinessName} • {item.quantity} kg
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                    <span className="ml-1 text-[11px]">AksesBot sedang mengetik...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Bar */}
            <div className="p-3 bg-white border-t border-[#DCE5DB]">
              <div className="flex items-center gap-2 bg-[#F7F9F6] border border-[#DCE5DB] rounded-full px-3.5 py-1.5 focus-within:border-[#143628] transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pertanyaan atau cari makanan..."
                  className="flex-1 bg-transparent text-xs text-[#143628] placeholder:text-[#597367] focus:outline-none py-1"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-8 h-8 rounded-full bg-[#143628] hover:bg-[#1C4736] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-[#597367] mt-1.5 m-0">
                Didukung oleh AI Knowledge Engine & Telemetri AksesPangan
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
