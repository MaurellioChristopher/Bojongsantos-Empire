'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ClipboardList, CheckCircle, Plus, TrendingUp, ArrowRight, Store, Clock, Award, ShieldCheck, FileCheck, Sparkles, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSurplusByProvider, getBookingsByProvider, getUserBadges } from '@/lib/data';
import { surplusService } from '@/services/surplusService';
import { bookingService } from '@/services/bookingService';
import { formatCountdown, formatPrice } from '@/lib/utils';
import { FOOD_CATEGORY_EMOJI } from '@/types';
import type { SurplusItem, Booking } from '@/types';
import { EsgCertificateModal } from '@/components/certificates/EsgCertificateModal';

export function PenyediaDashboard() {
  const { user, login } = useAuth();
  const [surplus, setSurplus] = useState<SurplusItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showEsgModal, setShowEsgModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const providerId = user.id;
    async function load() {
      try {
        const [s, b] = await Promise.all([
          surplusService.getByProvider(providerId),
          bookingService.getByProvider(providerId),
        ]);
        setSurplus(s);
        setBookings(b);
      } catch {
        const [fallbackS, fallbackB] = await Promise.all([
          getSurplusByProvider(providerId),
          getBookingsByProvider(providerId),
        ]);
        setSurplus(fallbackS);
        setBookings(fallbackB);
      }
    }
    load();
  }, [user]);

  if (!user || user.role !== 'penyedia') {
    return (
      <div className="min-h-screen bg-[#F7F9F6] flex items-center justify-center p-4">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#EDF2EC] border border-[#DCE5DB] flex items-center justify-center mx-auto mb-4 text-[#143628]">
            <Store size={32} />
          </div>
          <h2 className="text-display-md text-[#143628] mb-2">Akses Terbatas</h2>
          <p className="text-body-apple text-[#597367] mb-6">
            Halaman ini khusus untuk mitra penyedia makanan surplus terverifikasi.
          </p>
          <a href="#/login" className="w-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] py-3 rounded-xl font-medium block text-sm transition-all shadow-sm">
            Masuk sebagai Mitra
          </a>
        </div>
      </div>
    );
  }

  const activeItems = surplus.filter((s) => s.status === 'active');
  const pendingBookings = bookings.filter((b) => b.status === 'menunggu');
  const completedBookings = bookings.filter((b) => b.status === 'diambil');
  const totalKg = completedBookings.reduce((sum, b) => sum + b.quantity, 0);
  const co2Saved = Math.round(totalKg * 2.5 * 10) / 10;
  const badges = getUserBadges(user.id, 'penyedia');
  const unlockedBadges = badges.filter((b) => b.isUnlocked).length;

  const stats = [
    { label: 'Surplus Aktif', value: activeItems.length, unit: 'item', icon: Package },
    { label: 'Booking Masuk', value: pendingBookings.length, unit: 'pesanan', icon: ClipboardList },
    { label: 'Makanan Disalurkan', value: totalKg, unit: 'kg', icon: CheckCircle },
    { label: 'Total Transaksi', value: completedBookings.length, unit: 'kali', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F6] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-caption-strong text-[#2D6A4F] uppercase tracking-wide mb-1 inline-block font-bold">
              Portal Mitra Usaha
            </span>
            <h1 className="text-display-lg text-[#143628]">
              {user.businessName || user.name}
            </h1>
            <p className="text-body-apple text-[#597367] m-0">
              Kelola stok makanan surplus dan pantau pesanan pengambilan masyarakat.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setShowEsgModal(true)}
              className="bg-[#FFFFFF] hover:bg-[#EDF2EC] text-[#143628] border border-[#DCE5DB] px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <Award size={16} className="text-[#2D6A4F]" />
              <span>Sertifikat Hijau ESG</span>
            </button>

            <a href="#/penyedia/surplus" className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm">
              <Plus size={16} /> Unggah Surplus Baru
            </a>
          </div>
        </div>

        {/* Subtle warm accent bar below header */}
        <div className="h-[3px] rounded-full mb-8 w-16 bg-[#2D6A4F]" />

        {/* ESG Impact Hero Banner */}
        <div className="bg-[#143628] text-white rounded-2xl p-6 sm:p-7 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest bg-white/15 px-2.5 py-0.5 rounded-full font-bold text-[#E5ECE4]">
                  Tanggung Jawab Berkelanjutan
                </span>
                <span className="text-[10px] font-mono text-[#DCE5DB]">• SDGs 2 & 12</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-1.5 flex items-center gap-2">
                <span>Mitra Hijau Ramah Lingkungan</span>
                <ShieldCheck size={20} className="text-[#8FB397]" />
              </h2>
              <p className="text-xs sm:text-sm text-[#DCE5DB] leading-relaxed">
                Unit usaha Anda telah menyalurkan <strong>{totalKg} kg</strong> pangan berkualitas dan berhasil mencegah potensi emisi sebesar <strong>{co2Saved} kg CO₂e</strong> ke atmosfer bumi.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowEsgModal(true)}
                className="bg-[#FAF7F2] hover:bg-white text-[#143628] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <FileCheck size={16} className="text-[#2D6A4F]" />
                <span>Unduh / Cetak Sertifikat ESG</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((st) => (
            <div key={st.label} className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-5 text-center shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] flex items-center justify-center mx-auto mb-3">
                <st.icon size={18} />
              </div>
              <div className="text-display-md font-semibold text-[#143628] mb-0.5">
                {st.value} <span className="text-xs font-normal text-[#597367]">{st.unit}</span>
              </div>
              <div className="text-caption-apple text-[#597367]">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Gamifikasi Pahlawan Pangan Mitra */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#DCE5DB]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EDF2EC] flex items-center justify-center text-lg border border-[#DCE5DB]">
                🎖️
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#143628] flex items-center gap-2">
                  <span>Pencapaian Pahlawan Pangan Mitra</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2D6A4F] text-white font-bold">
                    {unlockedBadges}/{badges.length} Terbuka
                  </span>
                </h3>
                <p className="text-[11px] text-[#597367] m-0">
                  Apresiasi atas kontribusi nyata bisnis Anda dalam mencegah food waste
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  b.isUnlocked
                    ? 'bg-[#FBFDFB] border-[#2D6A4F]/40 shadow-xs ring-1 ring-[#2D6A4F]/20'
                    : 'bg-[#FAF7F2]/60 border-[#DCE5DB] opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{b.icon}</span>
                    {b.isUnlocked ? (
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#2D6A4F] text-white">
                        Diraih
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#DCE5DB] text-[#597367]">
                        {b.currentCount}/{b.targetCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#143628] line-clamp-1">{b.title}</div>
                  <div className="text-[10px] text-[#597367] line-clamp-2 mt-0.5 leading-snug">
                    {b.description}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#DCE5DB]/70">
                  <div className="w-full bg-[#E5ECE4] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.isUnlocked ? 'bg-[#2D6A4F]' : 'bg-[#B8401A]'
                      }`}
                      style={{ width: `${b.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Surplus Items Section */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#DCE5DB]">
            <div>
              <h3 className="text-tagline text-[#143628] mb-0.5">Stok Surplus Aktif</h3>
              <p className="text-caption-apple text-[#597367] m-0">Makanan yang saat ini tampil di peta pencarian</p>
            </div>
            <a href="#/penyedia/surplus" className="text-[#2D6A4F] hover:text-[#B8401A] text-caption-strong flex items-center gap-1 font-semibold">
              Kelola Semua ({surplus.length}) <ArrowRight size={14} />
            </a>
          </div>

          {activeItems.length === 0 ? (
            <div className="text-center py-12 text-[#597367]">
              <Package size={32} className="text-[#A8988B] mx-auto mb-2" />
              <p className="text-body-apple m-0">Belum ada surplus aktif saat ini.</p>
              <a href="#/penyedia/surplus" className="text-[#2D6A4F] hover:underline text-sm mt-2 inline-block font-medium">
                + Tambah surplus makanan pertama Anda
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeItems.map((item) => (
                <div key={item.id} className="p-4 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB] flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] text-[#143628] font-semibold uppercase border border-[#DCE5DB]">
                        {item.foodCategory}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#143628] text-[#F3F8F5]">
                        {item.isFree ? 'Gratis' : formatPrice(item.price)}
                      </span>
                    </div>
                    <div className="text-body-strong text-[#143628] line-clamp-1 mb-1">{item.name}</div>
                    <div className="text-caption-apple text-[#597367] mb-2">{item.quantity} kg • {item.portionCount} porsi</div>
                  </div>
                  <div className="text-fine-print font-medium pt-2 border-t border-[#DCE5DB] flex items-center gap-1.5 text-[#2D6A4F]">
                    <Clock size={12} />
                    <span>Sisa waktu: {formatCountdown(item.expiryTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Bookings Section */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#DCE5DB]">
            <div>
              <h3 className="text-tagline text-[#143628] mb-0.5">Booking Menunggu Konfirmasi</h3>
              <p className="text-caption-apple text-[#597367] m-0">Permintaan pengambilan dari penerima manfaat</p>
            </div>
            <a href="#/penyedia/booking" className="text-[#2D6A4F] hover:text-[#B8401A] text-caption-strong flex items-center gap-1 font-semibold">
              Lihat Riwayat Booking <ArrowRight size={14} />
            </a>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="text-center py-8 text-[#597367]">
              <CheckCircle size={24} className="text-[#1b8a36] mx-auto mb-1" />
              <p className="text-body-apple m-0">Tidak ada booking yang menunggu konfirmasi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB] flex items-center justify-between">
                  <div>
                    <div className="text-body-strong text-[#143628]">{b.surplusName}</div>
                    <div className="text-caption-apple text-[#597367]">
                      Penerima: {b.recipientName} ({b.recipientPhone}) • Jumlah: {b.quantity} kg
                    </div>
                  </div>
                  <a href="#/penyedia/booking" className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                    Tinjau Pesanan
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ESG Green Certificate Modal */}
      <EsgCertificateModal
        isOpen={showEsgModal}
        onClose={() => setShowEsgModal(false)}
        user={user}
        totalKgSaved={totalKg}
        totalCompletedCount={completedBookings.length}
      />
    </div>
  );
}
