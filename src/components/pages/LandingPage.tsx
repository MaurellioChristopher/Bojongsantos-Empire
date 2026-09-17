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
} from 'lucide-react';
import { getActiveSurplus, calculateImpact } from '@/lib/data';
import { formatCountdown, formatPrice } from '@/lib/utils';
import type { SurplusItem, ImpactData } from '@/types';

// ============================================================
// Animated Number Counter Component
// ============================================================
function AnimatedCounter({
  value,
  duration = 1.6,
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
    <span ref={ref}>
      {decimals > 0 ? displayValue.toFixed(decimals) : displayValue.toLocaleString('id-ID')}
    </span>
  );
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// Hero Story Scenes (Depicting the True Concept of AksesPangan)
const heroScenes = [
  {
    id: 'kitchen',
    tag: '01 / KURASI DAPUR BINTANG LIMA',
    title: 'Dapur Hotel & Resto Ternama',
    subtitle: 'Chef eksekutif mengemas hidangan berlebih berkualitas ke wadah food-grade higienis.',
    image: '/images/hero-food-kitchen.jpg',
    metric: 'SOP Higiene 4 Jam Terverifikasi',
  },
  {
    id: 'distribution',
    tag: '02 / PENYALURAN BERMARTABAT',
    title: 'Distribusi Komunitas Tepat Sasaran',
    subtitle: 'Makanan hangat terselamatkan dan dinikmati langsung sebelum batas waktu kedaluwarsa.',
    image: '/images/hero-food-delivery.jpg',
    metric: 'Pemberdayaan Warga & Zero Hunger',
  },
  {
    id: 'bakery',
    tag: '03 / PATISSERIE & HASIL BUMI',
    title: 'Pencegahan Jejak Karbon Masif',
    subtitle: 'Artisan croissant, roti, dan buah segar diselamatkan setiap hari tanpa jejak emisi.',
    image: '/images/surplus-bakery.jpg',
    metric: 'Reduksi Emisi 2.5 kg CO₂e / kg Pangan',
  },
];

export function LandingPage() {
  const [activeItems, setActiveItems] = useState<SurplusItem[]>([]);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Hero Cinematic Showcase State
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    setActiveItems(getActiveSurplus());
    setImpact(calculateImpact());
  }, []);

  // Auto-advance scenes every 5.5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % heroScenes.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextScene = () => {
    setActiveSceneIndex((prev) => (prev + 1) % heroScenes.length);
  };

  const prevScene = () => {
    setActiveSceneIndex((prev) => (prev - 1 + heroScenes.length) % heroScenes.length);
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

  const currentScene = heroScenes[activeSceneIndex];

  return (
    <div className="w-full bg-white overflow-hidden selection:bg-black selection:text-white">
      {/* ============================================================
          SECTION 1: HAUTE EDITORIAL HERO SPLIT-SCREEN
          Left: Cinema-Grade Interactive Story Showcase of Food Rescue
          Right: Pure Deep Black (#000000) Luxury Card with Cormorant/Playfair
          ============================================================ */}
      <section className="w-full min-h-[620px] lg:h-[calc(100vh-68px)] lg:max-h-[780px] grid grid-cols-1 lg:grid-cols-2 bg-black">
        {/* LEFT COLUMN: Cinematic Story Showcase */}
        <div className="relative w-full h-[420px] sm:h-[500px] lg:h-full bg-[#0a0a0a] overflow-hidden group select-none">
          {/* Animated Background Scenes with Ken-Burns Motion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={currentScene.image}
                alt={currentScene.title}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>

          {/* Luxury Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none" />

          {/* Top-Left Chapter Stamp */}
          <div className="absolute top-6 left-6 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.tag}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/90 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-[2px] border border-white/20 shadow-sm flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{currentScene.tag}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Floating Real-Time Radar Badge (Right Top) */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-[10px] tracking-wider uppercase font-mono text-white/90 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Food Rescue Network</span>
          </div>

          {/* Bottom Overlay: Story Info Card + Interactive Progress Controls */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Context Story Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-md bg-black/70 backdrop-blur-md px-5 py-3.5 rounded-[4px] border border-white/15 shadow-xl text-left"
              >
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-semibold mb-1">
                  <CheckCircle2 size={12} />
                  <span>{currentScene.metric}</span>
                </div>
                <h3 className="font-luxury-headline text-lg sm:text-xl font-bold text-white mb-1">
                  {currentScene.title}
                </h3>
                <p className="text-xs text-[#d1d1d6] leading-relaxed m-0 line-clamp-2">
                  {currentScene.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Interactive Scene Navigators & Auto-Play Indicator */}
            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 self-start sm:self-end">
              {/* Scene progress indicators */}
              <div className="flex items-center gap-1.5">
                {heroScenes.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setActiveSceneIndex(idx);
                      setIsAutoPlaying(false);
                    }}
                    className="h-1 rounded-full transition-all duration-300 cursor-pointer overflow-hidden bg-white/30"
                    style={{ width: activeSceneIndex === idx ? '28px' : '12px' }}
                    title={`Lihat ${scene.title}`}
                    aria-label={`Scene ${idx + 1}`}
                  >
                    {activeSceneIndex === idx && (
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: isAutoPlaying ? 5.5 : 0, ease: 'linear' }}
                        className="h-full bg-white"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-1 pl-2 border-l border-white/20">
                <button
                  onClick={() => {
                    prevScene();
                    setIsAutoPlaying(false);
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Previous Scene"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title={isAutoPlaying ? 'Jeda Slideshow' : 'Putar Otomatis'}
                  aria-label="Toggle autoplay"
                >
                  {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  onClick={() => {
                    nextScene();
                    setIsAutoPlaying(false);
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Next Scene"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pure Black Luxury Editorial Card */}
        <div className="w-full h-full bg-[#000000] text-white flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-16 lg:py-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Eyebrow */}
            <motion.div
              variants={itemVariants}
              className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8e8e93] mb-5 flex items-center gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              <span>KURASI SURPLUS HOTEL & RESTORAN BINTANG LIMA</span>
            </motion.div>

            {/* Headline with Playfair Display & Cormorant Garamond Italic */}
            <motion.h1
              variants={itemVariants}
              className="font-luxury-headline text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-6"
            >
              Rescue Food. <br />
              <motion.span
                className="font-luxury-italic font-normal italic text-[#f0f0f0] inline-block"
                whileHover={{ scale: 1.02, color: '#ffffff' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Nourish Lives.
              </motion.span>
            </motion.h1>

            {/* Editorial Narrative */}
            <motion.p
              variants={itemVariants}
              className="text-[15px] sm:text-[16px] leading-[1.65] text-[#bfbfbf] font-normal mb-8 max-w-lg"
            >
              Dari perjamuan hotel bintang lima hingga kedai artisan lokal. AksesPangan
              mengalirkan surplus hidangan istimewa langsung ke tangan penikmat dan komunitas
              secara real-time—terjaga kesegarannya, bermartabat, dan tanpa jejak emisi.
            </motion.p>

            {/* Action Buttons with Spring Micro-Animations */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-10">
              <motion.a
                href="#/penerima"
                className="btn-peak-white group relative overflow-hidden"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span>AMBIL SURPLUS SEKARANG</span>
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                >
                  <ArrowRight size={15} />
                </motion.span>
              </motion.a>

              <motion.a
                href="#/penyedia"
                className="btn-peak-outline"
                whileHover={{
                  scale: 1.03,
                  y: -2,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                GABUNG SEBAGAI MITRA
              </motion.a>
            </motion.div>

            {/* Subtle Luxury Trust Line */}
            <motion.div
              variants={itemVariants}
              className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-[10px] uppercase tracking-[0.14em] text-[#86868b] font-medium"
            >
              <span className="hover:text-white transition-colors duration-200 cursor-default">
                SOP HIGIENE 4 JAM
              </span>
              <span>•</span>
              <span className="hover:text-white transition-colors duration-200 cursor-default">
                JAMINAN MUTU 100%
              </span>
              <span>•</span>
              <span className="hover:text-white transition-colors duration-200 cursor-default">
                DISTRIBUSI REAL-TIME
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: EDITORIAL CATALOG (Curated Photography, Lively Motion)
          ============================================================ */}
      <section className="w-full py-20 px-6 sm:px-12 bg-[#fafafc] border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header with smooth entrance */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-[rgba(0,0,0,0.08)]"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#86868b] font-semibold block mb-1.5 font-mono">
                INVENTARIS SURPLUS AKTIF HARI INI
              </span>
              <h2 className="font-luxury-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Katalog Pangan <span className="font-luxury-italic italic font-normal text-[#555555]">Tersedia.</span>
              </h2>
              <p className="text-[14px] text-[#666666] m-0 mt-1">
                Hidangan siap santap pilihan dari restoran terakreditasi, siap diambil sebelum batas waktu berakhir.
              </p>
            </div>

            <motion.a
              href="#/penerima"
              whileHover={{ x: 4 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black hover:opacity-75 transition-opacity mt-4 sm:mt-0 no-underline"
            >
              <span>BUKA PETA GEOLOCATION</span>
              <ArrowRight size={13} />
            </motion.a>
          </motion.div>

          {/* Category Filter Tabs with Micro-Interactions */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`relative px-4 py-2 text-[11px] font-semibold tracking-[0.1em] rounded-[3px] transition-all cursor-pointer whitespace-nowrap uppercase ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white text-[#666666] border border-[rgba(0,0,0,0.1)] hover:border-black hover:text-black'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>

          {/* High-End Editorial Product Cards Grid with AnimatePresence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.slice(0, 6).map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 25, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{
                    y: -7,
                    boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                  }}
                  className="bg-white rounded-[4px] border border-[rgba(0,0,0,0.08)] overflow-hidden flex flex-col justify-between hover:border-black/50 transition-colors duration-300 group"
                >
                  <div>
                    {/* Photo Container with subtle zoom */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f0f0f0]">
                      <img
                        src={getCategoryPhoto(item.foodCategory)}
                        alt={item.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                      />

                      {/* Minimalist Price Tag */}
                      <div className="absolute top-3 right-3 z-10">
                        <span
                          className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-[2px] shadow-sm ${
                            item.isFree
                              ? 'bg-[#1b8a36] text-white'
                              : 'bg-black text-white'
                          }`}
                        >
                          {item.isFree ? 'GRATIS' : formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Remaining Portions Tag */}
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-black/60 backdrop-blur-md text-white border border-white/20">
                          {item.quantity} kg · {item.portionCount} porsi
                        </span>
                      </div>
                    </div>

                    {/* Content Padding */}
                    <div className="p-6">
                      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#86868b] mb-1.5 flex items-center gap-1">
                        <MapPin size={11} className="text-black shrink-0" />
                        <span className="truncate">{item.providerBusinessName} • {item.address}</span>
                      </div>

                      <h3 className="font-luxury-headline text-[19px] font-bold text-[#111111] mb-2 line-clamp-1 group-hover:text-black transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-[13px] text-[#555555] leading-relaxed mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-6 py-4 bg-[#fafafc] border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                    <div className="text-[11px] text-[#b25e00] font-medium flex items-center gap-1.5 font-mono">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <Clock size={12} />
                      <span>Sisa {formatCountdown(item.expiryTime)}</span>
                    </div>

                    <motion.a
                      href="#/penerima"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[11px] font-bold uppercase tracking-[0.1em] py-2 px-3.5 bg-black text-white hover:bg-[#262626] transition-colors rounded-[2px] no-underline shadow-sm"
                    >
                      Klaim Porsi →
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full py-16 text-center bg-white rounded-[4px] border border-[rgba(0,0,0,0.08)]"
            >
              <p className="text-[#666666] text-sm mb-3">Tidak ada surplus aktif di kategori ini saat ini.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold uppercase tracking-wider text-black underline cursor-pointer"
              >
                Lihat Semua Kategori
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 3: THREE PILLARS (Haute Minimalist Luxury & Dynamic Hover)
          ============================================================ */}
      <section className="w-full py-24 px-6 sm:px-12 bg-black text-white relative">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#86868b] block mb-2.5 font-mono">
              PROTOKOL KEAMANAN & INTEGRITAS
            </span>
            <h2 className="font-luxury-headline text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Cepat. Higienis. Tepat Sasaran.
            </h2>
            <p className="text-[#a1a1a6] text-[15px] leading-relaxed m-0">
              Sistem penyelamatan makanan terotomatisasi yang menjaga kehormatan hidangan dan menjamin keamanan konsumsi.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{
                y: -8,
                backgroundColor: '#161616',
                borderColor: 'rgba(255, 255, 255, 0.35)',
              }}
              className="p-8 rounded-[4px] bg-[#111111] border border-white/10 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div>
                <span className="font-luxury-headline text-3xl font-bold text-[#555555] group-hover:text-white transition-colors duration-300 block mb-4">
                  01
                </span>
                <h3 className="text-[18px] font-bold text-white mb-2 tracking-tight">Unggah Surplus 60 Detik</h3>
                <p className="text-xs text-[#a1a1a6] leading-relaxed mb-6">
                  Restoran dan bakery terverifikasi mengunggah hidangan berlebih, porsi aman, dan batas kadaluwarsa melalui antarmuka khusus tanpa hambatan birokrasi.
                </p>
              </div>
              <a
                href="#/penyedia"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 hover:underline no-underline"
              >
                <span>Alur Mitra Penyedia</span>
                <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{
                y: -8,
                backgroundColor: '#161616',
                borderColor: 'rgba(255, 255, 255, 0.35)',
              }}
              className="p-8 rounded-[4px] bg-[#111111] border border-white/10 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div>
                <span className="font-luxury-headline text-3xl font-bold text-[#555555] group-hover:text-white transition-colors duration-300 block mb-4">
                  02
                </span>
                <h3 className="text-[18px] font-bold text-white mb-2 tracking-tight">SOP Countdown 4 Jam</h3>
                <p className="text-xs text-[#a1a1a6] leading-relaxed mb-6">
                  Algoritma ketat menjaga rentang waktu konsumsi makanan. Setiap item yang melewati batas aman secara otomatis ditarik dari katalog publik.
                </p>
              </div>
              <a
                href="#/terms"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 hover:underline no-underline"
              >
                <span>Panduan Keamanan Pangan</span>
                <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{
                y: -8,
                backgroundColor: '#161616',
                borderColor: 'rgba(255, 255, 255, 0.35)',
              }}
              className="p-8 rounded-[4px] bg-[#111111] border border-white/10 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div>
                <span className="font-luxury-headline text-3xl font-bold text-[#555555] group-hover:text-white transition-colors duration-300 block mb-4">
                  03
                </span>
                <h3 className="text-[18px] font-bold text-white mb-2 tracking-tight">Reduksi Emisi Metana Nyata</h3>
                <p className="text-xs text-[#a1a1a6] leading-relaxed mb-6">
                  Setiap kilogram makanan yang terselamatkan diverifikasi dalam laporan iklim ESG: 1 kg pangan setara pencegahan 2.5 kg gas rumah kaca CO₂e.
                </p>
              </div>
              <a
                href="#/dashboard"
                className="text-[11px] font-bold uppercase tracking-[0.14em] text-white inline-flex items-center gap-1.5 hover:underline no-underline"
              >
                <span>Telemetri Karbon</span>
                <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: REAL IMPACT & ESG METRICS (Smooth Animated Counters)
          ============================================================ */}
      <section className="w-full py-24 px-6 sm:px-12 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[10px] font-mono tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PEMANTAU DAMPAK REAL-TIME
            </div>
            <h2 className="font-luxury-headline text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] mb-14">
              Dampak Nyata, <span className="font-luxury-italic italic font-normal text-[#555555]">Bukan Sekadar Wacana.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-14">
            {/* Card 1: Kg Saved */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.05 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: '0 16px 30px -10px rgba(0,0,0,0.08)' }}
              className="p-8 bg-[#fafafc] rounded-[4px] text-left border border-[rgba(0,0,0,0.06)] hover:border-black/20 transition-all duration-300"
            >
              <div className="font-luxury-headline text-3xl sm:text-4xl font-bold text-black mb-1">
                <AnimatedCounter value={impact?.totalKgSaved || 23} />{' '}
                <span className="text-sm font-normal text-[#86868b] font-sans">kg</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868b] font-mono">
                Pangan Diselamatkan
              </div>
            </motion.div>

            {/* Card 2: Portions */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.12 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: '0 16px 30px -10px rgba(0,0,0,0.08)' }}
              className="p-8 bg-[#fafafc] rounded-[4px] text-left border border-[rgba(0,0,0,0.06)] hover:border-black/20 transition-all duration-300"
            >
              <div className="font-luxury-headline text-3xl sm:text-4xl font-bold text-[#1b8a36] mb-1">
                <AnimatedCounter value={impact?.totalPortions || 69} />{' '}
                <span className="text-sm font-normal text-[#86868b] font-sans">porsi</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868b] font-mono">
                Porsi Didistribusikan
              </div>
            </motion.div>

            {/* Card 3: CO2e */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.18 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: '0 16px 30px -10px rgba(0,0,0,0.08)' }}
              className="p-8 bg-[#fafafc] rounded-[4px] text-left border border-[rgba(0,0,0,0.06)] hover:border-black/20 transition-all duration-300"
            >
              <div className="font-luxury-headline text-3xl sm:text-4xl font-bold text-black mb-1">
                <AnimatedCounter value={impact?.totalCO2eSaved || 57.5} decimals={1} />{' '}
                <span className="text-sm font-normal text-[#86868b] font-sans">kg</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868b] font-mono">
                CO₂e Tercegah
              </div>
            </motion.div>

            {/* Card 4: Trees */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.24 }}
              whileHover={{ y: -6, scale: 1.02, boxShadow: '0 16px 30px -10px rgba(0,0,0,0.08)' }}
              className="p-8 bg-[#fafafc] rounded-[4px] text-left border border-[rgba(0,0,0,0.06)] hover:border-black/20 transition-all duration-300"
            >
              <div className="font-luxury-headline text-3xl sm:text-4xl font-bold text-black mb-1">
                <AnimatedCounter value={impact?.treeEquivalent || 2.6} decimals={1} />{' '}
                <span className="text-sm font-normal text-[#86868b] font-sans">pohon</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#86868b] font-mono">
                Ekuivalensi Pohon
              </div>
            </motion.div>
          </div>

          <motion.a
            href="#/dashboard"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-peak-white !bg-black !text-white hover:!bg-[#222222] shadow-md"
          >
            BUKA LAPORAN DAMPAK LENGKAP →
          </motion.a>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: FOOTER (Haute Minimalism)
          ============================================================ */}
      <footer className="w-full bg-[#0a0a0a] text-white py-20 px-6 sm:px-12 border-t border-white/10">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b] mb-5 font-mono">
                Katalog & Pangan
              </h4>
              <ul className="list-none p-0 m-0 space-y-3 text-xs text-[#b5b5b5]">
                <li><a href="#/penerima" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Cari Surplus Terdekat</a></li>
                <li><a href="#/penerima" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Peta Geolocation GPS</a></li>
                <li><a href="#/penerima" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Kategori Makanan</a></li>
                <li><a href="#/terms" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">SOP Higiene 4 Jam</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b] mb-5 font-mono">
                Mitra Penyedia
              </h4>
              <ul className="list-none p-0 m-0 space-y-3 text-xs text-[#b5b5b5]">
                <li><a href="#/register" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Daftarkan Usaha Kuliner</a></li>
                <li><a href="#/penyedia" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Dashboard Manajemen Stok</a></li>
                <li><a href="#/penyedia/surplus" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Unggah Makanan Berlebih</a></li>
                <li><a href="#/penyedia/booking" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Konfirmasi Penjemputan</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b] mb-5 font-mono">
                Dampak Lingkungan
              </h4>
              <ul className="list-none p-0 m-0 space-y-3 text-xs text-[#b5b5b5]">
                <li><a href="#/dashboard" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Telemetri Karbon CO₂e</a></li>
                <li><a href="#/dashboard" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Ekuivalensi Serapan Pohon</a></li>
                <li><a href="#/admin" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Audit Microservices</a></li>
                <li><a href="#/dashboard" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Laporan ESG Transparan</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868b] mb-5 font-mono">
                Platform & Legalitas
              </h4>
              <ul className="list-none p-0 m-0 space-y-3 text-xs text-[#b5b5b5]">
                <li><a href="#/terms" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Syarat & Ketentuan</a></li>
                <li><a href="#/terms" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Kebijakan Higiene Pangan</a></li>
                <li><a href="#/login" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Akses Masuk Akun</a></li>
                <li><a href="#/register" className="hover:text-white transition-colors duration-150 no-underline text-[#b5b5b5]">Registrasi Akun Baru</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868b]">
            <p className="m-0 mb-3 sm:mb-0">
              © 2026 AksesPangan Inc. Gerakan Penyelamatan Makanan Indonesia.
            </p>
            <div className="flex gap-6">
              <a href="#/terms" className="text-[#86868b] hover:text-white transition-colors no-underline">Privasi</a>
              <a href="#/terms" className="text-[#86868b] hover:text-white transition-colors no-underline">Ketentuan</a>
              <a href="#/terms" className="text-[#86868b] hover:text-white transition-colors no-underline">Standar Mutu</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
