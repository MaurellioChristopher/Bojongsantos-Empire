'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  MapPin,
  Shield,
  Leaf,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Building2,
  Flame,
  Globe2,
} from 'lucide-react';
import { getActiveSurplus, calculateImpact } from '@/lib/data';
import { formatCountdown, formatPrice } from '@/lib/utils';
import type { SurplusItem, ImpactData } from '@/types';

// ============================================================
// Animated Number Counter Component (Smooth EaseOutExpo)
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
    highlight: 'Negara Pembuang Pangan Terbesar ke-2 G20',
    fact: 'Indonesia merupakan negara pembuang sampah makanan terbesar kedua di antara negara G20! Sebanyak 23 hingga 48 juta ton makanan terbuang sia-sia setiap tahunnya.',
    source: 'Kajian Bappenas & Food Loss & Waste Indonesia',
  },
  {
    id: 2,
    highlight: 'Metana 25x Lebih Berbahaya dari CO₂',
    fact: 'Sampah makanan yang berakhir dan membusuk di TPA menghasilkan gas metana (CH₄) yang memiliki potensi pemanasan iklim 25 kali lipat lebih agresif daripada karbon dioksida!',
    source: 'Kementerian Lingkungan Hidup & Kehutanan',
  },
  {
    id: 3,
    highlight: 'Sanggup Beri Makan 50% Populasi',
    fact: 'Jika diselamatkan secara terstruktur, susut dan sisa pangan berkualitas di Indonesia sanggup mencukupi gizi hingga 28 juta warga pra-sejahtera dan mengentaskan kelaparan.',
    source: 'World Resources Institute (WRI)',
  },
  {
    id: 4,
    highlight: '1 kg Pangan = 2.5 kg CO₂e Dicegah',
    fact: 'Setiap kilogram hidangan yang berhasil disalurkan ke masyarakat sebelum rusak langsung memangkas 2.5 kg emisi gas rumah kaca yang membebani atmosfer bumi.',
    source: 'Intergovernmental Panel on Climate Change (IPCC)',
  },
];

// Media Coverage (Garda Pangan Exact Partners)
const mediaCoverage = [
  { name: 'BBC Indonesia', type: 'Media Global' },
  { name: 'Metro TV', type: 'Televisi' },
  { name: 'Kompas', type: 'Media Nasional' },
  { name: 'Jawa Pos', type: 'Surat Kabar' },
  { name: 'Liputan 6', type: 'Televisi' },
  { name: 'The Jakarta Post', type: 'Media' },
  { name: 'IDN Times', type: 'Digital' },
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
  { name: 'Badan Pangan Nasional', type: 'Instansi Pemerintah' },
  { name: 'Bappenas', type: 'Kementerian PPN' },
  { name: 'Koalisi Pangan Lestari', type: 'Aliansi ESG' },
];

export function LandingPage() {
  const [activeItems, setActiveItems] = useState<SurplusItem[]>([]);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFactIndex, setActiveFactIndex] = useState(0);

  // Reference for the Scroll-Driven Sequence (380vh Track)
  const heroSequenceRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroSequenceRef,
    offset: ['start start', 'end end'],
  });

  // ============================================================
  // CAMERA & TYPOGRAPHY ZOOM TRANSITION TRANSFORMS
  // Phase 1 (0 to 0.35): Typography zooms in 1x -> 8x into the letter 'O' portal
  // Phase 2 (0.25 to 0.45): Portal circle expands outward, text fades into the world
  // Phase 3 (0.45 to 0.85): "Tahukah Kamu?" Educational Stage slides up into view
  // ============================================================
  const typographyScale = useTransform(scrollYProgress, [0, 0.35], [1, 8.5]);
  const typographyOpacity = useTransform(scrollYProgress, [0, 0.22, 0.35], [1, 0.9, 0]);
  const heroCtaOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroCtaY = useTransform(scrollYProgress, [0, 0.1], [0, 20]);

  // Iris / Circular Reveal Expansion (expanding from 80px to 2200px)
  const revealRadius = useTransform(scrollYProgress, [0.08, 0.4], [90, 2200]);
  const revealClipPath = useTransform(revealRadius, (r) => `circle(${r}px at 50% 50%)`);

  // Stage 2: Educational & Real-time Impact Cards
  const stage2Opacity = useTransform(scrollYProgress, [0.38, 0.48, 0.88, 0.98], [0, 1, 1, 0.2]);
  const stage2Y = useTransform(scrollYProgress, [0.38, 0.52], [90, 0]);
  const stage2Scale = useTransform(scrollYProgress, [0.38, 0.52], [0.93, 1]);

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
    <div className="w-full bg-white overflow-x-hidden selection:bg-[#0e2316] selection:text-[#ffe602]">
      {/* ============================================================
          SECTION 1: SCROLL-DRIVEN CAMERA / TYPOGRAPHY ZOOM SEQUENCE
          Track: 380vh. Pinned Sticky Viewport: 100vh.
          Camera zooms through the letter 'O' into the food rescue world!
          Palette: Exact Garda Forest Deep (#0e2316) & Garda Sun (#ffe602)
          ============================================================ */}
      <section ref={heroSequenceRef} className="relative w-full h-[380vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0e2316] flex items-center justify-center">
          {/* LAYER 0: Ambient Deep Forest Texture Backdrop */}
          <div className="absolute inset-0 z-0 bg-[#0e2316] pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(10,90,47,0.3)_0%,_transparent_70%)]" />
          </div>

          {/* LAYER 1: Full-Screen Background Revealed via Dynamic Circular Iris Clip */}
          <motion.div
            style={{ clipPath: revealClipPath }}
            className="absolute inset-0 z-10 w-full h-full pointer-events-none will-change-[clip-path]"
          >
            <img
              src="/images/hero-food-kitchen.jpg"
              alt="Kitchen Atmosphere"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Dark gradient overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e2316] via-[#0e2316]/65 to-[#0e2316]/75" />
          </motion.div>

          {/* LAYER 2: Zooming Camera Typography Unit (ONE STOP F[O]OD RESCUE) */}
          <motion.div
            style={{
              scale: typographyScale,
              opacity: typographyOpacity,
            }}
            className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-5xl pointer-events-none select-none will-change-transform"
          >
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a5a2f]/70 border border-[#ffe602]/30 text-[10px] font-semibold tracking-[0.24em] uppercase text-[#ffe602] mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#ffe602] animate-ping" />
              <span>INDONESIA FOOD LOSS &amp; WASTE SOLUTION</span>
            </div>

            {/* Giant Title with Centered Circular Portal inside the 'O' */}
            <h1 className="font-serif text-[clamp(2.75rem,7vw,5.6rem)] font-bold uppercase leading-[0.94] tracking-[-0.03em] text-center mb-6">
              <span className="block text-white">ONE STOP</span>
              <span className="relative block text-[#ffe602]">
                F
                {/* Circular Portal Lens in the letter 'O' */}
                <span className="relative mx-[0.03em] inline-block size-[0.8em] -translate-y-[0.08em] overflow-hidden rounded-full border-4 border-[#ffe602] bg-[#0e2316] align-middle shadow-[0_0_40px_rgba(255,230,2,0.5)]">
                  <img
                    src="/images/hero-food-delivery.jpg"
                    alt="Portal"
                    className="h-full w-full object-cover"
                  />
                </span>
                OD RESCUE
              </span>
              <span className="block text-white">
                &amp; SURPLUS <span className="text-[#ffe602]">SOLUTION</span>
              </span>
            </h1>

            {/* Subtext and dual action buttons (fade out fast as user scrolls) */}
            <motion.div
              style={{ opacity: heroCtaOpacity, y: heroCtaY }}
              className="flex flex-col items-center pointer-events-auto"
            >
              <p className="max-w-xl text-sm sm:text-base text-white/80 leading-relaxed font-normal mb-8 text-center">
                Pusat koordinasi penyelamatan makanan surplus hotel dan restoran untuk disalurkan
                secara bermartabat kepada masyarakat pra-sejahtera.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="#/penerima" className="btn-garda-pill-gold group">
                  <span>AMBIL SURPLUS SEKARANG</span>
                  <span className="w-8 h-8 rounded-full bg-[#0e2316] text-[#ffe602] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </span>
                </a>
                <a href="#/penyedia" className="btn-garda-pill group">
                  <span className="text-white">GABUNG SEBAGAI MITRA</span>
                  <span className="w-8 h-8 rounded-full bg-[#ffe602] text-[#0e2316] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </span>
                </a>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs font-mono text-white/50 animate-pulse">
                <span>Scroll ke bawah untuk menyelami</span>
                <ChevronDown size={14} />
              </div>
            </motion.div>
          </motion.div>

          {/* LAYER 3: Stage 2 - "Tahukah Kamu?" Card + Real-time Impact Metrics */}
          <motion.div
            style={{
              opacity: stage2Opacity,
              y: stage2Y,
              scale: stage2Scale,
            }}
            className="absolute z-30 inset-x-4 sm:inset-x-8 max-w-5xl mx-auto flex flex-col justify-center pointer-events-auto will-change-transform"
          >
            {/* Top Educational Fact Card */}
            <div className="relative bg-[#0d2b14]/95 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 sm:p-10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] overflow-hidden mb-6">
              {/* Decorative Watermark */}
              <div className="absolute -bottom-16 -right-16 text-white/5 pointer-events-none">
                <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="none" />
                  <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="6" />
                </svg>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                {/* Left Title */}
                <div className="lg:col-span-4">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#ffe602] mb-2 font-bold">
                    <Flame size={13} />
                    <span>DARURAT SAMPAH PANGAN</span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#ffe602] leading-[1.05] mb-2">
                    Tahukah <br /> Kamu?
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    Fakta nyata seputar krisis food waste dan potensi besar penyelamatan pangan di Indonesia.
                  </p>
                </div>

                {/* Right Interactive Carousel */}
                <div className="lg:col-span-8 flex flex-col justify-between min-h-[140px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFactIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mb-4"
                    >
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#ffe602]/20 text-[#ffe602] text-[11px] font-bold uppercase tracking-wider mb-2">
                        {educationalFacts[activeFactIndex].highlight}
                      </span>
                      <p className="text-base sm:text-xl font-medium text-white leading-relaxed mb-2">
                        "{educationalFacts[activeFactIndex].fact}"
                      </p>
                      <span className="text-[11px] text-white/50 font-mono">
                        Sumber: {educationalFacts[activeFactIndex].source}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Fact Navigation Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      {educationalFacts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFactIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            activeFactIndex === idx ? 'w-6 bg-[#ffe602]' : 'w-2 bg-white/30 hover:bg-white/60'
                          }`}
                          aria-label={`Fakta ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevFact}
                        className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-[#ffe602] hover:text-[#0e2316] transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Fakta Sebelumnya"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={nextFact}
                        className="w-8 h-8 rounded-full bg-[#ffe602] text-[#0e2316] hover:bg-[#ffd800] transition-colors flex items-center justify-center cursor-pointer font-bold shadow-md"
                        aria-label="Fakta Selanjutnya"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 4-Counter Metrics Strip */}
            <div className="bg-[#0d2b14]/95 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-baseline gap-1.5 text-[#ffe602] mb-0.5">
                    <span className="font-serif text-2xl sm:text-3xl font-bold">
                      <AnimatedCounter value={825002} />
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/70">Porsi</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Makanan Diselamatkan
                  </p>
                </div>

                {/* Metric 2 */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-baseline gap-1.5 text-[#ffe602] mb-0.5">
                    <span className="font-serif text-2xl sm:text-3xl font-bold">
                      <AnimatedCounter value={29294} />
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/70">Orang</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Penerima Manfaat
                  </p>
                </div>

                {/* Metric 3 */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-baseline gap-1.5 text-[#ffe602] mb-0.5">
                    <span className="font-serif text-2xl sm:text-3xl font-bold">
                      <AnimatedCounter value={658000} />
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/70">KG</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Pangan Tercegah TPA
                  </p>
                </div>

                {/* Metric 4 */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-baseline gap-1.5 text-[#ffe602] mb-0.5">
                    <span className="font-serif text-2xl sm:text-3xl font-bold">
                      <AnimatedCounter value={1506416} />
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/70">KGCO₂-ek</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Emisi Gas Dicegah
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: INFINITE SMOOTH MARQUEE TICKER (Media & Mitra Ekosistem)
          Exact Garda Pangan Media & Partner Logos with Gradient Vignettes
          ============================================================ */}
      <section className="w-full py-12 bg-white border-y border-[rgba(0,0,0,0.06)] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-5 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#86868b] font-semibold">
            DILIPUT OLEH MEDIA &amp; TERHUBUNG DENGAN EKOSISTEM KULINER
          </span>
        </div>

        {/* Row 1 (Forward) */}
        <div className="relative overflow-hidden py-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-white to-transparent" />

          <div className="animate-marquee gap-5">
            {[...mediaCoverage, ...mediaCoverage].map((item, idx) => (
              <div
                key={idx}
                className="h-11 px-5 rounded-full border border-[rgba(10,90,47,0.15)] bg-[#f8faf9] hover:bg-[#eefbf4] hover:border-[#0a5a2f] transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-default select-none shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#0a5a2f]" />
                <span className="text-sm font-bold text-[#0e2316] tracking-tight">{item.name}</span>
                <span className="text-[10px] uppercase font-mono text-[#0a5a2f] font-semibold px-2 py-0.5 rounded-full bg-[#0a5a2f]/10">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 (Reverse) */}
        <div className="relative overflow-hidden py-1.5 mt-2.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-white to-transparent" />

          <div className="animate-marquee-reverse gap-5">
            {[...ecosystemPartners, ...ecosystemPartners].map((item, idx) => (
              <div
                key={idx}
                className="h-11 px-5 rounded-full border border-[rgba(255,230,2,0.5)] bg-[#fffdf0] hover:bg-[#ffe602]/20 hover:border-[#ffe602] transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-default select-none shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#ffe602]" />
                <span className="text-sm font-bold text-[#0e2316] tracking-tight">{item.name}</span>
                <span className="text-[10px] uppercase font-mono text-[#0e2316] font-semibold px-2 py-0.5 rounded-full bg-[#ffe602]/25">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: "AYO JADI AGEN PERUBAHAN!" (4 Garda Pangan Action Cards)
          Background: Official Warm Cream #FCF9E0
          Cards: Clean white rounded-[2.5rem] cards with action pill buttons
          ============================================================ */}
      <section className="w-full py-24 px-4 sm:px-8 bg-[#FCF9E0] border-b border-[rgba(10,90,47,0.1)]">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] font-bold text-[#0e2316] leading-tight mb-3">
              Ayo jadi agen perubahan!
            </h2>
            <p className="max-w-xl text-base sm:text-lg text-[#0e2316]/75 leading-relaxed">
              Mari bergabung dalam gerakan untuk menyelamatkan pangan yang berpotensi terbuang!
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Donasi Makanan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2.5rem] border border-white p-6 flex flex-col justify-between shadow-[0_20px_30px_rgba(18,34,21,0.08)] hover:shadow-[0_24px_40px_rgba(18,34,21,0.14)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/surplus-gourmet.jpg"
                    alt="Donasi Makanan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0a5a2f] mb-2 text-center">
                  Donasi Makanan
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Donasikan makanan berlebih dari rumah, event, atau bisnismu; ketimbang dibuang dan merugikan lingkungan sekitarmu.
                </p>
              </div>

              <a href="#/penyedia/surplus" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Mulai Donasi</span>
                <span className="w-7 h-7 rounded-full bg-[#ffe602] text-[#0e2316] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 2: Ambil Surplus */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2.5rem] border border-white p-6 flex flex-col justify-between shadow-[0_20px_30px_rgba(18,34,21,0.08)] hover:shadow-[0_24px_40px_rgba(18,34,21,0.14)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/surplus-bakery.jpg"
                    alt="Ambil Surplus"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0a5a2f] mb-2 text-center">
                  Ambil Surplus
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Selamatkan aneka hidangan hangat bergizi gratis atau harga terjangkau dari dapur mitra restoran sebelum batas waktu habis.
                </p>
              </div>

              <a href="#/penerima" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Ambil Makanan</span>
                <span className="w-7 h-7 rounded-full bg-[#ffe602] text-[#0e2316] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 3: Usul Penerima */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2.5rem] border border-white p-6 flex flex-col justify-between shadow-[0_20px_30px_rgba(18,34,21,0.08)] hover:shadow-[0_24px_40px_rgba(18,34,21,0.14)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/hero-food-delivery.jpg"
                    alt="Usul Penerima"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0a5a2f] mb-2 text-center">
                  Usul Penerima
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Rekomendasikan masyarakat pra-sejahtera atau panti asuhan di sekitarmu, agar donasi semakin merata dan tepat sasaran.
                </p>
              </div>

              <a href="#/terms" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Rekomendasikan</span>
                <span className="w-7 h-7 rounded-full bg-[#ffe602] text-[#0e2316] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 4: Jadi Relawan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2.5rem] border border-white p-6 flex flex-col justify-between shadow-[0_20px_30px_rgba(18,34,21,0.08)] hover:shadow-[0_24px_40px_rgba(18,34,21,0.14)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f5f5f7]">
                  <img
                    src="/images/hero-food-kitchen.jpg"
                    alt="Jadi Relawan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0a5a2f] mb-2 text-center">
                  Jadi Relawan
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Ayo ikut turun tangan langsung dan menjadi relawan Food Squad AksesPangan, apapun minat dan keahlian yang kamu miliki!
                </p>
              </div>

              <a href="#/register" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Daftar Relawan</span>
                <span className="w-7 h-7 rounded-full bg-[#ffe602] text-[#0e2316] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4: SPLIT FEATURE BANNER ("Anda Pemilik Bisnis Makanan?")
          Left: Chef / Kitchen Photo
          Right: Garda Forest Green #0A5A2F with Yellow #ffe602
          ============================================================ */}
      <section className="w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[400px]">
          {/* Left Photo */}
          <div className="relative w-full lg:w-1/2 min-h-[280px] lg:min-h-[400px]">
            <img
              src="/images/hero-food-kitchen.jpg"
              alt="Dapur Mitra Kuliner"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
          </div>

          {/* Right Garda Green Box */}
          <div className="relative flex w-full lg:w-1/2 flex-col items-start justify-center gap-6 bg-[#0A5A2F] px-8 py-12 sm:px-12 sm:py-16 lg:px-16 text-white">
            <div className="flex flex-col items-start gap-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] uppercase text-[#ffe602]">
                <Building2 size={13} />
                <span>KOLABORASI HOTEL &amp; RESTORAN</span>
              </span>
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight text-[#ffe602]">
                Anda pemilik bisnis makanan?
              </h2>
              <p className="max-w-md text-sm sm:text-base leading-relaxed text-white/85">
                Makanan berlebih Anda bisa memberi makan saudara-saudara kita yang membutuhkan, sementara sisa bahan makanan yang tidak dapat dikonsumsi dapat dimanfaatkan kembali menjadi pakan ternak.
                <br /><br />
                Tanpa repot, tim kami akan mengambilnya langsung dari lokasi Anda dan memberikan laporan dampak emisi ESG setiap bulannya. Jadilah mitra kami!
              </p>
            </div>

            <a href="#/register" className="btn-garda-pill-gold group">
              <span>Daftar Jadi Mitra</span>
              <span className="w-8 h-8 rounded-full bg-[#0e2316] text-[#ffe602] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: CURATED SURPLUS CATALOGUE (Interactive Real-Time Items)
          ============================================================ */}
      <section className="w-full py-20 px-6 sm:px-12 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-[rgba(0,0,0,0.08)]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#86868b] font-semibold block mb-1.5 font-mono">
                INVENTARIS SURPLUS AKTIF HARI INI
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#0e2316]">
                Katalog Makanan Tersedia
              </h2>
              <p className="text-[14px] text-[#555555] m-0 mt-1">
                Hidangan siap santap pilihan dari restoran terakreditasi, siap diselamatkan sebelum batas waktu berakhir.
              </p>
            </div>

            <a
              href="#/penerima"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0a5a2f] hover:underline mt-4 sm:mt-0"
            >
              <span>BUKA PETA GEOLOCATION</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-4 py-2 text-xs font-semibold tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap uppercase ${
                  selectedCategory === cat.id
                    ? 'bg-[#0a5a2f] text-white shadow-md'
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
                  className="bg-white rounded-3xl border border-[rgba(0,0,0,0.08)] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(10,90,47,0.12)] flex flex-col justify-between group transition-all"
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
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0a5a2f] text-white shadow-md">
                            GRATIS
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#0e2316]/90 backdrop-blur-md text-[#ffe602] border border-white/20 shadow-md">
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
                        <MapPin size={12} className="text-[#0a5a2f] shrink-0" />
                        <span className="truncate">{item.providerBusinessName} • {item.address}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#0e2316] mb-2 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed line-clamp-2 m-0">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-[#fbfdfc] border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                    <div className="text-xs text-amber-700 font-medium flex items-center gap-1.5 font-mono">
                      <Clock size={13} />
                      <span>Sisa {formatCountdown(item.expiryTime)}</span>
                    </div>

                    <a
                      href="#/penerima"
                      className="text-xs font-bold uppercase tracking-wider py-2 px-4 bg-[#0a5a2f] text-[#ffe602] hover:bg-[#0e2316] rounded-full transition-colors no-underline shadow-sm"
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
                className="text-xs font-bold uppercase tracking-wider text-[#0a5a2f] underline cursor-pointer"
              >
                Lihat Semua Kategori
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 6: PROTOKOL KEAMANAN (3 Pillars of Food Rescue)
          ============================================================ */}
      <section className="w-full py-24 px-6 sm:px-12 bg-[#0e2316] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#ffe602] block mb-2.5 font-mono">
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
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#ffe602]/40 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-[#ffe602] block mb-4">01</span>
                <h3 className="text-lg font-bold text-white mb-2">Unggah Surplus 60 Detik</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Restoran dan bakery terverifikasi mengunggah hidangan berlebih, porsi aman, dan batas kadaluwarsa melalui antarmuka khusus tanpa hambatan birokrasi.
                </p>
              </div>
              <a href="#/penyedia" className="text-xs font-bold uppercase tracking-wider text-[#ffe602] inline-flex items-center gap-1.5 hover:underline">
                <span>Alur Mitra Penyedia</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#ffe602]/40 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-[#ffe602] block mb-4">02</span>
                <h3 className="text-lg font-bold text-white mb-2">SOP Countdown 4 Jam</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Algoritma ketat menjaga rentang waktu konsumsi makanan. Setiap item yang melewati batas aman secara otomatis ditarik dari katalog publik.
                </p>
              </div>
              <a href="#/terms" className="text-xs font-bold uppercase tracking-wider text-[#ffe602] inline-flex items-center gap-1.5 hover:underline">
                <span>Panduan Keamanan Pangan</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#ffe602]/40 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-[#ffe602] block mb-4">03</span>
                <h3 className="text-lg font-bold text-white mb-2">Reduksi Emisi Metana Nyata</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Setiap kilogram makanan yang terselamatkan diverifikasi dalam laporan iklim ESG: 1 kg pangan setara pencegahan 2.5 kg gas rumah kaca CO₂e.
                </p>
              </div>
              <a href="#/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#ffe602] inline-flex items-center gap-1.5 hover:underline">
                <span>Telemetri Karbon</span>
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: FOOTER
          ============================================================ */}
      <footer className="w-full bg-[#08180e] text-white py-16 px-6 sm:px-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffe602] mb-4 font-mono">
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffe602] mb-4 font-mono">
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffe602] mb-4 font-mono">
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffe602] mb-4 font-mono">
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
              © 2026 AksesPangan. Gerakan Penyelamatan Makanan Indonesia. Terinspirasi oleh standar Garda Pangan.
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
