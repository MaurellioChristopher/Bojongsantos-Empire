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
  Utensils,
  Users,
  Scale,
  Quote,
  Activity,
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
    highlight: 'Pembuang Pangan Terbesar ke-2 di G20',
    fact: 'Indonesia merupakan negara pembuang sampah makanan terbesar kedua di antara negara G20! Sebanyak 23 hingga 48 juta ton makanan terbuang sia-sia setiap tahunnya.',
    source: 'Kajian Bappenas & Food Loss & Waste Indonesia',
  },
  {
    id: 2,
    highlight: 'Gas Metana 25x Lebih Merusak Iklim',
    fact: 'Sampah makanan yang membusuk di TPA menghasilkan gas metana (CH₄) yang memiliki potensi pemanasan iklim 25 kali lipat lebih agresif daripada karbon dioksida!',
    source: 'Kementerian Lingkungan Hidup & Kehutanan',
  },
  {
    id: 3,
    highlight: 'Sanggup Mencukupi Gizi 50% Populasi',
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

// Media Coverage (Clean Neutral Badges)
const mediaCoverage = [
  { name: 'BBC Indonesia', type: 'Global' },
  { name: 'Metro TV', type: 'Televisi' },
  { name: 'Kompas', type: 'Nasional' },
  { name: 'Jawa Pos', type: 'Surat Kabar' },
  { name: 'Liputan 6', type: 'Televisi' },
  { name: 'The Jakarta Post', type: 'Media' },
  { name: 'IDN Times', type: 'Digital' },
  { name: 'Trans 7', type: 'Televisi' },
  { name: 'Detikcom', type: 'Portal' },
  { name: 'Kumparan', type: 'Digital' },
];

const ecosystemPartners = [
  { name: 'Hotel Shangri-La', type: 'Mitra Hotel' },
  { name: 'Artotel Suites', type: 'Hospitality' },
  { name: 'Aloft Hotel', type: 'Mitra Dapur' },
  { name: 'Super Indo', type: 'Retail Segar' },
  { name: 'Lemonilo', type: 'Healthy Food' },
  { name: 'Badan Pangan Nasional', type: 'Instansi' },
  { name: 'Bappenas', type: 'Kementerian PPN' },
  { name: 'Koalisi Pangan Lestari', type: 'Aliansi ESG' },
];

export function LandingPage() {
  const [activeItems, setActiveItems] = useState<SurplusItem[]>([]);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFactIndex, setActiveFactIndex] = useState(0);

  // Responsive Scroll Track for the Camera Zoom Sequence
  const heroSequenceRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [portalCoords, setPortalCoords] = useState<{ cx: number; cy: number; radius: number }>({
    cx: 0,
    cy: 0,
    radius: 40,
  });

  useEffect(() => {
    const updateCoords = () => {
      if (portalRef.current) {
        const rect = portalRef.current.getBoundingClientRect();
        setPortalCoords({
          cx: Math.round(rect.left + rect.width / 2),
          cy: Math.round(rect.top + rect.height / 2),
          radius: Math.round(rect.width / 2),
        });
      }
    };
    // Update after initial render layout
    const timer = setTimeout(updateCoords, 60);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, []);

  const { scrollY } = useScroll();

  // ============================================================
  // SCROLL-DRIVEN MEDIA & CIRCLE IRIS APERTURE EXPANSION
  // Rest State (scrollY = 0): Background is an IMAGE, Video is inside 'O'
  // Scrolled (scrollY > 20px): Background transitions to VIDEO, Circle aperture expands
  // Stage 2 (scrollY > 500px): Telemetry & Did You Know materialize
  // ============================================================
  // Background Image: visible at rest, fades out as user scrolls
  const heroBgImageOpacity = useTransform(scrollY, [0, 160], [0.65, 0]);

  // Background Video: invisible at rest (0), fades in smoothly as user scrolls
  const heroBgVideoOpacity = useTransform(scrollY, [20, 200, 1250, 1450], [0, 0.6, 0.6, 0]);

  // Entire Hero Stage 1 typography & buttons fade out cleanly as scroll begins
  const heroStage1Opacity = useTransform(scrollY, [0, 130], [1, 0]);
  const heroSupportingOpacity = useTransform(scrollY, [0, 130], [1, 0]);
  const heroSupportingY = useTransform(scrollY, [0, 130], [0, -20]);
  const heroSupportingYReverse = useTransform(scrollY, [0, 130], [0, 20]);

  const letterOpacity = useTransform(scrollY, [15, 120], [1, 0]);
  const letterF_X = useTransform(scrollY, [15, 130], [0, -35]);
  const letterOD_X = useTransform(scrollY, [15, 130], [0, 35]);

  // Circle Iris Aperture Expansion (starts from 42px, expands to 1600px full bleed)
  const circleRadius = useTransform(scrollY, [0, 520], [42, 1600]);
  const circleClipPath = useTransform(circleRadius, (r) => `circle(${r}px at 50% 44%)`);

  // Expanding gold rim ring that traces the circle edge and gently fades
  const ringDiameter = useTransform(circleRadius, (r) => `${r * 2}px`);
  // At scrollY=0, ringOpacity is strictly 0 (no ghost/second ring)
  const ringOpacity = useTransform(scrollY, [0, 20, 380, 520], [0, 0.95, 0.6, 0]);

  // Full-bleed reveal video layer opacity (at scrollY=0 it is 0 so initial hero is 100% clean)
  const revealMediaOpacity = useTransform(scrollY, [0, 20, 1250, 1450], [0, 1, 1, 0]);

  // Stage 2 emerges pristine and crystal clear from the center once circle has expanded
  const stage2Opacity = useTransform(scrollY, [480, 700, 1250, 1450], [0, 1, 1, 0]);
  const stage2Y = useTransform(scrollY, [480, 700, 1250, 1450], [35, 0, 0, -40]);
  const stage2Scale = useTransform(scrollY, [480, 700], [0.95, 1]);

  // Soft smooth scroll trigger to dive into the next stage
  const handlePortalClick = () => {
    window.scrollTo({
      top: 850,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setActiveItems(getActiveSurplus());
    setImpact(calculateImpact());
  }, []);

  // Smooth auto-rotation for the educational facts
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFactIndex((prev) => (prev + 1) % educationalFacts.length);
    }, 6000);
    return () => clearInterval(timer);
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
    <div className="w-full bg-[#0a0a0c] text-[#1d1d1f] selection:bg-black selection:text-white">
      {/* ============================================================
          SECTION 1: HERO SCROLL-DRIVEN CAMERA ZOOM WITH VIDEO BACKGROUND
          - Background: Real Looping Video (/videos/hero-food.webm)
          - Letter 'O': Holds high-res food rescue photo, integrated inline into 'F[O]OD'
          - Zoom transition: Soft camera dive directly through the 'O' portal
          - Color: Obsidian black & warm gold accents (Zero annoying green!)
          ============================================================ */}
      <section ref={heroSequenceRef} className="relative w-full h-[260vh] bg-black">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
          {/* Static Background Image at Rest (Scroll = 0) */}
          <motion.div
            style={{ opacity: heroBgImageOpacity }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <img
              src="/images/hero-food-kitchen.jpg"
              alt="Hero Food Background"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>

          {/* Background Video that Fades In When Scrolled */}
          <motion.div
            style={{ opacity: heroBgVideoOpacity }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/images/hero-food-kitchen.jpg"
              className="w-full h-full object-cover object-center pointer-events-none"
            >
              <source src="/videos/hero-food.webm" type="video/webm" />
            </video>
          </motion.div>

          {/* Deep Cinematic Black Gradients for Pure Elegance */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_85%)] pointer-events-none" />

          {/* Fullscreen Video Revealed via Expanding Iris Circle as User Scrolls */}
          <motion.div
            style={{
              clipPath: circleClipPath,
              opacity: revealMediaOpacity,
            }}
            className="pointer-events-none absolute inset-0 z-10 will-change-[clip-path]"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/images/hero-food-kitchen.jpg"
              className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
            >
              <source src="/videos/hero-food.webm" type="video/webm" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/60 pointer-events-none" />
          </motion.div>

          {/* The Expanding Luxury Rim Ring that traces the iris circle perimeter */}
          <motion.div
            style={{
              width: ringDiameter,
              height: ringDiameter,
              opacity: ringOpacity,
            }}
            className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 sm:border-4 border-white shadow-[0_0_35px_rgba(255,255,255,0.7)] z-15 will-change-transform"
          />

          {/* Hero Content - Clean, Bold, Impactful Centered Title with Zero Clutter */}
          <motion.div
            style={{ opacity: heroStage1Opacity }}
            className="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-5xl select-none will-change-transform"
          >
            {/* Main Headline */}
            <div className="flex flex-col items-center justify-center leading-none">
              {/* Line 1: ONE STOP */}
              <motion.div
                style={{ opacity: heroSupportingOpacity, y: heroSupportingY }}
                className="font-serif text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold tracking-tight text-white uppercase leading-tight"
              >
                ONE STOP
              </motion.div>

              {/* Line 2: The Core Hero F[O]OD with VIDEO inside 'O' */}
              <div className="relative flex items-center justify-center whitespace-nowrap font-serif text-[clamp(4rem,9.5vw,8rem)] font-black uppercase tracking-tight leading-none text-white my-1 sm:my-2">
                <motion.span
                  style={{ opacity: letterOpacity, x: letterF_X }}
                  className="inline-block"
                >
                  F
                </motion.span>

                {/* The Inline Portal "O" with Video & Glowing Border */}
                <span className="relative inline-flex items-center justify-center mx-[0.06em] align-middle">
                  <div
                    ref={portalRef}
                    onClick={handlePortalClick}
                    className="relative size-[0.80em] rounded-full overflow-hidden border-[3px] sm:border-[4px] border-white shadow-[0_0_30px_rgba(255,255,255,0.7)] cursor-pointer flex items-center justify-center pointer-events-auto will-change-transform group bg-black"
                    title="Klik atau scroll untuk mengeksplorasi"
                  >
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      poster="/images/hero-food-kitchen.jpg"
                      className="w-full h-full object-cover pointer-events-none"
                    >
                      <source src="/videos/hero-food.webm" type="video/webm" />
                    </video>
                    <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none" />
                  </div>
                </span>

                <motion.span
                  style={{ opacity: letterOpacity, x: letterOD_X }}
                  className="inline-block"
                >
                  OD
                </motion.span>
              </div>

              {/* Line 3: RESCUE & SURPLUS SOLUTION */}
              <motion.div
                style={{ opacity: heroSupportingOpacity, y: heroSupportingYReverse }}
                className="font-serif text-[clamp(1.8rem,4.5vw,3.6rem)] font-bold tracking-tight uppercase leading-tight text-white whitespace-nowrap"
              >
                RESCUE &amp; SURPLUS <span className="text-white/80">SOLUTION</span>
              </motion.div>
            </div>

            {/* Clean Action Buttons Below the Headline */}
            <motion.div
              style={{ opacity: heroSupportingOpacity, y: heroSupportingYReverse }}
              className="flex flex-col items-center mt-8 sm:mt-10 pointer-events-auto"
            >
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="#/penerima" className="btn-garda-pill-gold group">
                  <span>AMBIL SURPLUS SEKARANG</span>
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </span>
                </a>
                <a href="#/penyedia" className="btn-garda-pill group">
                  <span className="text-white">GABUNG SEBAGAI MITRA</span>
                  <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </span>
                </a>
              </div>

              {/* Minimalist Down Chevron Indicator */}
              <button
                onClick={handlePortalClick}
                className="mt-8 text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Scroll ke bawah"
              >
                <ChevronDown size={22} className="animate-bounce" />
              </button>
            </motion.div>
          </motion.div>

          {/* Stage 2: Next Page Stage ("Tahukah Kamu?" Card + Real-Time Telemetry Counters)
              Emerges softly from inside the portal with video playing in background */}
          <motion.div
            style={{
              opacity: stage2Opacity,
              y: stage2Y,
              scale: stage2Scale,
            }}
            className="absolute z-30 top-1/2 -translate-y-1/2 inset-x-4 sm:inset-x-8 max-w-5xl mx-auto flex flex-col justify-center pointer-events-auto will-change-transform"
          >
            {/* Top Live Status Indicator Bar */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono tracking-widest font-bold uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>REAL-TIME FOOD RESCUE TELEMETRY</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 text-[11px] font-mono text-white/60 tracking-wider">
                <Activity size={13} className="text-white/80" />
                <span>MONITORING DARURAT PANGAN NASIONAL</span>
              </div>
            </div>

            {/* Top Educational Fact Card with Frosted Glass & Ambient Glow */}
            <div className="relative bg-[#0f0f13]/85 backdrop-blur-3xl border border-white/20 rounded-[2.2rem] p-6 sm:p-9 shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden mb-5 group hover:border-white/40 transition-all duration-500">
              {/* Ambient Light Reflection */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <Quote className="absolute right-6 top-6 size-24 text-white/[0.04] pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                {/* Left Title */}
                <div className="lg:col-span-4">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white mb-2.5 font-bold px-2.5 py-1 rounded-md bg-white/10 border border-white/20">
                    <Flame size={12} className="text-white/80" />
                    <span>DARURAT SAMPAH PANGAN</span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-[1.05] mb-2">
                    Tahukah <br /> Kamu?
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    Fakta nyata seputar krisis food waste dan potensi besar penyelamatan pangan di Indonesia.
                  </p>
                </div>

                {/* Right Fact Carousel */}
                <div className="lg:col-span-8 flex flex-col justify-between min-h-[140px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFactIndex}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35 }}
                      className="mb-4"
                    >
                      <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/25">
                        {educationalFacts[activeFactIndex].highlight}
                      </span>
                      <p className="text-base sm:text-xl font-medium text-white leading-relaxed mb-2 drop-shadow-sm">
                        "{educationalFacts[activeFactIndex].fact}"
                      </p>
                      <span className="text-[11px] text-white/50 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Sumber data: {educationalFacts[activeFactIndex].source}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      {educationalFacts.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFactIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            activeFactIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
                          }`}
                          aria-label={`Fakta ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevFact}
                        className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Fakta Sebelumnya"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={nextFact}
                        className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center cursor-pointer font-bold shadow-md"
                        aria-label="Fakta Selanjutnya"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 4-Counter Metrics Strip with Glassmorphism & Icons */}
            <div className="relative bg-[#0f0f13]/85 backdrop-blur-3xl border border-white/20 rounded-[2.2rem] p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Utensils size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">Porsi</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={825002} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Makanan Diselamatkan
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full bg-gradient-to-r from-white via-neutral-200 to-neutral-400 rounded-full w-[88%]" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">Jiwa</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={29294} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Penerima Manfaat
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full bg-gradient-to-r from-white via-neutral-200 to-neutral-400 rounded-full w-[74%]" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Scale size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">Kilogram</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={658000} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Pangan Tercegah TPA
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full bg-gradient-to-r from-white via-neutral-200 to-neutral-400 rounded-full w-[82%]" />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Leaf size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">KGCO₂-ek</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={1506416} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Emisi Gas Dicegah
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full bg-gradient-to-r from-white via-neutral-200 to-neutral-400 rounded-full w-[95%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Scroll Cue at the bottom of Stage 2 */}
            <div className="mt-3.5 flex items-center justify-center gap-2 text-[11px] font-mono text-white/60">
              <span>Scroll perlahan untuk menjelajahi katalog surplus &amp; ekosistem</span>
              <ChevronDown size={13} className="text-white/80 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: INFINITE SMOOTH MARQUEE TICKER (Seamless Dark Charcoal)
          Zero white blank spots: seamlessly connects from #000000 to #0f0f11
          ============================================================ */}
      <section className="w-full py-12 bg-[#0f0f12] border-y border-white/10 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-5 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/70 font-semibold">
            DILIPUT OLEH MEDIA &amp; TERHUBUNG DENGAN EKOSISTEM KULINER
          </span>
        </div>

        {/* Row 1 (Forward) */}
        <div className="relative overflow-hidden py-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-[#0f0f12] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-[#0f0f12] to-transparent" />

          <div className="animate-marquee gap-5">
            {[...mediaCoverage, ...mediaCoverage].map((item, idx) => (
              <div
                key={idx}
                className="h-11 px-5 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/40 transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-default select-none shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-sm font-bold text-white tracking-tight">{item.name}</span>
                <span className="text-[10px] uppercase font-mono text-white/90 font-semibold px-2 py-0.5 rounded-full bg-white/10">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 (Reverse) */}
        <div className="relative overflow-hidden py-1.5 mt-2.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-[#0f0f12] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-[#0f0f12] to-transparent" />

          <div className="animate-marquee-reverse gap-5">
            {[...ecosystemPartners, ...ecosystemPartners].map((item, idx) => (
              <div
                key={idx}
                className="h-11 px-5 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 hover:border-white/40 transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-default select-none shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="text-sm font-bold text-white tracking-tight">{item.name}</span>
                <span className="text-[10px] uppercase font-mono text-white/80 font-semibold px-2 py-0.5 rounded-full bg-white/10">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: "AYO JADI AGEN PERUBAHAN!" (4 Clean Action Cards)
          Background: Refined Soft Neutral Ivory #f8f8f9 with pure white cards
          ============================================================ */}
      <section className="w-full py-24 px-4 sm:px-8 bg-[#f8f8f9] border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] font-bold text-black leading-tight mb-3">
              Ayo jadi agen perubahan!
            </h2>
            <p className="max-w-xl text-base sm:text-lg text-[#555555] leading-relaxed">
              Mari bergabung dalam gerakan untuk menyelamatkan pangan yang berpotensi terbuang!
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Donasi Makanan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.08)] p-6 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f0f0f2]">
                  <img
                    src="/images/surplus-gourmet.jpg"
                    alt="Donasi Makanan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-black mb-2 text-center">
                  Donasi Makanan
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Donasikan makanan berlebih dari rumah, event, atau bisnismu; ketimbang dibuang dan merugikan lingkungan sekitarmu.
                </p>
              </div>

              <a href="#/penyedia/surplus" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Mulai Donasi</span>
                <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 2: Ambil Surplus */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.08)] p-6 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f0f0f2]">
                  <img
                    src="/images/surplus-bakery.jpg"
                    alt="Ambil Surplus"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-black mb-2 text-center">
                  Ambil Surplus
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Selamatkan aneka hidangan hangat bergizi gratis atau harga terjangkau dari dapur mitra restoran sebelum batas waktu habis.
                </p>
              </div>

              <a href="#/penerima" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Ambil Makanan</span>
                <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 3: Usul Penerima */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.08)] p-6 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f0f0f2]">
                  <img
                    src="/images/hero-food-delivery.jpg"
                    alt="Usul Penerima"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-black mb-2 text-center">
                  Usul Penerima
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Rekomendasikan masyarakat pra-sejahtera atau panti asuhan di sekitarmu, agar donasi semakin merata dan tepat sasaran.
                </p>
              </div>

              <a href="#/terms" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Rekomendasikan</span>
                <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 4: Jadi Relawan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-white rounded-[2rem] border border-[rgba(0,0,0,0.08)] p-6 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#f0f0f2]">
                  <img
                    src="/images/hero-food-kitchen.jpg"
                    alt="Jadi Relawan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-black mb-2 text-center">
                  Jadi Relawan
                </h3>
                <p className="text-xs text-[#6b7280] leading-relaxed text-center mb-6">
                  Ayo ikut turun tangan langsung dan menjadi relawan Food Squad AksesPangan, apapun minat dan keahlian yang kamu miliki!
                </p>
              </div>

              <a href="#/register" className="btn-garda-pill w-full">
                <span className="text-white text-xs">Daftar Relawan</span>
                <span className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
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
          Right: Sleek Charcoal Card with White Highlights (Apple Luxury Style)
          ============================================================ */}
      <section className="w-full overflow-hidden bg-[#111114]">
        <div className="flex flex-col lg:flex-row min-h-[400px]">
          {/* Left Photo */}
          <div className="relative w-full lg:w-1/2 min-h-[280px] lg:min-h-[400px]">
            <img
              src="/images/hero-food-kitchen.jpg"
              alt="Dapur Mitra Kuliner"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111114]/80 to-transparent lg:hidden" />
          </div>

          {/* Right Sleek Dark Box */}
          <div className="relative flex w-full lg:w-1/2 flex-col items-start justify-center gap-6 bg-[#111114] px-8 py-12 sm:px-12 sm:py-16 lg:px-16 text-white">
            <div className="flex flex-col items-start gap-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] uppercase text-white/80">
                <Building2 size={13} />
                <span>KOLABORASI HOTEL &amp; RESTORAN</span>
              </span>
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight text-white">
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
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: CURATED SURPLUS CATALOGUE (Interactive Real-Time Items)
          Pure crisp white surface with modern borders
          ============================================================ */}
      <section className="w-full py-20 px-6 sm:px-12 bg-white border-b border-[rgba(0,0,0,0.06)]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-[rgba(0,0,0,0.08)]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#86868b] font-semibold block mb-1.5 font-mono">
                INVENTARIS SURPLUS AKTIF HARI INI
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-black">
                Katalog Makanan Tersedia
              </h2>
              <p className="text-[14px] text-[#555555] m-0 mt-1">
                Hidangan siap santap pilihan dari restoran terakreditasi, siap diselamatkan sebelum batas waktu berakhir.
              </p>
            </div>

            <a
              href="#/penerima"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black hover:underline mt-4 sm:mt-0"
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
                    ? 'bg-black text-white shadow-md'
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
                  className="bg-white rounded-3xl border border-[rgba(0,0,0,0.08)] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] flex flex-col justify-between group transition-all"
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
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white text-black shadow-md">
                            GRATIS
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-black/90 backdrop-blur-md text-white border border-white/20 shadow-md">
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
                        <MapPin size={12} className="text-black shrink-0" />
                        <span className="truncate">{item.providerBusinessName} • {item.address}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-black mb-2 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#555555] leading-relaxed line-clamp-2 m-0">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-[#fafafc] border-t border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                    <div className="text-xs text-neutral-600 font-medium flex items-center gap-1.5 font-mono">
                      <Clock size={13} />
                      <span>Sisa {formatCountdown(item.expiryTime)}</span>
                    </div>

                    <a
                      href="#/penerima"
                      className="text-xs font-bold uppercase tracking-wider py-2 px-4 bg-black text-white hover:bg-[#222222] rounded-full transition-colors no-underline shadow-sm"
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
                className="text-xs font-bold uppercase tracking-wider text-black underline cursor-pointer"
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
      <section className="w-full py-24 px-6 sm:px-12 bg-[#0d0d0f] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/80 block mb-2.5 font-mono">
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
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-white block mb-4">01</span>
                <h3 className="text-lg font-bold text-white mb-2">Unggah Surplus 60 Detik</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Restoran dan bakery terverifikasi mengunggah hidangan berlebih, porsi aman, dan batas kadaluwarsa melalui antarmuka khusus tanpa hambatan birokrasi.
                </p>
              </div>
              <a href="#/penyedia" className="text-xs font-bold uppercase tracking-wider text-white inline-flex items-center gap-1.5 hover:underline">
                <span>Alur Mitra Penyedia</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-white block mb-4">02</span>
                <h3 className="text-lg font-bold text-white mb-2">SOP Countdown 4 Jam</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Algoritma ketat menjaga rentang waktu konsumsi makanan. Setiap item yang melewati batas aman secara otomatis ditarik dari katalog publik.
                </p>
              </div>
              <a href="#/terms" className="text-xs font-bold uppercase tracking-wider text-white inline-flex items-center gap-1.5 hover:underline">
                <span>Panduan Keamanan Pangan</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors flex flex-col justify-between">
              <div>
                <span className="font-serif text-3xl font-bold text-white block mb-4">03</span>
                <h3 className="text-lg font-bold text-white mb-2">Reduksi Emisi Metana Nyata</h3>
                <p className="text-xs text-white/70 leading-relaxed mb-6">
                  Setiap kilogram makanan yang terselamatkan diverifikasi dalam laporan iklim ESG: 1 kg pangan setara pencegahan 2.5 kg gas rumah kaca CO₂e.
                </p>
              </div>
              <a href="#/dashboard" className="text-xs font-bold uppercase tracking-wider text-white inline-flex items-center gap-1.5 hover:underline">
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
      <footer className="w-full bg-black text-white py-16 px-6 sm:px-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-mono">
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-mono">
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-mono">
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 font-mono">
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
              © 2026 AksesPangan. Gerakan Penyelamatan Makanan Indonesia.
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
