'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  MapPin,
  Shield,
  Leaf,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShoppingBag,
  Activity,
  Flame,
  CheckCircle2,
  Play,
  Pause,
  ChevronDown,
  Heart,
  Users,
  Building2,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { getActiveSurplus, calculateImpact } from '@/lib/data';
import { formatCountdown, formatPrice } from '@/lib/utils';
import type { SurplusItem, ImpactData } from '@/types';

// ============================================================
// Animated Number Counter Component (Smooth Easing)
// ============================================================
function AnimatedCounter({
  value,
  duration = 1.8,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out expo for natural luxury deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easeProgress * value;
      setDisplayValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {decimals > 0 ? displayValue.toFixed(decimals) : displayValue.toLocaleString('id-ID')}
    </span>
  );
}

// Educational Facts for "Tahukah Kamu?" Section
const educationalFacts = [
  {
    id: 1,
    highlight: 'Negara Pembuang Pangan Terbesar ke-2',
    fact: 'Indonesia merupakan negara pembuang sampah makanan terbesar kedua di antara negara G20! Sebanyak 23 hingga 48 juta ton pangan terbuang sia-sia setiap tahunnya.',
    source: 'Kajian Bappenas & Food Loss & Waste Indonesia',
  },
  {
    id: 2,
    highlight: 'Gas Metana Pemicu Krisis Iklim',
    fact: 'Sampah makanan yang berakhir dan membusuk di TPA menghasilkan gas metana (CH₄) yang memiliki potensi pemanasan global 25 kali lipat lebih agresif daripada karbon dioksida!',
    source: 'Kementerian Lingkungan Hidup & Kehutanan',
  },
  {
    id: 3,
    highlight: 'Memberi Makan 50% Populasi',
    fact: 'Jika diselamatkan secara terstruktur, susut dan sisa pangan berkualitas di Indonesia sanggup mencukupi kebutuhan gizi hingga 28 juta warga pra-sejahtera dan mengentaskan kelaparan.',
    source: 'World Resources Institute (WRI)',
  },
  {
    id: 4,
    highlight: '1 kg Pangan = 2.5 kg CO₂e Dicegah',
    fact: 'Setiap kilogram hidangan yang berhasil disalurkan ke masyarakat sebelum rusak langsung memangkas 2.5 kg emisi gas rumah kaca yang membebani atmosfer bumi.',
    source: 'Intergovernmental Panel on Climate Change (IPCC)',
  },
];

// Media & Partners for Infinite Marquee Ticker
const mediaCoverage = [
  { name: 'BBC Indonesia', type: 'Media' },
  { name: 'Metro TV', type: 'Televisi' },
  { name: 'Kompas', type: 'Media Nasional' },
  { name: 'Jawa Pos', type: 'Surat Kabar' },
  { name: 'Liputan 6', type: 'Media' },
  { name: 'The Jakarta Post', type: 'Media' },
  { name: 'IDN Times', type: 'Media Digital' },
  { name: 'Trans 7', type: 'Televisi' },
  { name: 'Detikcom', type: 'Portal Berita' },
  { name: 'Kumparan', type: 'Media Digital' },
];

const ecosystemPartners = [
  { name: 'Hotel Shangri-La', type: 'Mitra Hotel' },
  { name: 'Artotel Suites', type: 'Hospitality' },
  { name: 'Aloft Hotel', type: 'Mitra Dapur' },
  { name: 'Super Indo', type: 'Retail Segar' },
  { name: 'Lemonilo', type: 'Healthy Food' },
  { name: 'Badan Pangan Nasional', type: 'Instansi' },
  { name: 'Bappenas', type: 'Regulator' },
  { name: 'Koalisi Sistem Pangan', type: 'NGO' },
];

export function LandingPage() {
  const [activeItems, setActiveItems] = useState<SurplusItem[]>([]);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fact Card Carousel State
  const [activeFactIndex, setActiveFactIndex] = useState(0);

  useEffect(() => {
    setActiveItems(getActiveSurplus());
    setImpact(calculateImpact());
  }, []);

  const nextFact = () => {
    setActiveFactIndex((prev) => (prev + 1) % educationalFacts.length);
  };

  const prevFact = () => {
    setActiveFactIndex((prev) => (prev - 1 + educationalFacts.length) % educationalFacts.length);
  };

  const categories = [
    { id: 'all', label: 'SEMUA SURPLUS' },
    { id: 'nasi', label: 'KULINER UTAMA' },
    { id: 'roti', label: 'PATISSERIE & ROTI' },
    { id: 'sayur', label: 'HASIL BUMI SEGAR' },
    { id: 'minuman', label: 'BOTANICAL DRINKS' },
  ];

  const getCategoryPhoto = (category: string) => {
    switch (category) {
      case 'roti':
        return '/images/surplus-bakery.jpg';
      case 'sayur':
        return '/images/surplus-produce.jpg';
      case 'minuman':
        return '/images/surplus-beverage.jpg';
      case 'nasi':
      default:
        return '/images/surplus-gourmet.jpg';
    }
  };

  const filteredItems =
    selectedCategory === 'all'
      ? activeItems
      : activeItems.filter((i) => i.foodCategory === selectedCategory);

  return (
    <div className="w-full bg-white overflow-hidden selection:bg-[#062312] selection:text-[#f7ce3e]">
      {/* ============================================================
          SECTION 1: SIGNATURE HERO WITH CIRCULAR PORTAL (Garda Pangan Style)
          Huge Typography: ONE STOP F[O]OD RESCUE & SURPLUS SOLUTION
          Inside the 'O' is a living circular video / image portal!
          ============================================================ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center text-center px-4 sm:px-8 py-24 bg-[#051a0d] overflow-hidden">
        {/* Ambient Backdrop Video/Image with Organic Forest Vignette */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/hero-food-kitchen.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#051a0d]/90 via-[#051a0d]/70 to-[#051a0d]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#051a0d_80%)]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          {/* Subtle Live Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#f7ce3e] mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>JARINGAN PENYELAMAT MAKANAN INDONESIA</span>
          </motion.div>

          {/* Huge Hero Typography with Circular Portal in 'FOOD' */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[clamp(2.5rem,7vw,5.5rem)] font-bold uppercase leading-[0.96] tracking-[-0.03em] text-white text-center mb-6 drop-shadow-sm"
          >
            <span className="block text-white">ONE STOP</span>
            <span className="relative block text-[#f7ce3e]">
              F
              {/* Circular Interactive Portal inside the 'O' */}
              <motion.span
                whileHover={{ scale: 1.12 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                className="relative mx-[0.03em] inline-block size-[0.8em] -translate-y-[0.08em] overflow-hidden rounded-full border-[3px] sm:border-4 border-[#f7ce3e] bg-black align-middle shadow-[0_0_35px_rgba(247,206,62,0.45)] cursor-pointer group"
                title="AksesPangan Live Food Rescue Kitchen"
              >
                <img
                  src="/images/hero-food-delivery.jpg"
                  alt="Live Food Rescue Portal"
                  className="h-full w-full object-cover group-hover:scale-125 transition-transform duration-700"
                />
                <span className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </motion.span>
              OD RESCUE
            </span>
            <span className="block text-white">
              &amp; SURPLUS <span className="text-[#f7ce3e]">SOLUTION</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-[16px] sm:text-[18px] text-white/80 leading-relaxed font-normal mb-10 text-center"
          >
            Menghubungkan surplus makanan berkualitas dari hotel, restoran, bakery, dan pelaku kuliner
            langsung kepada masyarakat dan komunitas sebelum terbuang sia-sia ke TPA.
          </motion.p>

          {/* Dual Action Buttons (Garda Pangan Signature Style) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            <motion.a
              href="#/penerima"
              className="btn-garda-pill-gold group"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span>AMBIL SURPLUS SEKARANG</span>
              <span className="w-8 h-8 rounded-full bg-[#062312] text-[#f7ce3e] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={15} />
              </span>
            </motion.a>

            <motion.a
              href="#/penyedia"
              className="btn-garda-pill group"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-white">DAFTAR SEBAGAI MITRA</span>
              <span className="w-8 h-8 rounded-full bg-[#f7ce3e] text-[#062312] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={15} />
              </span>
            </motion.a>
          </motion.div>
        </div>

        {/* Scroll Down Chevron Button */}
        <motion.a
          href="#tahukah-kamu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 z-10 flex items-center justify-center w-11 h-11 rounded-full border border-white/20 bg-white/5 text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          aria-label="Scroll ke konten selanjutnya"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.a>
      </section>

      {/* ============================================================
          SECTION 2: "TAHUKAH KAMU?" INTERACTIVE SEQUENCE (Garda Pangan Core)
          Educational facts carousel + Real-time animated counters
          ============================================================ */}
      <section id="tahukah-kamu" className="w-full py-20 px-4 sm:px-8 bg-[#092614] text-white">
        <div className="max-w-6xl mx-auto">
          {/* Upper Fact Card Container */}
          <div className="relative bg-[#061e10] border border-white/10 rounded-[2.5rem] p-6 sm:p-10 md:p-12 overflow-hidden shadow-2xl mb-12">
            {/* Background SVG Watermark */}
            <div className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none">
              <svg width="350" height="350" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" />
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="6" />
              </svg>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Title Area */}
              <div className="lg:col-span-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 mb-3">
                  <Flame size={14} />
                  <span>DARURAT SAMPAH PANGAN</span>
                </div>
                <h2 className="font-serif text-[clamp(2.2rem,4.5vw,3.5rem)] font-bold text-[#f7ce3e] leading-[1.05] mb-4">
                  Tahukah <br /> Kamu?
                </h2>
                <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                  Fakta nyata seputar krisis food waste dan potensi besar penyelamatan pangan di Indonesia.
                </p>
              </div>

              {/* Center/Right Dynamic Fact Slide */}
              <div className="lg:col-span-8 flex flex-col justify-between min-h-[190px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFactIndex}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="flex-1 mb-6"
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-[#f7ce3e]/20 text-[#f7ce3e] text-xs font-semibold uppercase tracking-wider mb-3">
                      {educationalFacts[activeFactIndex].highlight}
                    </span>
                    <p className="text-lg sm:text-2xl font-medium text-white leading-relaxed mb-4">
                      "{educationalFacts[activeFactIndex].fact}"
                    </p>
                    <span className="text-xs text-white/50 font-mono">
                      Sumber data: {educationalFacts[activeFactIndex].source}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Interactive Carousel Controllers */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {/* Indicators */}
                  <div className="flex items-center gap-2">
                    {educationalFacts.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFactIndex(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          activeFactIndex === idx ? 'w-8 bg-[#f7ce3e]' : 'w-2 bg-white/30 hover:bg-white/60'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>

                  {/* Chevrons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevFact}
                      className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-[#f7ce3e] hover:text-[#062312] transition-colors flex items-center justify-center cursor-pointer"
                      aria-label="Fakta Sebelumnya"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextFact}
                      className="w-10 h-10 rounded-full bg-[#f7ce3e] text-[#062312] hover:bg-[#ffe066] transition-colors flex items-center justify-center cursor-pointer font-bold shadow-md"
                      aria-label="Fakta Selanjutnya"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Impact Real-Time Counters (Garda Pangan Standard) */}
          <div className="bg-[#061e10] border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-semibold block mb-1">
                  TELEMETRI AKSESPANGAN
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Dampak Nyata yang Berhasil Dihadirkan
                </h3>
              </div>
              <a
                href="#/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#f7ce3e] hover:underline"
              >
                <span>Lihat Laporan Lengkap</span>
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1: Porsi Makanan */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors">
                <div className="flex items-baseline gap-2 text-[#f7ce3e] mb-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold">
                    <AnimatedCounter value={825002} />
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider text-white/80">Porsi</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/70 font-medium m-0">
                  Makanan Berhasil Diselamatkan
                </p>
              </div>

              {/* Stat 2: Warga Penerima */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors">
                <div className="flex items-baseline gap-2 text-[#f7ce3e] mb-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold">
                    <AnimatedCounter value={29294} />
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider text-white/80">Orang</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/70 font-medium m-0">
                  Warga Pra-Sejahtera Terbantu
                </p>
              </div>

              {/* Stat 3: KG Sampah Dicegah */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors">
                <div className="flex items-baseline gap-2 text-[#f7ce3e] mb-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold">
                    <AnimatedCounter value={658000} />
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider text-white/80">KG</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/70 font-medium m-0">
                  Sampah Pangan Tercegah dari TPA
                </p>
              </div>

              {/* Stat 4: Emisi Gas CO2e */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-colors">
                <div className="flex items-baseline gap-2 text-[#f7ce3e] mb-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold">
                    <AnimatedCounter value={1506416} />
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider text-white/80">KGCO₂-ek</span>
                </div>
                <p className="text-xs uppercase tracking-wider text-white/70 font-medium m-0">
                  Emisi Gas Rumah Kaca Dicegah
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: INFINITE LOGO MARQUEE (Media & Mitra Ekosistem)
          Infinite smooth scroll with gradient vignette masks
          ============================================================ */}
      <section className="w-full py-12 bg-white border-y border-[rgba(0,0,0,0.06)] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-6 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#86868b] font-semibold">
            DILIPUT OLEH MEDIA &amp; TERHUBUNG DENGAN EKOSISTEM KULINER
          </span>
        </div>

        {/* Marquee Row 1 */}
        <div className="relative overflow-hidden py-2">
          {/* Gradient Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-white to-transparent" />

          <div className="animate-marquee gap-6">
            {[...mediaCoverage, ...mediaCoverage].map((item, idx) => (
              <div
                key={idx}
                className="h-12 px-6 rounded-full border border-[rgba(0,0,0,0.08)] bg-[#fafafc] hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-default select-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-[#1d1d1f] tracking-tight">{item.name}</span>
                <span className="text-[10px] uppercase font-mono text-[#86868b] px-2 py-0.5 rounded bg-black/5">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Reverse) */}
        <div className="relative overflow-hidden py-2 mt-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-white to-transparent" />

          <div className="animate-marquee-reverse gap-6">
            {[...ecosystemPartners, ...ecosystemPartners].map((item, idx) => (
              <div
                key={idx}
                className="h-12 px-6 rounded-full border border-[rgba(0,0,0,0.08)] bg-[#fafafc] hover:bg-white hover:shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-default select-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f7ce3e]" />
                <span className="text-sm font-bold text-[#1d1d1f] tracking-tight">{item.name}</span>
                <span className="text-[10px] uppercase font-mono text-[#86868b] px-2 py-0.5 rounded bg-black/5">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: "AYO JADI AGEN PERUBAHAN!" (4 Garda Pangan Action Cards)
          Warm parchment background (#FCF9E0 / modern soft cream) with
          interactive cards and pill buttons
          ============================================================ */}
      <section className="w-full py-24 px-4 sm:px-8 bg-[#fdfbf2] border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto">
          {/* Section Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] font-bold text-[#062312] leading-tight mb-3">
              Ayo jadi agen perubahan!
            </h2>
            <p className="max-w-xl text-base sm:text-lg text-[#4a5568] leading-relaxed">
              Mari bergabung dalam gerakan untuk menyelamatkan pangan yang berpotensi terbuang!
            </p>
          </div>

          {/* 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Donasi Makanan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.06)] p-6 flex flex-col justify-between shadow-[0_15px_35px_rgba(6,35,18,0.06)] hover:shadow-[0_20px_45px_rgba(6,35,18,0.12)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/surplus-gourmet.jpg"
                    alt="Donasi Makanan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#062312] mb-2 text-center">
                  Donasi Makanan
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Donasikan makanan berlebih dari rumah, event, atau bisnismu; ketimbang dibuang dan merugikan lingkungan sekitarmu.
                </p>
              </div>

              <a href="#/penyedia/surplus" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Mulai Donasi</span>
                <span className="w-7 h-7 rounded-full bg-[#f7ce3e] text-[#062312] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 2: Ambil Surplus */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.06)] p-6 flex flex-col justify-between shadow-[0_15px_35px_rgba(6,35,18,0.06)] hover:shadow-[0_20px_45px_rgba(6,35,18,0.12)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/surplus-bakery.jpg"
                    alt="Ambil Surplus"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#062312] mb-2 text-center">
                  Ambil Surplus
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Selamatkan hidangan hangat bergizi gratis atau dengan harga terjangkau dari dapur mitra restoran terakreditasi.
                </p>
              </div>

              <a href="#/penerima" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Ambil Makanan</span>
                <span className="w-7 h-7 rounded-full bg-[#f7ce3e] text-[#062312] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 3: Usul Penerima */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.06)] p-6 flex flex-col justify-between shadow-[0_15px_35px_rgba(6,35,18,0.06)] hover:shadow-[0_20px_45px_rgba(6,35,18,0.12)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/hero-food-delivery.jpg"
                    alt="Usul Penerima"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#062312] mb-2 text-center">
                  Usul Penerima
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Rekomendasikan masyarakat pra-sejahtera atau panti asuhan di sekitarmu, agar donasi semakin merata dan tepat sasaran.
                </p>
              </div>

              <a href="#/terms" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Rekomendasikan</span>
                <span className="w-7 h-7 rounded-full bg-[#f7ce3e] text-[#062312] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 4: Jadi Relawan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.06)] p-6 flex flex-col justify-between shadow-[0_15px_35px_rgba(6,35,18,0.06)] hover:shadow-[0_20px_45px_rgba(6,35,18,0.12)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/hero-food-kitchen.jpg"
                    alt="Jadi Relawan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#062312] mb-2 text-center">
                  Jadi Relawan
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Ayo ikut turun tangan langsung dan menjadi relawan Food Squad AksesPangan, apapun minat dan keahlian yang kamu miliki!
                </p>
              </div>

              <a href="#/register" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Daftar Relawan</span>
                <span className="w-7 h-7 rounded-full bg-[#f7ce3e] text-[#062312] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: SPLIT FEATURE BANNER ("Anda Pemilik Bisnis Makanan?")
          Rich Forest Green Card + Photo Callout
          ============================================================ */}
      <section className="w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[420px]">
          {/* Left: Chef / Kitchen Imagery */}
          <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-[440px]">
            <img
              src="/images/hero-food-kitchen.jpg"
              alt="Dapur Mitra Kuliner"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
          </div>

          {/* Right: Deep Forest Card with Gold Typography */}
          <div className="relative flex w-full lg:w-1/2 flex-col items-start justify-center gap-6 bg-[#082a15] px-8 py-14 sm:px-14 sm:py-18 lg:px-20 text-white">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] uppercase text-emerald-400">
                <Building2 size={13} />
                <span>KOLABORASI HOTEL &amp; RESTORAN</span>
              </span>
              <h2 className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-tight tracking-tight text-[#f7ce3e]">
                Anda pemilik bisnis makanan?
              </h2>
              <p className="max-w-lg text-sm sm:text-base leading-relaxed text-white/80">
                Makanan berlebih Anda bisa memberi makan saudara-saudara kita yang membutuhkan, sementara sisa bahan makanan yang tidak dapat dikonsumsi dapat dimanfaatkan kembali menjadi pakan ternak.
                <br /><br />
                Tanpa repot, tim kami akan mengambilnya langsung dari lokasi Anda dan memberikan laporan dampak emisi ESG setiap bulannya. Jadilah mitra kami!
              </p>
            </div>

            <a href="#/register" className="btn-garda-pill-gold group">
              <span>Daftar Jadi Mitra</span>
              <span className="w-8 h-8 rounded-full bg-[#062312] text-[#f7ce3e] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6: CURATED SURPLUS CATALOGUE (Interactive Real-Time Items)
          Filter pills + Food rescue cards with live timers
          ============================================================ */}
      <section className="w-full py-20 px-6 sm:px-12 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-[rgba(0,0,0,0.08)]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#86868b] font-semibold block mb-1.5 font-mono">
                INVENTARIS SURPLUS AKTIF HARI INI
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#062312]">
                Katalog Makanan Tersedia
              </h2>
              <p className="text-[14px] text-[#666666] m-0 mt-1">
                Hidangan siap santap pilihan dari restoran terakreditasi, siap diselamatkan sebelum batas waktu berakhir.
              </p>
            </div>

            <motion.a
              href="#/penerima"
              whileHover={{ x: 4 }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#062312] hover:opacity-75 transition-opacity mt-4 sm:mt-0 no-underline"
            >
              <span>BUKA PETA GEOLOCATION</span>
              <ArrowRight size={14} />
            </motion.a>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap uppercase ${
                  selectedCategory === cat.id
                    ? 'bg-[#062312] text-white shadow-md'
                    : 'bg-[#f5f5f7] text-[#4a5568] hover:bg-[#e8e8ed]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Surplus Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-3xl border border-[rgba(0,0,0,0.08)] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col justify-between group transition-all"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#f0f0f0]">
                      <img
                        src={item.photo || getCategoryPhoto(item.foodCategory)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 z-10">
                        {item.isFree ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                            GRATIS
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-md">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20">
                          {item.quantity} kg · {item.portionCount} porsi
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      <div className="text-xs font-medium uppercase text-[#86868b] mb-1.5 flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-700 shrink-0" />
                        <span className="truncate">{item.providerBusinessName} • {item.address}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#1d1d1f] mb-2 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed line-clamp-2 m-0">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-[#fafafc] border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                    <div className="text-xs text-amber-700 font-medium flex items-center gap-1.5 font-mono">
                      <Clock size={13} />
                      <span>Sisa {formatCountdown(item.expiryTime)}</span>
                    </div>

                    <a
                      href="#/penerima"
                      className="text-xs font-bold uppercase tracking-wider py-2 px-4 bg-[#062312] text-white hover:bg-[#0d3a1f] rounded-full transition-colors no-underline shadow-sm"
                    >
                      Klaim Porsi →
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="w-full py-16 text-center bg-white rounded-2xl border border-[rgba(0,0,0,0.08)]">
              <p className="text-[#666666] text-sm mb-3">Tidak ada surplus aktif di kategori ini saat ini.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold uppercase tracking-wider text-[#062312] underline cursor-pointer"
              >
                Lihat Semua Kategori
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 7: PROTOKOL KEAMANAN (3 Pillars of Food Rescue)
          ============================================================ */}
      <section className="w-full py-24 px-6 sm:px-12 bg-[#062312] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#f7ce3e] block mb-2.5 font-mono">
              PROTOKOL KEAMANAN &amp; INTEGRITAS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Cepat. Higienis. Tepat Sasaran.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed m-0">
              Sistem penyelamatan makanan terotomatisasi yang menjaga kehormatan hidangan dan menjamin keamanan konsumsi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#f7ce3e]/40 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-[#f7ce3e] block mb-4">01</span>
                <h3 className="text-lg font-bold text-white mb-2">Unggah Surplus 60 Detik</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Restoran dan bakery terverifikasi mengunggah hidangan berlebih, porsi aman, dan batas kadaluwarsa melalui antarmuka khusus tanpa hambatan birokrasi.
                </p>
              </div>
              <a href="#/penyedia" className="text-xs font-bold uppercase tracking-wider text-[#f7ce3e] inline-flex items-center gap-1.5 hover:underline">
                <span>Alur Mitra Penyedia</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#f7ce3e]/40 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-[#f7ce3e] block mb-4">02</span>
                <h3 className="text-lg font-bold text-white mb-2">SOP Countdown 4 Jam</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Algoritma ketat menjaga rentang waktu konsumsi makanan. Setiap item yang melewati batas aman secara otomatis ditarik dari katalog publik.
                </p>
              </div>
              <a href="#/terms" className="text-xs font-bold uppercase tracking-wider text-[#f7ce3e] inline-flex items-center gap-1.5 hover:underline">
                <span>Panduan Keamanan Pangan</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#f7ce3e]/40 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-[#f7ce3e] block mb-4">03</span>
                <h3 className="text-lg font-bold text-white mb-2">Reduksi Emisi Metana Nyata</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Setiap kilogram makanan yang terselamatkan diverifikasi dalam laporan iklim ESG: 1 kg pangan setara pencegahan 2.5 kg gas rumah kaca CO₂e.
                </p>
              </div>
              <a href="#/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#f7ce3e] inline-flex items-center gap-1.5 hover:underline">
                <span>Telemetri Karbon</span>
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 8: FOOTER
          ============================================================ */}
      <footer className="w-full bg-[#04140a] text-white py-16 px-6 sm:px-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7ce3e] mb-4 font-mono">
                Katalog &amp; Pangan
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-white/70">
                <li><a href="#/penerima" className="hover:text-white transition-colors">Cari Surplus Terdekat</a></li>
                <li><a href="#/penerima" className="hover:text-white transition-colors">Peta Geolocation GPS</a></li>
                <li><a href="#/penerima" className="hover:text-white transition-colors">Kategori Makanan</a></li>
                <li><a href="#/terms" className="hover:text-white transition-colors">SOP Higiene 4 Jam</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7ce3e] mb-4 font-mono">
                Mitra Penyedia
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-white/70">
                <li><a href="#/register" className="hover:text-white transition-colors">Daftarkan Usaha Kuliner</a></li>
                <li><a href="#/penyedia" className="hover:text-white transition-colors">Dashboard Manajemen Stok</a></li>
                <li><a href="#/penyedia/surplus" className="hover:text-white transition-colors">Unggah Makanan Berlebih</a></li>
                <li><a href="#/penyedia/booking" className="hover:text-white transition-colors">Konfirmasi Penjemputan</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7ce3e] mb-4 font-mono">
                Dampak Lingkungan
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-white/70">
                <li><a href="#/dashboard" className="hover:text-white transition-colors">Telemetri Karbon CO₂e</a></li>
                <li><a href="#/dashboard" className="hover:text-white transition-colors">Ekuivalensi Serapan Pohon</a></li>
                <li><a href="#/admin" className="hover:text-white transition-colors">Audit Microservices</a></li>
                <li><a href="#/dashboard" className="hover:text-white transition-colors">Laporan ESG Transparan</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f7ce3e] mb-4 font-mono">
                Platform &amp; Legalitas
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-white/70">
                <li><a href="#/terms" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</a></li>
                <li><a href="#/terms" className="hover:text-white transition-colors">Kebijakan Higiene Pangan</a></li>
                <li><a href="#/login" className="hover:text-white transition-colors">Akses Masuk Akun</a></li>
                <li><a href="#/register" className="hover:text-white transition-colors">Registrasi Akun Baru</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50">
            <p className="m-0 mb-3 sm:mb-0">
              © 2026 AksesPangan. Gerakan Penyelamatan Makanan Indonesia. Terinspirasi oleh inisiatif Garda Pangan.
            </p>
            <div className="flex gap-6">
              <a href="#/terms" className="hover:text-white transition-colors">Privasi</a>
              <a href="#/terms" className="hover:text-white transition-colors">Ketentuan</a>
              <a href="#/terms" className="hover:text-white transition-colors">Standar Mutu</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
