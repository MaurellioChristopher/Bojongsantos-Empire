'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ClipboardList, CheckCircle, Plus, TrendingUp, ArrowRight, Store, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSurplusByProvider, getBookingsByProvider } from '@/lib/data';
import { surplusService } from '@/services/surplusService';
import { bookingService } from '@/services/bookingService';
import { formatCountdown, formatPrice } from '@/lib/utils';
import { FOOD_CATEGORY_EMOJI } from '@/types';
import type { SurplusItem, Booking } from '@/types';

export function PenyediaDashboard() {
  const { user, login } = useAuth();
  const [surplus, setSurplus] = useState<SurplusItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

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
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center p-4">
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EFEB] border border-[#EADECF] flex items-center justify-center mx-auto mb-4 text-[#2C221D]">
            <Store size={32} />
          </div>
          <h2 className="text-display-md text-[#2C221D] mb-2">Akses Terbatas</h2>
          <p className="text-body-apple text-[#7D6F64] mb-6">
            Halaman ini khusus untuk mitra penyedia makanan surplus terverifikasi.
          </p>
          <a href="#/login" className="w-full bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] py-3 rounded-xl font-medium block text-sm transition-all shadow-sm">
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

  const stats = [
    { label: 'Surplus Aktif', value: activeItems.length, unit: 'item', icon: Package },
    { label: 'Booking Masuk', value: pendingBookings.length, unit: 'pesanan', icon: ClipboardList },
    { label: 'Makanan Disalurkan', value: totalKg, unit: 'kg', icon: CheckCircle },
    { label: 'Total Transaksi', value: completedBookings.length, unit: 'kali', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-caption-strong text-[#D95327] uppercase tracking-wide mb-1 inline-block font-bold">
              Portal Mitra Usaha
            </span>
            <h1 className="text-display-lg text-[#2C221D]">
              {user.businessName || user.name}
            </h1>
            <p className="text-body-apple text-[#7D6F64] m-0">
              Kelola stok makanan surplus dan pantau pesanan pengambilan masyarakat.
            </p>
          </div>

          <a href="#/penyedia/surplus" className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 self-start sm:self-auto transition-all shadow-sm">
            <Plus size={16} /> Unggah Surplus Baru
          </a>
        </div>

        {/* Subtle warm accent bar below header */}
        <div className="h-[3px] rounded-full mb-8 w-16 bg-[#D95327]" />

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((st) => (
            <div key={st.label} className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-5 text-center shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF2EB] text-[#D95327] border border-[#F2DACB] flex items-center justify-center mx-auto mb-3">
                <st.icon size={18} />
              </div>
              <div className="text-display-md font-semibold text-[#2C221D] mb-0.5">
                {st.value} <span className="text-xs font-normal text-[#7D6F64]">{st.unit}</span>
              </div>
              <div className="text-caption-apple text-[#7D6F64]">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Active Surplus Items Section */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-6 sm:p-8 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#EADECF]">
            <div>
              <h3 className="text-tagline text-[#2C221D] mb-0.5">Stok Surplus Aktif</h3>
              <p className="text-caption-apple text-[#7D6F64] m-0">Makanan yang saat ini tampil di peta pencarian</p>
            </div>
            <a href="#/penyedia/surplus" className="text-[#D95327] hover:text-[#B8401A] text-caption-strong flex items-center gap-1 font-semibold">
              Kelola Semua ({surplus.length}) <ArrowRight size={14} />
            </a>
          </div>

          {activeItems.length === 0 ? (
            <div className="text-center py-12 text-[#7D6F64]">
              <Package size={32} className="text-[#A8988B] mx-auto mb-2" />
              <p className="text-body-apple m-0">Belum ada surplus aktif saat ini.</p>
              <a href="#/penyedia/surplus" className="text-[#D95327] hover:underline text-sm mt-2 inline-block font-medium">
                + Tambah surplus makanan pertama Anda
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeItems.map((item) => (
                <div key={item.id} className="p-4 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF] flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFFDF9] text-[#2C221D] font-semibold uppercase border border-[#EADECF]">
                        {item.foodCategory}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2C221D] text-[#FAF6F0]">
                        {item.isFree ? 'Gratis' : formatPrice(item.price)}
                      </span>
                    </div>
                    <div className="text-body-strong text-[#2C221D] line-clamp-1 mb-1">{item.name}</div>
                    <div className="text-caption-apple text-[#7D6F64] mb-2">{item.quantity} kg • {item.portionCount} porsi</div>
                  </div>
                  <div className="text-fine-print font-medium pt-2 border-t border-[#EADECF] flex items-center gap-1.5 text-[#D95327]">
                    <Clock size={12} />
                    <span>Sisa waktu: {formatCountdown(item.expiryTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Bookings Section */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#EADECF]">
            <div>
              <h3 className="text-tagline text-[#2C221D] mb-0.5">Booking Menunggu Konfirmasi</h3>
              <p className="text-caption-apple text-[#7D6F64] m-0">Permintaan pengambilan dari penerima manfaat</p>
            </div>
            <a href="#/penyedia/booking" className="text-[#D95327] hover:text-[#B8401A] text-caption-strong flex items-center gap-1 font-semibold">
              Lihat Riwayat Booking <ArrowRight size={14} />
            </a>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="text-center py-8 text-[#7D6F64]">
              <CheckCircle size={24} className="text-[#1b8a36] mx-auto mb-1" />
              <p className="text-body-apple m-0">Tidak ada booking yang menunggu konfirmasi.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF] flex items-center justify-between">
                  <div>
                    <div className="text-body-strong text-[#2C221D]">{b.surplusName}</div>
                    <div className="text-caption-apple text-[#7D6F64]">
                      Penerima: {b.recipientName} ({b.recipientPhone}) • Jumlah: {b.quantity} kg
                    </div>
                  </div>
                  <a href="#/penyedia/booking" className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm">
                    Tinjau Pesanan
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
