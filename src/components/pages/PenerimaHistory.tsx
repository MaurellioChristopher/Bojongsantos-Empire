'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, PackageCheck, Leaf, Calendar, ClipboardList, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getBookingsByRecipient } from '@/lib/data';
import { formatDateTime } from '@/lib/utils';
import { BOOKING_STATUS_LABELS } from '@/types';
import type { Booking, BookingStatus } from '@/types';

export function PenerimaHistory() {
  const { user, login } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      setBookings(
        getBookingsByRecipient(user.id)
          .filter((b) => ['diambil', 'dibatalkan', 'kedaluwarsa'].includes(b.status))
          .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
      );
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FBF7F0]">
        <div className="w-16 h-16 rounded-full bg-[#FFFDF9] flex items-center justify-center text-[#2C221D] mb-4 border border-[#EADECF] shadow-sm">
          <Clock size={32} />
        </div>
        <h2 className="text-display-md text-[#2C221D] mb-2">Riwayat Booking & Penyelamatan</h2>
        <p className="text-body-apple text-[#7D6F64] max-w-md mb-6">
          Silakan masuk ke akun Anda untuk melihat arsip lengkap makanan yang telah Anda klaim.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => login('penerima@aksespangan.id', 'penerima123')}
            className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-sm py-2.5 px-5 rounded-xl font-medium shadow-sm transition-all"
          >
            Masuk Akun Demo Penerima (1-Klik)
          </button>
          <a href="#/login" className="bg-[#F5EFEB] hover:bg-[#EADECF] text-[#2C221D] text-sm py-2.5 px-5 rounded-xl font-medium border border-[#EADECF] transition-colors">
            Masuk dengan Email
          </a>
        </div>
      </div>
    );
  }

  const statusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'diambil':
        return <span className="badge-apple badge-apple-success">Diambil Selesai</span>;
      case 'dibatalkan':
        return <span className="badge-apple badge-apple-error">Dibatalkan</span>;
      case 'kedaluwarsa':
        return <span className="badge-apple badge-apple-warning">Kedaluwarsa</span>;
      default:
        return <span className="badge-apple badge-apple-neutral">{BOOKING_STATUS_LABELS[status] || status}</span>;
    }
  };

  const totalSaved = bookings.filter((b) => b.status === 'diambil').reduce((sum, b) => sum + b.quantity, 0);
  const co2Saved = (totalSaved * 2.5).toFixed(1);

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Header */}
        <div className="mb-8">
          <a href="#/penerima" className="text-[#D95327] hover:text-[#B8401A] text-xs mb-2 inline-flex items-center gap-1 font-semibold">
            <ArrowLeft size={14} /> Kembali ke Beranda Penerima
          </a>
          <h1 className="text-display-lg text-[#2C221D]">Riwayat Booking</h1>
          <p className="text-body-apple text-[#7D6F64] m-0">
            Catatan komprehensif surplus makanan yang telah Anda klaim dan selamatkan.
          </p>
        </div>

        {/* Environmental Impact Highlight */}
        {totalSaved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#18110D] text-[#FAF6F0] p-6 sm:p-8 rounded-[20px] mb-8 relative overflow-hidden border border-[#2C2018] shadow-md"
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#D4C3AF] font-semibold mb-1 flex items-center gap-1.5">
                  <Leaf size={14} className="text-[#30d158]" /> Total Kontribusi Lingkungan
                </p>
                <div className="text-[44px] font-bold tracking-tight text-[#FAF6F0] leading-none mb-2">
                  {totalSaved} <span className="text-xl font-medium text-[#D4C3AF]">kg pangan diselamatkan</span>
                </div>
                <p className="text-body-apple text-[#D4C3AF] m-0 max-w-xl">
                  Setara dengan pemangkasan <span className="text-[#FAF6F0] font-medium">{co2Saved} kg CO₂e</span> emisi gas rumah kaca dari pembusukan pangan di tempat pembuangan akhir.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto bg-[#FAF6F0]/10 px-5 py-3 rounded-full border border-[#FAF6F0]/20">
                <PackageCheck size={20} className="text-[#30d158]" />
                <span className="text-sm font-semibold text-[#FAF6F0]">
                  {bookings.filter((b) => b.status === 'diambil').length} Transaksi Selesai
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* History List */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-tagline text-[#2C221D] font-bold">Daftar Transaksi</h2>
            <span className="text-caption-apple text-[#7D6F64]">{bookings.length} catatan</span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 text-[#7D6F64]">
              <ClipboardList size={36} className="text-[#A8988B] mx-auto mb-3" />
              <p className="text-body-strong text-[#2C221D] mb-1">Belum ada riwayat booking</p>
              <p className="text-caption-apple text-[#7D6F64] max-w-xs mx-auto mb-4">
                Saat Anda menyelesaikan atau membatalkan pesanan, riwayatnya akan tersimpan di sini.
              </p>
              <a href="#/penerima" className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] px-4 py-2 rounded-xl text-xs font-semibold inline-flex shadow-sm transition-all">
                Jelajahi Surplus Makanan
              </a>
            </div>
          ) : (
            <div className="divide-y divide-[#EADECF]">
              {bookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body-strong text-[#2C221D]">{b.surplusName}</h3>
                      {statusBadge(b.status)}
                    </div>
                    <p className="text-caption-apple text-[#7D6F64] mb-1">
                      Mitra Penyedia: <span className="text-[#2C221D] font-medium">{b.providerBusinessName}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#7D6F64]">
                      <span className="font-semibold text-[#2C221D] flex items-center gap-1">
                        <Scale size={12} /> {b.quantity} kg
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatDateTime(b.bookedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs text-[#7D6F64] font-mono">ID: {b.id.slice(0, 8)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
