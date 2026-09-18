'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, List, Map, Filter, Clock, Search, X, CheckCircle2, ChevronRight, AlertTriangle, Lock, Sparkles, Award, Flame, BookOpen, ChefHat } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getActiveSurplus, getBookingBySurplus, getUserBadges } from '@/lib/data';
import { getRecipeForIngredient } from '@/lib/recipes';
import { surplusService } from '@/services/surplusService';
import { bookingService } from '@/services/bookingService';
import { formatCountdown, formatPrice, calculateDistance, getSurplusPhoto } from '@/lib/utils';
import { FOOD_CATEGORY_LABELS, FOOD_CATEGORY_EMOJI, getSurplusItemType } from '@/types';
import { DEFAULT_CENTER } from '@/lib/constants';
import type { SurplusItem, FoodCategory, Coordinates, SurplusItemType, FoodHeroBadge, CulinaryRecipe } from '@/types';
import { CheckoutModal } from '@/components/surplus/CheckoutModal';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (SSR incompatible)
const MapComponent = dynamic(() => import('@/components/surplus/SurplusMap'), { ssr: false });

export function PenerimaDashboard() {
  const { user } = useAuth();
  const { success, warning } = useNotification();
  const [items, setItems] = useState<SurplusItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'siap_santap' | 'bahan_baku' | 'urgent'>('all');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedItem, setSelectedItem] = useState<SurplusItem | null>(null);
  const [recipeModalItem, setRecipeModalItem] = useState<SurplusItem | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const refreshItems = async () => {
    try {
      const data = await surplusService.getAll();
      setItems(data);
    } catch {
      setItems(getActiveSurplus());
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(user?.location || DEFAULT_CENTER)
      );
    }
    refreshItems();
  }, [user]);

  // Count items by type
  const typeCounts = useMemo(() => {
    const siapSantap = items.filter((i) => getSurplusItemType(i) === 'siap_santap').length;
    const bahanBaku = items.filter((i) => getSurplusItemType(i) === 'bahan_baku').length;
    const urgent = items.filter((i) => {
      const diffHours = (new Date(i.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 4;
    }).length;
    return {
      all: items.length,
      siapSantap,
      bahanBaku,
      urgent,
    };
  }, [items]);

  // Filter & sort items by distance and type
  const filteredItems = useMemo(() => {
    return items
      .map((item) => ({
        ...item,
        distance: calculateDistance(userLocation, item.location),
      }))
      .filter((item) => {
        if (itemTypeFilter === 'urgent') {
          const diffHours = (new Date(item.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
          if (diffHours <= 0 || diffHours > 4) return false;
        } else if (itemTypeFilter !== 'all' && getSurplusItemType(item) !== itemTypeFilter) {
          return false;
        }
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        if (selectedCategory !== 'all' && item.foodCategory !== selectedCategory) return false;
        if (priceFilter === 'free' && !item.isFree) return false;
        if (priceFilter === 'paid' && item.isFree) return false;
        return true;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [items, userLocation, searchQuery, itemTypeFilter, selectedCategory, priceFilter]);

  const handleBook = async (item: SurplusItem) => {
    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    setIsBookingLoading(true);
    try {
      await bookingService.create({
        surplusId: item.id,
        quantity: item.quantity,
        recipientId: user.id,
        recipientName: user.name,
        recipientPhone: user.phone || '08123456789',
      });

      success('Pemesanan Berhasil', `${item.name} telah dipesan. Dialihkan ke tiket pesanan Anda...`);
      setSelectedItem(null);
      refreshItems();
      setTimeout(() => {
        window.location.hash = '#/penerima/booking';
      }, 500);
    } catch (err: any) {
      warning('Perhatian', err.message || 'Item tidak dapat dipesan saat ini');
      refreshItems();
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Dynamic category options based on active tab
  const categories: { id: FoodCategory | 'all'; label: string }[] = useMemo(() => {
    if (itemTypeFilter === 'siap_santap') {
      return [
        { id: 'all', label: 'Semua Makanan Siap Santap' },
        { id: 'nasi', label: '🍚 Nasi & Lauk' },
        { id: 'roti', label: '🍞 Roti & Pastry' },
        { id: 'minuman', label: '🥤 Minuman' },
      ];
    }
    if (itemTypeFilter === 'bahan_baku') {
      return [
        { id: 'all', label: 'Semua Bahan Baku' },
        { id: 'sayur', label: '🥬 Sayuran Segar' },
        { id: 'buah', label: '🍎 Buah-buahan' },
        { id: 'lainnya', label: '📦 Bahan Pokok' },
      ];
    }
    return [
      { id: 'all', label: 'Semua Kategori' },
      { id: 'nasi', label: '🍚 Nasi & Lauk' },
      { id: 'roti', label: '🍞 Roti & Pastry' },
      { id: 'sayur', label: '🥬 Sayuran Segar' },
      { id: 'buah', label: '🍎 Buah-buahan' },
      { id: 'minuman', label: '🥤 Minuman' },
    ];
  }, [itemTypeFilter]);

  // Access Control: Guests must log in to view and order from Katalog Surplus
  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#143628] mb-4 border border-[#DCE5DB] shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">Akses Katalog Terkunci</h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Sesuai ketentuan platform, pengguna harus masuk sebagai <strong>Penerima Manfaat</strong> untuk menjelajahi Katalog Surplus dan melakukan pemesanan makanan.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a href="#/login" className="btn-apple-primary text-sm py-2.5 px-6">
            Masuk ke Akun Penerima
          </a>
          <a href="#/register" className="btn-apple-secondary text-sm py-2.5 px-6">
            Daftar Sebagai Penerima
          </a>
        </div>
      </div>
    );
  }

  // Access Control: Penyedia cannot order as Penerima
  if (user.role === 'penyedia') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#2D6A4F] mb-4 border border-[#DCE5DB] shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">Akses Dibatasi untuk Penyedia</h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Mitra Penyedia tidak dapat mengakses Katalog Surplus untuk memesan makanan sebagai Penerima. Silakan gunakan dashboard penyedia untuk mengelola stok surplus Anda.
        </p>
        <a href="#/penyedia" className="btn-apple-primary text-sm py-2.5 px-6">
          Kembali ke Dashboard Penyedia
        </a>
      </div>
    );
  }

  // Access Control: Admin cannot order as Penerima
  if (user.role === 'admin') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#143628] mb-4 border border-[#DCE5DB] shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">Akses Administrator</h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Akun Administrator tidak dapat melakukan pemesanan surplus sebagai Penerima.
        </p>
        <a href="#/admin" className="btn-apple-primary text-sm py-2.5 px-6">
          Kembali ke Dashboard Admin
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F6] py-8 px-4 sm:px-8">
      <div className="apple-container-wide">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-display-lg text-[#143628] mb-1">
            Katalog Penyelamatan Pangan
          </h1>
          <div className="h-[2px] rounded-full mb-2 w-16 bg-[#2D6A4F]" />
          <p className="text-body-apple text-[#597367]">
            Pilih kategori pangan surplus yang ingin Anda selamatkan: Makanan Siap Santap, Bahan Baku Segar, atau Segera Kedaluwarsa.
          </p>
        </div>

        {/* ============================================================
            GAMIFIKASI: BADGE PAHLAWAN PANGAN PENERIMA
            ============================================================ */}
        {(() => {
          const badges = user ? getUserBadges(user.id, 'penerima') : [];
          const unlockedCount = badges.filter((b) => b.isUnlocked).length;
          return (
            <div className="mb-6 p-4 rounded-2xl bg-[#FFFFFF] border border-[#DCE5DB] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EDF2EC] flex items-center justify-center text-lg border border-[#DCE5DB]">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#143628] flex items-center gap-1.5">
                      <span>Lencana Pahlawan Pangan Anda</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2D6A4F] text-white font-bold">
                        {unlockedCount}/{badges.length} Terbuka
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#597367]">
                      Lencana apresiasi atas aksi nyata penyelamatan pangan dan penurunan emisi lingkungan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                      b.isUnlocked
                        ? 'bg-[#FBFDFB] border-[#2D6A4F]/40 shadow-xs ring-1 ring-[#2D6A4F]/20'
                        : 'bg-[#FAF7F2]/50 border-[#DCE5DB] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-xl">{b.icon}</span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full font-bold ${
                        b.isUnlocked ? 'bg-[#2D6A4F] text-white' : 'bg-[#DCE5DB] text-[#597367]'
                      }`}>
                        {b.isUnlocked ? 'Terbuka' : `${b.progress}%`}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#143628] truncate">{b.title}</div>
                      <div className="text-[10px] text-[#597367] line-clamp-1 mt-0.5">{b.description}</div>
                    </div>
                    <div className="w-full bg-[#EDF2EC] rounded-full h-1 mt-2 overflow-hidden">
                      <div
                        className="bg-[#2D6A4F] h-1 rounded-full transition-all"
                        style={{ width: `${b.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ============================================================
            PROMINENT 4-DIVISION SWITCHER: SIAP SANTAP / BAHAN BAKU / SEGERA KEDALUWARSA / SEMUA
            ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {/* Tab 1: Makanan Siap Santap */}
          <button
            type="button"
            onClick={() => {
              setItemTypeFilter('siap_santap');
              setSelectedCategory('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              itemTypeFilter === 'siap_santap'
                ? 'bg-[#143628] text-white border-[#143628] shadow-md ring-2 ring-[#2D6A4F]/60'
                : 'bg-[#FFFFFF] text-[#143628] border-[#DCE5DB] hover:border-[#CAD6C8] hover:bg-[#EDF2EC]/40'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍲</span>
                <span className="font-bold text-sm tracking-tight">Siap Santap</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                itemTypeFilter === 'siap_santap' ? 'bg-[#2D6A4F] text-white' : 'bg-[#EDF2EC] text-[#143628]'
              }`}>
                {typeCounts.siapSantap} Item
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${
              itemTypeFilter === 'siap_santap' ? 'text-white/80' : 'text-[#597367]'
            }`}>
              Hidangan matang resto, kafe & katering siap konsumsi.
            </p>
          </button>

          {/* Tab 2: Bahan Baku Segar */}
          <button
            type="button"
            onClick={() => {
              setItemTypeFilter('bahan_baku');
              setSelectedCategory('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              itemTypeFilter === 'bahan_baku'
                ? 'bg-[#143628] text-white border-[#143628] shadow-md ring-2 ring-[#2D6A4F]/60'
                : 'bg-[#FFFFFF] text-[#143628] border-[#DCE5DB] hover:border-[#CAD6C8] hover:bg-[#EDF2EC]/40'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥬</span>
                <span className="font-bold text-sm tracking-tight">Bahan Baku</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                itemTypeFilter === 'bahan_baku' ? 'bg-[#2D6A4F] text-white' : 'bg-[#EDF2EC] text-[#143628]'
              }`}>
                {typeCounts.bahanBaku} Item
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${
              itemTypeFilter === 'bahan_baku' ? 'text-white/80' : 'text-[#597367]'
            }`}>
              Sayuran, beras, kentang & buah segar siap olah masak.
            </p>
          </button>

          {/* Tab 3: Segera Kedaluwarsa (Urgent Rescue Hub) */}
          <button
            type="button"
            onClick={() => {
              setItemTypeFilter('urgent');
              setSelectedCategory('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              itemTypeFilter === 'urgent'
                ? 'bg-[#B8401A] text-white border-[#B8401A] shadow-md ring-2 ring-red-400/60'
                : 'bg-[#FFFFFF] text-[#143628] border-[#DCE5DB] hover:border-[#CAD6C8] hover:bg-red-50/40'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span className="font-bold text-sm tracking-tight text-inherit">Darurat Pangan</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                itemTypeFilter === 'urgent' ? 'bg-white text-[#B8401A]' : 'bg-red-100 text-[#B8401A]'
              }`}>
                {typeCounts.urgent} Item
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${
              itemTypeFilter === 'urgent' ? 'text-white/90' : 'text-[#597367]'
            }`}>
              Batas waktu &lt; 4 jam. Prioritas penyelamatan utama!
            </p>
          </button>

          {/* Tab 4: Tampilkan Semua */}
          <button
            type="button"
            onClick={() => {
              setItemTypeFilter('all');
              setSelectedCategory('all');
            }}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
              itemTypeFilter === 'all'
                ? 'bg-[#143628] text-white border-[#143628] shadow-md ring-2 ring-[#2D6A4F]/60'
                : 'bg-[#FFFFFF] text-[#143628] border-[#DCE5DB] hover:border-[#CAD6C8] hover:bg-[#EDF2EC]/40'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍱</span>
                <span className="font-bold text-sm tracking-tight">Semua Pangan</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                itemTypeFilter === 'all' ? 'bg-[#2D6A4F] text-white' : 'bg-[#EDF2EC] text-[#143628]'
              }`}>
                {typeCounts.all} Total
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${
              itemTypeFilter === 'all' ? 'text-white/80' : 'text-[#597367]'
            }`}>
              Jelajahi seluruh persediaan surplus yang tersedia.
            </p>
          </button>
        </div>

        {/* Section Safety & Handling Banner */}
        <div className="mb-6 p-3.5 rounded-xl border bg-[#FFFFFF] border-[#DCE5DB] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            {itemTypeFilter === 'bahan_baku' ? (
              <>
                <span className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center font-bold text-base shrink-0">
                  🥬
                </span>
                <div>
                  <span className="font-bold text-[#143628]">Panduan Bahan Baku Mentah: </span>
                  <span className="text-[#597367]">
                    Bahan pangan mentah belum melalui proses memasak. Cuci bersih dengan air mengalir dan simpan pada suhu dingin/kulkas sebelum diolah.
                  </span>
                </div>
              </>
            ) : itemTypeFilter === 'siap_santap' ? (
              <>
                <span className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center font-bold text-base shrink-0">
                  🍲
                </span>
                <div>
                  <span className="font-bold text-[#143628]">Standar Makanan Siap Santap: </span>
                  <span className="text-[#597367]">
                    Makanan matang telah terverifikasi aman. Demi kesehatan, santap maksimal 4 jam sejak diambil atau panaskan kembali hingga suhu &gt;74°C.
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="w-8 h-8 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center font-bold text-base shrink-0">
                  🛡️
                </span>
                <div>
                  <span className="font-bold text-[#143628]">Katalog Terpadu: </span>
                  <span className="text-[#597367]">
                    Gunakan tab di atas untuk memilih secara spesifik antara <strong>Makanan Siap Santap</strong> (matang) atau <strong>Bahan Baku</strong> (mentah/segar).
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search Bar & View Controls (Apple Search Pill + Segmented Switcher) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Apple Search Input */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#597367]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                itemTypeFilter === 'bahan_baku'
                  ? 'Cari sayuran segar, buah, atau bahan dapur...'
                  : itemTypeFilter === 'siap_santap'
                  ? 'Cari hidangan nasi, lauk, roti matang, resto...'
                  : 'Cari makanan siap santap atau bahan baku...'
              }
              className="apple-search-pill"
            />
          </div>

          {/* Segmented View Switcher */}
          <div className="flex items-center bg-[#EDF2EC] border border-[#DCE5DB] rounded-full p-1 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-[#143628] text-[#F3F8F5] shadow-xs font-semibold'
                  : 'text-[#597367] hover:text-[#143628]'
              }`}
            >
              <List size={15} /> Daftar ({filteredItems.length})
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-[#143628] text-[#F3F8F5] shadow-xs font-semibold'
                  : 'text-[#597367] hover:text-[#143628]'
              }`}
            >
              <Map size={15} /> Peta
            </button>
          </div>
        </div>

        {/* Category Option Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`apple-chip ${
                selectedCategory === cat.id ? 'apple-chip-active' : ''
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="h-5 w-[1px] bg-[#DCE5DB] mx-1" />

          {/* Price Quick Filter */}
          <button
            onClick={() => setPriceFilter(priceFilter === 'free' ? 'all' : 'free')}
            className={`apple-chip ${
              priceFilter === 'free' ? 'apple-chip-active' : ''
            }`}
          >
            Hanya Gratis
          </button>
        </div>

        {/* Content View: List or Map */}
        {viewMode === 'map' ? (
          <div className="w-full h-[580px] rounded-[18px] overflow-hidden border border-[#DCE5DB] bg-[#FFFFFF] product-hero-shadow relative">
            <MapComponent
              items={filteredItems}
              center={userLocation}
              onItemClick={(item) => setSelectedItem(item)}
              selectedCategory={selectedCategory}
            />
          </div>
        ) : (
          <div>
            {filteredItems.length === 0 ? (
              <div className="bg-[#FFFFFF] rounded-[18px] p-12 text-center border border-[#DCE5DB] max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#EDF2EC] flex items-center justify-center mx-auto mb-3 text-[#597367]">
                  <Search size={22} />
                </div>
                <h3 className="text-body-strong text-[#143628] mb-1">Tidak Ada Makanan Ditemukan</h3>
                <p className="text-caption-apple text-[#597367] mb-4">
                  Coba ubah kata kunci atau ganti filter kategori.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceFilter('all');
                  }}
                  className="btn-apple-secondary text-sm"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const foodPhoto = getSurplusPhoto(item);
                  const diffHours = (new Date(item.expiryTime).getTime() - Date.now()) / (1000 * 60 * 60);
                  const isUrgent = diffHours > 0 && diffHours <= 4;
                  const isBahanBaku = getSurplusItemType(item) === 'bahan_baku';

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{
                        y: -6,
                        boxShadow: '0 20px 30px -10px rgba(44, 34, 29, 0.12), 0 8px 10px -6px rgba(44, 34, 29, 0.08)',
                      }}
                      className={`bg-[#FFFFFF] rounded-[18px] border overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-sm ${
                        isUrgent ? 'border-[#B8401A]/60 ring-1 ring-[#B8401A]/20' : 'border-[#DCE5DB] hover:border-[#CAD6C8]'
                      }`}
                    >
                      <div>
                        {/* Rich Food Image Banner / Background */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EDF2EC]">
                          <img
                            src={foodPhoto}
                            alt={item.name}
                            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                          />

                          {/* Vignette Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0C2017]/70 via-transparent to-[#0C2017]/20 pointer-events-none" />

                          {/* Top Left: Category Badge & Urgent Tag */}
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#0C2017]/70 backdrop-blur-md text-[#F3F8F5] border border-[#F3F8F5]/20 flex items-center shadow-sm">
                              <span>{FOOD_CATEGORY_LABELS[item.foodCategory] || item.foodCategory}</span>
                            </span>

                            {isUrgent && (
                              <span className="animate-pulse inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#B8401A] text-white shadow-md border border-white/20">
                                <span>⚡ Darurat &lt; 4 Jam</span>
                              </span>
                            )}
                          </div>

                          {/* Top Right: Price Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <span
                              className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm backdrop-blur-md ${
                                item.isFree
                                  ? 'bg-[#1b8a36] text-white border border-emerald-400/40'
                                  : 'bg-[#0C2017] text-[#F3F8F5] border border-[#F3F8F5]/20'
                              }`}
                            >
                              {item.isFree ? 'GRATIS' : formatPrice(item.price)}
                            </span>
                          </div>

                          {/* Bottom Left: Portions Tag */}
                          <div className="absolute bottom-3 left-3 z-10">
                            <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-[3px] bg-[#0C2017]/75 backdrop-blur-md text-[#F3F8F5] border border-[#F3F8F5]/15">
                              {item.quantity} kg · {item.portionCount} porsi
                            </span>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5">
                          <h3 className="text-body-strong text-[#143628] mb-1.5 line-clamp-1 group-hover:text-[#2D6A4F] transition-colors">
                            {item.name}
                          </h3>
                          <div className="text-caption-apple text-[#597367] mb-2.5 flex items-center gap-1.5">
                            <MapPin size={13} className="shrink-0 text-[#2D6A4F]" />
                            <span className="line-clamp-1">
                              {item.providerBusinessName} • {Math.round(item.distance * 10) / 10} km
                            </span>
                          </div>

                          <p className="text-caption-apple text-[#5A4D44] mb-2 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Area */}
                      <div className="px-5 pb-5 pt-3 border-t border-[#DCE5DB] bg-[#FAF7F2] flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#597367]">Sisa Waktu</span>
                          <div className={`text-caption-strong flex items-center gap-1 font-mono ${isUrgent ? 'text-[#B8401A] font-bold' : 'text-[#2D6A4F]'}`}>
                            <Clock size={12} />
                            <span>{formatCountdown(item.expiryTime)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isBahanBaku && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecipeModalItem(item);
                              }}
                              className="bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#2D6A4F] px-2.5 py-1.5 rounded-full text-[11px] font-semibold border border-[#DCE5DB] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Lihat Ide Olah Resep"
                            >
                              <span>💡</span>
                              <span className="hidden sm:inline">Ide Resep</span>
                            </button>
                          )}

                          <motion.button
                            onClick={() => setSelectedItem(item)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer transition-all shrink-0"
                          >
                            Detail & Pesan
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Smart Culinary Recipe Modal for Bahan Baku */}
      {recipeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C2017]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#DCE5DB] shadow-2xl p-6 text-[#143628] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {(() => {
              const recipe = getRecipeForIngredient(recipeModalItem.name);
              return (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE4] mb-4">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2D6A4F]">
                      <ChefHat size={16} />
                      <span>Ide Olah Bahan Baku Cerdas</span>
                    </div>
                    <button
                      onClick={() => setRecipeModalItem(null)}
                      className="p-1 rounded-lg text-[#597367] hover:text-[#143628] hover:bg-[#EDF2EC] cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-3 bg-[#F7F9F6] rounded-xl border border-[#DCE5DB] mb-4 flex items-center gap-3">
                    <img
                      src={getSurplusPhoto(recipeModalItem)}
                      alt={recipeModalItem.name}
                      className="w-12 h-12 rounded-lg object-cover border border-[#DCE5DB]"
                    />
                    <div>
                      <div className="text-[10px] font-mono text-[#597367] uppercase">Bahan Mentah Terkait</div>
                      <div className="text-xs font-bold text-[#143628]">{recipeModalItem.name}</div>
                      <div className="text-[10px] text-[#2D6A4F]">
                        Tersedia: {recipeModalItem.quantity} kg • {recipeModalItem.providerBusinessName}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-[#143628]">{recipe.title}</h3>
                      <span className="text-[10px] font-mono bg-[#EDF2EC] text-[#2D6A4F] px-2 py-0.5 rounded-full font-semibold">
                        {recipe.prepTime} • {recipe.portion}
                      </span>
                    </div>
                    <p className="text-xs text-[#597367] leading-relaxed">{recipe.description}</p>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-4 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#DCE5DB]">
                    <div className="text-xs font-bold text-[#143628] mb-2 flex items-center gap-1.5">
                      <span>🥗</span>
                      <span>Bahan-Bahan yang Dibutuhkan:</span>
                    </div>
                    <ul className="text-xs text-[#5A4D44] space-y-1 list-disc list-inside">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Steps */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-[#143628] mb-2 flex items-center gap-1.5">
                      <span>🍳</span>
                      <span>Langkah Memasak Praktis:</span>
                    </div>
                    <ol className="text-xs text-[#597367] space-y-2 list-decimal list-inside leading-relaxed">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="pl-1"><span className="text-[#143628]">{step}</span></li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  <div className="p-3 bg-[#EDF2EC] rounded-xl border border-[#DCE5DB] text-xs space-y-1.5 mb-5">
                    <div className="flex items-start gap-1.5 text-[#2D6A4F]">
                      <span className="font-bold shrink-0">🌿 Manfaat Gizi:</span>
                      <span className="text-[#143628]">{recipe.nutritionNote}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[#B8401A]">
                      <span className="font-bold shrink-0">♻️ Tips Zero-Waste:</span>
                      <span className="text-[#143628]">{recipe.zeroWasteTip}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(recipeModalItem);
                        setRecipeModalItem(null);
                      }}
                      className="flex-1 h-10 bg-[#143628] hover:bg-[#1C4736] text-white font-medium text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Pesan Bahan Baku Ini ({recipeModalItem.quantity} kg)</span>
                    </button>
                    <button
                      onClick={() => setRecipeModalItem(null)}
                      className="px-4 h-10 bg-white hover:bg-[#EDF2EC] text-[#143628] font-medium text-xs rounded-xl border border-[#DCE5DB] transition-all cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Interactive E-Commerce Checkout Modal with Safety Specs */}
      <CheckoutModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirmCheckout={handleBook}
        isLoading={isBookingLoading}
      />
    </div>
  );
}
