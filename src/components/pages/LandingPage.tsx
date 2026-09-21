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
import { formatCountdown, formatPrice, getSurplusPhoto } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
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
    highlight: '2nd Largest Food Waster in G20',
    fact: 'Indonesia is the second largest food-wasting nation among G20 countries! Between 23 and 48 million tons of food are wasted needlessly every year.',
    source: 'Bappenas & Food Loss & Waste Indonesia Study',
  },
  {
    id: 2,
    highlight: 'Methane Gas 25x More Climate Potent',
    fact: 'Food waste decomposing in landfills generates methane gas (CH₄), which has a global warming potential 25 times more potent than carbon dioxide!',
    source: 'Ministry of Environment & Forestry',
  },
  {
    id: 3,
    highlight: 'Can Nourish 28 Million Citizens',
    fact: 'If rescued systematically, quality food loss and surplus in Indonesia can fulfill the nutritional needs of up to 28 million vulnerable citizens and eliminate hunger.',
    source: 'World Resources Institute (WRI)',
  },
  {
    id: 4,
    highlight: '1 kg Food = 2.5 kg CO₂e Prevented',
    fact: 'Every single kilogram of meals redistributed to communities before spoiling directly prevents 2.5 kg of greenhouse gas emissions from polluting the atmosphere.',
    source: 'Intergovernmental Panel on Climate Change (IPCC)',
  },
];

// Media Coverage (Clean Neutral Badges)
const mediaCoverage = [
  { name: 'BBC Indonesia', type: 'Global' },
  { name: 'Metro TV', type: 'Television' },
  { name: 'Kompas', type: 'National' },
  { name: 'Jawa Pos', type: 'Newspaper' },
  { name: 'Liputan 6', type: 'Television' },
  { name: 'The Jakarta Post', type: 'Media' },
  { name: 'IDN Times', type: 'Digital' },
  { name: 'Trans 7', type: 'Television' },
  { name: 'Detikcom', type: 'Portal' },
  { name: 'Kumparan', type: 'Digital' },
];

const ecosystemPartners = [
  { name: 'Hotel Shangri-La', type: 'Hotel Partner' },
  { name: 'Artotel Suites', type: 'Hospitality' },
  { name: 'Aloft Hotel', type: 'Kitchen Partner' },
  { name: 'Super Indo', type: 'Fresh Retail' },
  { name: 'Lemonilo', type: 'Healthy Food' },
  { name: 'Badan Pangan Nasional', type: 'Agency' },
  { name: 'Bappenas', type: 'Gov Ministry' },
  { name: 'Koalisi Pangan Lestari', type: 'ESG Alliance' },
];

export function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeItems, setActiveItems] = useState<SurplusItem[]>([]);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFactIndex, setActiveFactIndex] = useState(0);

  // Responsive Scroll Track for the Camera Zoom Sequence
  const heroSequenceRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // ============================================================
  // SCROLL-DRIVEN CAMERA DIVE THROUGH THE 'O' PORTAL
  // The 'O' outline itself expands outwards from letter size to engulf the viewport,
  // naturally diving the viewer directly into Stage 2 ("Tahukah Kamu?" + Live Telemetry)
  // ============================================================
  // Background Image: visible at rest, fades out as user scrolls
  const heroBgImageOpacity = useTransform(scrollY, [0, 160], [0.65, 0]);

  // Background Video: invisible at rest (0), fades in smoothly as user scrolls
  const heroBgVideoOpacity = useTransform(scrollY, [20, 200, 1250, 1450], [0, 0.65, 0.65, 0]);

  // Hero Stage 1 supporting text and letters fade and slide away cleanly
  const heroSupportingOpacity = useTransform(scrollY, [0, 110], [1, 0]);
  const heroSupportingY = useTransform(scrollY, [0, 110], [0, -30]);
  const heroSupportingYReverse = useTransform(scrollY, [0, 110], [0, 30]);

  const letterOpacity = useTransform(scrollY, [15, 120], [1, 0]);
  const letterF_X = useTransform(scrollY, [15, 130], [0, -70]);
  const letterOD_X = useTransform(scrollY, [15, 130], [0, 70]);

  // Portal 'O' scales up from 1 to 38 (fills and exceeds viewport at scrollY ~ 500)
  const portalScale = useTransform(scrollY, (y) => {
    const progress = Math.min(Math.max(y, 0) / 500, 1);
    const eased = Math.pow(progress, 1.8);
    return 1 + 37 * eased;
  });

  // Counter-scale child video inside 'O': preserves crystal-clear resolution
  // while adding a subtle 15% cinematic forward zoom
  const videoCounterScale = useTransform(portalScale, (s) => {
    const netScale = 1 + 0.15 * Math.min((s - 1) / 37, 1);
    return netScale / s;
  });

  // Smooth subtle centering for the 'O' as it expands
  const portalX = useTransform(scrollY, [0, 200], [0, 22]);

  // Luxury glowing outline: thins slightly as it scales so the ring stays crisp and elegant
  const portalBorderWidth = useTransform(scrollY, [0, 500], ['3.5px', '0.9px']);

  // Portal opacity: stays 100% visible while expanding, fades out once fully off-screen
  const portalOpacity = useTransform(scrollY, [460, 540], [1, 0]);

  // Portal pointer events: disable when scaled up (> initial size) so buttons remain clickable
  const portalPointerEvents = useTransform(scrollY, (y) => (y > 5 ? 'none' : 'auto'));

  // Stage 2 emerges pristine and crystal clear from inside the expanded 'O'
  const stage2Opacity = useTransform(scrollY, [420, 560, 1250, 1450], [0, 1, 1, 0]);
  const stage2Y = useTransform(scrollY, [420, 560, 1250, 1450], [30, 0, 0, -40]);
  const stage2Scale = useTransform(scrollY, [420, 560], [0.94, 1]);
  // Disable pointer events on Stage 2 while invisible so hero buttons stay clickable
  const stage2PointerEvents = useTransform(stage2Opacity, (o) => (o > 0.05 ? 'auto' : 'none'));

  // Soft smooth scroll trigger to dive into the next stage
  const handlePortalClick = () => {
    window.scrollTo({
      top: 650,
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
    { id: 'all', label: 'ALL SURPLUS' },
    { id: 'nasi', label: 'MAIN MEALS' },
    { id: 'roti', label: 'PASTRY & BAKERY' },
    { id: 'sayur', label: 'FRESH PRODUCE' },
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
      case 'buah':
        return '/images/surplus-buah-potong.jpg';
      case 'nasi':
      default:
        return '/images/surplus-nasi-liwet.jpg';
    }
  };

  const filteredItems =
    selectedCategory === 'all'
      ? activeItems
      : activeItems.filter((i) => i.foodCategory === selectedCategory);

  return (
    <div className="w-full bg-[#0C2017] text-[#143628] selection:bg-[#143628] selection:text-[#F3F8F5]">
      {/* ============================================================
          SECTION 1: HERO SCROLL-DRIVEN CAMERA ZOOM WITH VIDEO BACKGROUND
          - Background: Real Looping Video (/videos/hero-food.webm)
          - Letter 'O': Holds high-res food rescue photo, integrated inline into 'F[O]OD'
          - Zoom transition: Soft camera dive directly through the 'O' portal
          - Color: Deep roasted cacao & warm artisanal honey accents
          ============================================================ */}
      <section ref={heroSequenceRef} className="relative w-full h-[260vh] bg-[#081710]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#081710] flex items-center justify-center">
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

          {/* Deep Cinematic Warm Cacao Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081710] via-[#081710]/45 to-[#081710]/85 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#081710_85%)] pointer-events-none" />

          {/* Hero Content - Clean, Bold, Impactful Centered Title with Zero Clutter */}
          <motion.div
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

              {/* Line 2: The Core Hero F[O]OD with expanding 'O' portal */}
              <div className="relative flex items-center justify-center whitespace-nowrap font-serif text-[clamp(4rem,9.5vw,8rem)] font-black uppercase tracking-tight leading-none text-white my-1 sm:my-2">
                <motion.span
                  style={{ opacity: letterOpacity, x: letterF_X }}
                  className="inline-block"
                >
                  F
                </motion.span>

                {/* The Inline Portal "O" that Zooms and Scales Outward to Fill the Screen */}
                <span className="relative inline-flex items-center justify-center mx-[0.06em] align-middle">
                  <motion.div
                    ref={portalRef}
                    onClick={handlePortalClick}
                    style={{
                      scale: portalScale,
                      x: portalX,
                      borderWidth: portalBorderWidth,
                      borderColor: '#2D6A4F',
                      boxShadow: '0 0 35px rgba(217,83,39,0.55), 0 0 70px rgba(200,70,30,0.35)',
                      opacity: portalOpacity,
                      pointerEvents: portalPointerEvents,
                    }}
                    className="relative size-[0.80em] rounded-full overflow-hidden border cursor-pointer flex items-center justify-center will-change-transform bg-black z-20 group"
                    title="Click or scroll to explore"
                  >
                    <motion.div
                      style={{
                        scale: videoCounterScale,
                        x: '-50%',
                        y: '-50%',
                      }}
                      className="absolute left-1/2 top-1/2 w-screen h-screen flex items-center justify-center pointer-events-none"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/50 pointer-events-none" />
                    </motion.div>
                    <div className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />
                  </motion.div>
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
                <a
                  href={isAuthenticated ? (user?.role === 'penerima' ? '#/penerima' : '#/' + user?.role) : '#/login'}
                  className="btn-garda-pill-gold group"
                >
                  <span>{isAuthenticated ? (user?.role === 'penerima' ? 'CLAIM SURPLUS NOW' : 'OPEN YOUR DASHBOARD') : 'CLAIM SURPLUS (SIGN IN)'}</span>
                  <span className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1 border border-white/30">
                    <ArrowRight size={14} />
                  </span>
                </a>
                <a
                  href={isAuthenticated ? (user?.role === 'penyedia' ? '#/penyedia' : '#/' + user?.role) : '#/register'}
                  className="btn-garda-pill group"
                >
                  <span className="text-white">JOIN AS A PARTNER</span>
                  <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                    <ArrowRight size={14} />
                  </span>
                </a>
              </div>

              {/* Minimalist Down Chevron Indicator */}
              <button
                onClick={handlePortalClick}
                className="mt-8 text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Scroll down"
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
              pointerEvents: stage2PointerEvents,
            }}
            className="absolute z-30 top-1/2 -translate-y-1/2 inset-x-4 sm:inset-x-8 max-w-5xl mx-auto flex flex-col justify-center will-change-transform"
          >
            {/* Top Live Status Indicator Bar */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono tracking-widest font-bold uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>REAL-TIME FOOD RESCUE TELEMETRY</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 text-[11px] font-mono text-white/60 tracking-wider">
                <Activity size={13} className="text-white/80" />
                <span>NATIONAL FOOD EMERGENCY MONITORING</span>
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
                    <span>FOOD WASTE EMERGENCY</span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-[1.05] mb-2">
                    Did You <br /> Know?
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed m-0">
                    Real facts on the food waste crisis and the enormous potential of food rescue in Indonesia.
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
                        &ldquo;{educationalFacts[activeFactIndex].fact}&rdquo;
                      </p>
                      <span className="text-[11px] text-white/50 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Data source: {educationalFacts[activeFactIndex].source}
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
                          aria-label={`Fact ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevFact}
                        className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Previous Fact"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={nextFact}
                        className="w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center cursor-pointer font-bold shadow-md"
                        aria-label="Next Fact"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 4-Counter Metrics Strip with Glassmorphism & Icons */}
            <div className="relative bg-[#1C1510]/90 backdrop-blur-3xl border border-[#F3F8F5]/15 rounded-[2.2rem] p-5 sm:p-6 shadow-[0_25px_70px_rgba(20,14,10,0.8)] overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Utensils size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">Portions</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={825002} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Food Rescued
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full rounded-full w-[88%]" style={{ background: 'linear-gradient(90deg, #2D6A4F, #1E5E41)' }} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">People</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={29294} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Beneficiaries Reached
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full rounded-full w-[74%]" style={{ background: 'linear-gradient(90deg, #2D6A4F, #1E5E41)' }} />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Scale size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">Kilograms</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={658000} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Diverted From Landfill
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full rounded-full w-[82%]" style={{ background: 'linear-gradient(90deg, #2D6A4F, #1E5E41)' }} />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="group p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/40 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <Leaf size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/60 font-semibold px-2 py-0.5 rounded-full bg-white/10">KGCO₂-eq</span>
                  </div>
                  <div className="text-white mb-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                    <AnimatedCounter value={1506416} />
                  </div>
                  <p className="text-[11px] uppercase tracking-wider text-white/80 font-medium m-0">
                    Emissions Prevented
                  </p>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-3">
                    <div className="h-full rounded-full w-[95%]" style={{ background: 'linear-gradient(90deg, #2D6A4F, #1E5E41)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Scroll Cue at the bottom of Stage 2 */}
            <div className="mt-3.5 flex items-center justify-center gap-2 text-[11px] font-mono text-white/60">
              <span>Scroll down gently to explore surplus catalog &amp; ecosystem</span>
              <ChevronDown size={13} className="text-white/80 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: INFINITE SMOOTH MARQUEE TICKER (Seamless Warm Cacao)
          Zero white blank spots: seamlessly connects from #081710 to #0C2017
          ============================================================ */}
      <section className="w-full py-12 bg-[#0C2017] border-y border-[#1D3E30] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-5 text-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#F3F8F5]/70 font-semibold">
            FEATURED IN MEDIA &amp; CONNECTED WITH THE CULINARY ECOSYSTEM
          </span>
        </div>

        {/* Row 1 (Forward) */}
        <div className="relative overflow-hidden py-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-[#0C2017] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-[#0C2017] to-transparent" />

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
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-[#0C2017] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-[#0C2017] to-transparent" />

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
          Background: Warm Toasted Oat Linen #F7F9F6 with Silky Cream cards
          ============================================================ */}
      <section className="w-full py-24 px-4 sm:px-8 bg-[#F7F9F6] border-b border-[#DCE5DB]">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] font-bold text-[#143628] leading-tight mb-3">
              Be an agent of change!
            </h2>
            <p className="max-w-xl text-base sm:text-lg text-[#597367] leading-relaxed">
              Join the collective movement to rescue edible surplus food from being needlessly wasted!
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Donasi Makanan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-[#FFFFFF] rounded-[2rem] border border-[#DCE5DB] p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(60,40,20,0.04)] hover:shadow-[0_16px_36px_rgba(60,40,20,0.08)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#EDF2EC]">
                  <img
                    src="/images/surplus-nasi-liwet.jpg"
                    alt="Donate Food"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#143628] mb-2 text-center">
                  Donate Food
                </h3>
                <p className="text-xs text-[#597367] leading-relaxed text-center mb-6">
                  Donate surplus food from your home, events, or business instead of discarding it and harming the surrounding environment.
                </p>
              </div>

              <a href="#/penyedia/surplus" className="w-full py-2.5 px-4 rounded-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-xs font-semibold flex items-center justify-between transition-all group shadow-2xs">
                <span>Start Donating</span>
                <span className="w-7 h-7 rounded-full bg-[#F3F8F5]/15 text-[#F3F8F5] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 2: Ambil Surplus */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-[#FFFFFF] rounded-[2rem] border border-[#DCE5DB] p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(60,40,20,0.04)] hover:shadow-[0_16px_36px_rgba(60,40,20,0.08)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#EDF2EC]">
                  <img
                    src="/images/surplus-bakery.jpg"
                    alt="Claim Surplus"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#143628] mb-2 text-center">
                  Claim Surplus
                </h3>
                <p className="text-xs text-[#597367] leading-relaxed text-center mb-6">
                  Rescue warm, nutritious meals for free or at heavily discounted rates from partner kitchens before expiry deadlines.
                </p>
              </div>

              <a href="#/penerima" className="w-full py-2.5 px-4 rounded-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-xs font-semibold flex items-center justify-between transition-all group shadow-2xs">
                <span>Claim Food</span>
                <span className="w-7 h-7 rounded-full bg-[#F3F8F5]/15 text-[#F3F8F5] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 3: Usul Penerima */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-[#FFFFFF] rounded-[2rem] border border-[#DCE5DB] p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(60,40,20,0.04)] hover:shadow-[0_16px_36px_rgba(60,40,20,0.08)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#EDF2EC]">
                  <img
                    src="/images/hero-food-delivery.jpg"
                    alt="Nominate Beneficiary"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#143628] mb-2 text-center">
                  Nominate Beneficiary
                </h3>
                <p className="text-xs text-[#597367] leading-relaxed text-center mb-6">
                  Recommend vulnerable communities or orphanages near you, ensuring surplus distributions are equitable and targeted.
                </p>
              </div>

              <a href="#/register" className="w-full py-2.5 px-4 rounded-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-xs font-semibold flex items-center justify-between transition-all group shadow-2xs">
                <span>Nominate</span>
                <span className="w-7 h-7 rounded-full bg-[#F3F8F5]/15 text-[#F3F8F5] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={13} />
                </span>
              </a>
            </motion.div>

            {/* Card 4: Jadi Relawan */}
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group bg-[#FFFFFF] rounded-[2rem] border border-[#DCE5DB] p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(60,40,20,0.04)] hover:shadow-[0_16px_36px_rgba(60,40,20,0.08)] transition-all"
            >
              <div>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[#EDF2EC]">
                  <img
                    src="/images/hero-food-kitchen.jpg"
                    alt="Become Volunteer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#143628] mb-2 text-center">
                  Become a Volunteer
                </h3>
                <p className="text-xs text-[#597367] leading-relaxed text-center mb-6">
                  Take direct action and join the AksesPangan Food Squad volunteer network, whatever your unique passions and talents!
                </p>
              </div>

              <a href="#/register" className="w-full py-2.5 px-4 rounded-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-xs font-semibold flex items-center justify-between transition-all group shadow-2xs">
                <span>Join Volunteers</span>
                <span className="w-7 h-7 rounded-full bg-[#F3F8F5]/15 text-[#F3F8F5] flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1">
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
      <section className="w-full overflow-hidden bg-[#0C2017]">
        <div className="flex flex-col lg:flex-row min-h-[400px]">
          {/* Left Photo */}
          <div className="relative w-full lg:w-1/2 min-h-[280px] lg:min-h-[400px]">
            <img
              src="/images/hero-food-kitchen.jpg"
              alt="Culinary Partner Kitchen"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C2017]/80 to-transparent lg:hidden" />
          </div>

          {/* Right Sleek Warm Cacao Box */}
          <div className="relative flex w-full lg:w-1/2 flex-col items-start justify-center gap-6 bg-[#0C2017] px-8 py-12 sm:px-12 sm:py-16 lg:px-16 text-[#F3F8F5]">
            <div className="flex flex-col items-start gap-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] uppercase text-[#F3F8F5]/80">
                <Building2 size={13} />
                <span>HOTEL &amp; RESTAURANT COLLABORATION</span>
              </span>
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-tight tracking-tight text-[#F3F8F5]">
                Do you own a food business?
              </h2>
              <p className="max-w-md text-sm sm:text-base leading-relaxed text-[#F3F8F5]/85">
                Your surplus meals can feed community members in need, while organic kitchen scraps that are no longer consumable can be diverted into animal feed.
                <br /><br />
                Completely hassle-free: our logistics team picks up directly from your doorstep and provides monthly ESG carbon emission reduction certificates. Become our partner!
              </p>
            </div>

            <a href="#/register" className="btn-garda-pill-gold group">
              <span>Partner With Us</span>
              <span className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1 border border-white/30">
                <ArrowRight size={14} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: CURATED SURPLUS CATALOGUE (Interactive Real-Time Items)
          Warm Toasted Oat Linen #F7F9F6 with Silky Cream cards
          ============================================================ */}
      <section className="w-full py-20 px-6 sm:px-12 bg-[#F7F9F6] border-b border-[#DCE5DB]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-5 border-b border-[#DCE5DB]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#597367] font-semibold block mb-1.5 font-mono">
                ACTIVE SURPLUS INVENTORY TODAY
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#143628]">
                Available Surplus Catalog
              </h2>
              <p className="text-[14px] text-[#597367] m-0 mt-1">
                Curated ready-to-eat dishes from certified culinary partners, ready to be rescued before the deadline.
              </p>
            </div>

            <a
              href={isAuthenticated && user?.role === 'penerima' ? '#/penerima' : '#/login'}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#2D6A4F] hover:opacity-75 transition-opacity mt-4 sm:mt-0"
            >
              <span>VIEW ALL IN CATALOG</span>
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
                    ? 'bg-[#143628] text-[#F3F8F5] shadow-sm'
                    : 'bg-[#FFFFFF] text-[#597367] border border-[#DCE5DB] hover:border-[#CAD6C8]'
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
                  className="bg-[#FFFFFF] rounded-3xl border border-[#DCE5DB] overflow-hidden shadow-[0_8px_24px_rgba(60,40,20,0.04)] hover:shadow-[0_16px_36px_rgba(60,40,20,0.08)] flex flex-col justify-between group transition-all"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#EDF2EC]">
                      <img
                        src={getSurplusPhoto(item)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 z-10">
                        {item.isFree ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#2D6A4F] text-white shadow-md">
                            FREE
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider bg-[#0C2017]/90 backdrop-blur-md text-[#F3F8F5] border border-[#F3F8F5]/20 shadow-md">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#0C2017]/75 backdrop-blur-md text-[#F3F8F5] border border-[#F3F8F5]/20">
                          {item.quantity} kg · {item.portionCount} portions
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      <div className="text-xs font-medium uppercase text-[#597367] mb-1.5 flex items-center gap-1">
                        <MapPin size={12} className="text-[#2D6A4F] shrink-0" />
                        <span className="truncate">{item.providerBusinessName} • {item.address}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#143628] mb-2 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#597367] leading-relaxed line-clamp-2 m-0">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-[#EDF2EC] border-t border-[#DCE5DB] flex items-center justify-between">
                    <div className="text-xs text-[#143628] font-medium flex items-center gap-1.5 font-mono">
                      <Clock size={13} className="text-[#597367]" />
                      <span>{formatCountdown(item.expiryTime)} left</span>
                    </div>

                    <a
                      href={isAuthenticated && user?.role === 'penerima' ? `#/penerima?item=${item.id}` : '#/login'}
                      className="text-xs font-bold uppercase tracking-wider py-2 px-4 bg-[#143628] text-[#F3F8F5] hover:bg-[#1C4736] rounded-full transition-colors no-underline shadow-2xs"
                    >
                      {isAuthenticated && user?.role === 'penerima' ? 'Claim Portion →' : 'Sign in to Claim →'}
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="w-full py-16 text-center bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB]">
              <p className="text-[#597367] text-sm mb-3">No active surplus in this category at this time.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold uppercase tracking-wider text-[#2D6A4F] underline cursor-pointer"
              >
                View All Categories
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 6: PROTOKOL KEAMANAN (3 Pillars of Food Rescue)
          Deep Roasted Cacao Atmosphere #0C2017
          ============================================================ */}
      <section className="w-full py-24 px-6 sm:px-12 bg-[#0C2017] text-[#F3F8F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#F3F8F5]/80 block mb-2.5 font-mono">
              SECURITY &amp; INTEGRITY PROTOCOLS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F8F5] mb-4">
              Fast. Hygienic. Targeted.
            </h2>
            <p className="text-[#F3F8F5]/70 text-sm leading-relaxed m-0">
              An automated food rescue system that preserves the dignity of every meal and guarantees consumption safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#241B15] border border-[#3D2D23] hover:border-[#2D6A4F]/50 transition-colors flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-serif text-3xl font-bold text-[#2D6A4F] block mb-4">01</span>
                <h3 className="text-lg font-bold text-[#F3F8F5] mb-2">60-Second Surplus Upload</h3>
                <p className="text-xs text-[#F3F8F5]/70 leading-relaxed mb-6">
                  Verified restaurants and bakeries upload surplus food, safe portions, and expiry deadlines through a specialized interface without bureaucratic delay.
                </p>
              </div>
              <a href="#/penyedia" className="text-xs font-bold uppercase tracking-wider text-[#F3F8F5] inline-flex items-center gap-1.5 hover:text-[#2D6A4F] transition-colors">
                <span>Provider Partner Flow</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-[#241B15] border border-[#3D2D23] hover:border-[#2D6A4F]/50 transition-colors flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-serif text-3xl font-bold text-[#2D6A4F] block mb-4">02</span>
                <h3 className="text-lg font-bold text-[#F3F8F5] mb-2">4-Hour Countdown SOP</h3>
                <p className="text-xs text-[#F3F8F5]/70 leading-relaxed mb-6">
                  Strict algorithms enforce safe consumption timeframes. Any item that passes the safe window is automatically delisted from the public catalog.
                </p>
              </div>
              <a href="#/terms" className="text-xs font-bold uppercase tracking-wider text-[#F3F8F5] inline-flex items-center gap-1.5 hover:text-[#2D6A4F] transition-colors">
                <span>Food Safety Guidelines</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-[#241B15] border border-[#3D2D23] hover:border-[#2D6A4F]/50 transition-colors flex flex-col justify-between shadow-sm">
              <div>
                <span className="font-serif text-3xl font-bold text-[#2D6A4F] block mb-4">03</span>
                <h3 className="text-lg font-bold text-[#F3F8F5] mb-2">Real Methane Emission Reduction</h3>
                <p className="text-xs text-[#F3F8F5]/70 leading-relaxed mb-6">
                  Every kilogram of food rescued is verified in transparent ESG climate reports: 1 kg food equals 2.5 kg CO₂e greenhouse gas reduction.
                </p>
              </div>
              <a href="#/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#F3F8F5] inline-flex items-center gap-1.5 hover:text-[#2D6A4F] transition-colors">
                <span>Carbon Telemetry</span>
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: FOOTER
          ============================================================ */}
      <footer className="w-full bg-[#081710] text-[#F3F8F5] py-16 px-6 sm:px-12 border-t border-[#2C2018]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F8F5] mb-4 font-mono">
                Catalog &amp; Food
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-[#F3F8F5]/70">
                <li><a href="#/penerima" className="hover:text-[#F3F8F5] transition-colors">Find Nearby Surplus</a></li>
                <li><a href="#/penerima" className="hover:text-[#F3F8F5] transition-colors">GPS Geolocation Map</a></li>
                <li><a href="#/penerima" className="hover:text-[#F3F8F5] transition-colors">Food Categories</a></li>
                <li><a href="#/terms" className="hover:text-[#F3F8F5] transition-colors">4-Hour Hygiene SOP</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F8F5] mb-4 font-mono">
                Provider Partners
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-[#F3F8F5]/70">
                <li><a href="#/register" className="hover:text-[#F3F8F5] transition-colors">Register Food Business</a></li>
                <li><a href="#/penyedia" className="hover:text-[#F3F8F5] transition-colors">Stock Management Dashboard</a></li>
                <li><a href="#/penyedia/surplus" className="hover:text-[#F3F8F5] transition-colors">Upload Surplus Food</a></li>
                <li><a href="#/penyedia/booking" className="hover:text-[#F3F8F5] transition-colors">Confirm Pickups</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F8F5] mb-4 font-mono">
                Environmental Impact
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-[#F3F8F5]/70">
                <li><a href="#/dashboard" className="hover:text-[#F3F8F5] transition-colors">Carbon Telemetry CO₂e</a></li>
                <li><a href="#/dashboard" className="hover:text-[#F3F8F5] transition-colors">Tree Absorption Equivalency</a></li>
                <li><a href="#/admin" className="hover:text-[#F3F8F5] transition-colors">Microservices Audit</a></li>
                <li><a href="#/dashboard" className="hover:text-[#F3F8F5] transition-colors">Transparent ESG Reports</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F8F5] mb-4 font-mono">
                Platform &amp; Legal
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5 text-xs text-[#F3F8F5]/70">
                <li><a href="#/terms" className="hover:text-[#F3F8F5] transition-colors">Terms &amp; Conditions</a></li>
                <li><a href="#/terms" className="hover:text-[#F3F8F5] transition-colors">Food Hygiene Policy</a></li>
                <li><a href="#/login" className="hover:text-[#F3F8F5] transition-colors">Sign In to Account</a></li>
                <li><a href="#/register" className="hover:text-[#F3F8F5] transition-colors">Register New Account</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2C2018] flex flex-col sm:flex-row items-center justify-between text-xs text-[#F3F8F5]/50">
            <p className="m-0 mb-3 sm:mb-0">
              © 2026 AksesPangan. Indonesian Food Rescue Movement.
            </p>
            <div className="flex gap-6">
              <a href="#/terms" className="hover:text-[#F3F8F5] transition-colors">Privacy</a>
              <a href="#/terms" className="hover:text-[#F3F8F5] transition-colors">Terms</a>
              <a href="#/terms" className="hover:text-[#F3F8F5] transition-colors">Quality Standards</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
