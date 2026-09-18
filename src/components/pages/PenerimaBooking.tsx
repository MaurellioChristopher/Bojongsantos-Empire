'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  ArrowLeft,
  Navigation,
  QrCode,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  X,
  MessageSquare,
  AlertCircle,
  Lock,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getBookingsByRecipient, updateBookingStatus } from '@/lib/data';
import { bookingService } from '@/services/bookingService';
import { formatCountdown, getRelativeTime, formatDateTime } from '@/lib/utils';
import { BOOKING_STATUS_LABELS } from '@/types';
import type { Booking, BookingStatus } from '@/types';
import { ChatModal } from '@/components/chat/ChatModal';

type OrderFilter = 'semua' | 'menunggu' | 'siap' | 'selesai' | 'dibatalkan';

export function PenerimaBooking() {
  const { user, login } = useAuth();
  const { success, warning } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('semua');
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [selectedChatBooking, setSelectedChatBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  const refresh = async () => {
    if (!user) return;
    try {
      const data = await bookingService.getByRecipient(user.id);
      setBookings(data.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()));
    } catch {
      setBookings(getBookingsByRecipient(user.id).sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()));
    }
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const handleConfirmPickup = async (booking: Booking) => {
    try {
      await bookingService.updateStatus(booking.id, 'diambil');
    } catch {
      updateBookingStatus(booking.id, 'diambil');
    }
    success('Pengambilan Selesai', `Terima kasih telah menyelamatkan ${booking.quantity} kg makanan.`);
    if (selectedTicket?.id === booking.id) setSelectedTicket(null);
    refresh();
  };

  const handleCancel = async (booking: Booking) => {
    try {
      await bookingService.updateStatus(booking.id, 'dibatalkan');
    } catch {
      updateBookingStatus(booking.id, 'dibatalkan');
    }
    warning('Pesanan Dibatalkan', `Pesanan ${booking.surplusName} telah dibatalkan.`);
    if (selectedTicket?.id === booking.id) setSelectedTicket(null);
    refresh();
  };

  if (!user || user.role !== 'penerima') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FBF7F0]">
        <div className="w-16 h-16 rounded-full bg-[#FFFDF9] flex items-center justify-center text-[#2C221D] mb-4 border border-[#EADECF] shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#2C221D] mb-2">Akses Khusus Penerima Manfaat</h2>
        <p className="text-body-apple text-[#7D6F64] max-w-md mb-6">
          Halaman ini khusus untuk Penerima Manfaat yang terdaftar untuk melihat pesanan makanan surplus.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => login('penerima@aksespangan.id', 'penerima123')}
            className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-sm py-2.5 px-5 rounded-xl font-medium shadow-sm transition-all"
          >
            Masuk Akun Demo Penerima (1-Klik)
          </button>
          <a href="#/login" className="bg-[#F5EFEB] hover:bg-[#EADECF] text-[#2C221D] text-sm py-2.5 px-5 rounded-xl font-medium border border-[#EADECF] transition-colors">
            Masuk dengan Akun Lain
          </a>
        </div>
      </div>
    );
  }

  // Filter bookings based on active filter tab
  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'semua') return true;
    if (activeFilter === 'menunggu') return b.status === 'menunggu';
    if (activeFilter === 'siap') return b.status === 'dikonfirmasi';
    if (activeFilter === 'selesai') return b.status === 'diambil';
    if (activeFilter === 'dibatalkan') return ['dibatalkan', 'kedaluwarsa'].includes(b.status);
    return true;
  });

  const activeCount = bookings.filter((b) => ['menunggu', 'dikonfirmasi'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === 'diambil').length;

  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'menunggu':
        return <span className="badge-apple badge-apple-warning">Menunggu Konfirmasi</span>;
      case 'dikonfirmasi':
        return <span className="badge-apple badge-apple-info">Siap Diambil</span>;
      case 'diambil':
        return <span className="badge-apple badge-apple-success">Selesai Diambil</span>;
      case 'dibatalkan':
        return <span className="badge-apple badge-apple-neutral text-red-600">Dibatalkan</span>;
      case 'kedaluwarsa':
        return <span className="badge-apple badge-apple-neutral">Kedaluwarsa</span>;
      default:
        return <span className="badge-apple badge-apple-neutral">{BOOKING_STATUS_LABELS[status] || status}</span>;
    }
  };

  const getStepProgress = (status: BookingStatus) => {
    if (status === 'menunggu') return 1;
    if (status === 'dikonfirmasi') return 2;
    if (status === 'diambil') return 3;
    return 0; // cancelled or expired
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Top Navigation & Title Bar */}
        <div className="mb-6">
          <a href="#/penerima" className="text-[#D95327] hover:text-[#B8401A] text-xs mb-2 inline-flex items-center gap-1 font-semibold">
            <ArrowLeft size={14} /> Kembali ke Katalog Makanan
          </a>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-display-lg text-[#2C221D] mb-1">
                Pesanan &amp; Status Penyelamatan Saya
              </h1>
              <p className="text-body-apple text-[#7D6F64] m-0">
                Pantau verifikasi mitra, koordinasi via chat, dan konfirmasi saat makanan diterima.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="bg-[#FFFDF9] hover:bg-[#F5EFEB] text-xs py-2 px-3.5 flex items-center gap-1.5 text-[#2C221D] border border-[#EADECF] rounded-xl shadow-xs transition-colors"
              >
                <AlertCircle size={14} className="text-[#D95327]" />
                <span>Bantuan Admin</span>
              </button>

              <div className="flex items-center gap-2 bg-[#FFFDF9] px-4 py-2 rounded-full border border-[#EADECF] shadow-xs">
                <ShoppingBag size={15} className="text-[#2C221D]" />
                <span className="text-xs font-semibold text-[#2C221D]">
                  {activeCount} Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#EADECF]">
          <button
            onClick={() => setActiveFilter('semua')}
            className={`apple-chip text-xs py-2 px-4 ${
              activeFilter === 'semua' ? 'apple-chip-active' : ''
            }`}
          >
            Semua Pesanan ({bookings.length})
          </button>
          <button
            onClick={() => setActiveFilter('menunggu')}
            className={`apple-chip text-xs py-2 px-4 ${
              activeFilter === 'menunggu' ? 'apple-chip-active' : ''
            }`}
          >
            Menunggu Konfirmasi ({bookings.filter((b) => b.status === 'menunggu').length})
          </button>
          <button
            onClick={() => setActiveFilter('siap')}
            className={`apple-chip text-xs py-2 px-4 ${
              activeFilter === 'siap' ? 'apple-chip-active' : ''
            }`}
          >
            Siap Diambil ({bookings.filter((b) => b.status === 'dikonfirmasi').length})
          </button>
          <button
            onClick={() => setActiveFilter('selesai')}
            className={`apple-chip text-xs py-2 px-4 ${
              activeFilter === 'selesai' ? 'apple-chip-active' : ''
            }`}
          >
            Selesai ({completedCount})
          </button>
          <button
            onClick={() => setActiveFilter('dibatalkan')}
            className={`apple-chip text-xs py-2 px-4 ${
              activeFilter === 'dibatalkan' ? 'apple-chip-active' : ''
            }`}
          >
            Dibatalkan ({bookings.filter((b) => ['dibatalkan', 'kedaluwarsa'].includes(b.status)).length})
          </button>
        </div>

        {/* Orders List / Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#F5EFEB] flex items-center justify-center mx-auto mb-3 text-[#7D6F64]">
              <ShoppingBag size={22} />
            </div>
            <h3 className="text-body-strong text-[#2C221D] mb-1">
              Tidak Ada Pesanan {activeFilter !== 'semua' ? `Status "${activeFilter.toUpperCase()}"` : ''}
            </h3>
            <p className="text-caption-apple text-[#7D6F64] mb-6">
              Jelajahi restoran dan toko di katalog untuk menyelamatkan makanan berlebih hari ini.
            </p>
            <a href="#/penerima" className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-xs py-2.5 px-5 rounded-xl font-medium shadow-sm transition-all inline-block">
              Cari Makanan di Katalog
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((b) => {
              const currentStep = getStepProgress(b.status);

              return (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-6 sm:p-8 space-y-5 shadow-xs"
                >
                  {/* Top Order Meta Info (Store Name & Status) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EADECF]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#FAF7F2] border border-[#EADECF] flex items-center justify-center text-[#2C221D]">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="text-body-strong text-[#2C221D] flex items-center gap-2">
                          <span>{b.providerBusinessName}</span>
                          <span className="text-fine-print text-[#7D6F64] font-mono">
                            ID: #{b.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="text-fine-print text-[#7D6F64]">
                          Dipesan pada: {formatDateTime(b.bookedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {renderStatusBadge(b.status)}
                    </div>
                  </div>

                  {/* Tracking Progress Bar */}
                  {['menunggu', 'dikonfirmasi', 'diambil'].includes(b.status) && (
                    <div className="p-5 sm:p-6 rounded-[20px] bg-[#FAF7F2] border border-[#EADECF] shadow-xs">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#2C221D] mb-6">
                        <span className="flex items-center gap-2 text-sm font-bold">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
                          Status Penyelamatan Makanan
                        </span>
                        {b.status === 'dikonfirmasi' && (
                          <span className="text-[#2C221D] font-semibold flex items-center gap-1.5 bg-[#FFFDF9] py-1.5 px-3.5 rounded-full border border-[#EADECF] shadow-xs text-xs">
                            <Clock size={14} className="text-[#D95327]" /> Sisa Waktu Ambil: {formatCountdown(b.pickupDeadline)}
                          </span>
                        )}
                        {b.status === 'menunggu' && (
                          <span className="text-[#2C221D] font-medium text-xs bg-[#FFFDF9] border border-[#EADECF] px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock size={13} className="text-[#7D6F64]" /> Menunggu konfirmasi toko
                          </span>
                        )}
                        {b.status === 'diambil' && (
                          <span className="text-emerald-700 font-medium text-xs bg-[#FFFDF9] border border-[#EADECF] px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-600" /> Selesai Diselamatkan
                          </span>
                        )}
                      </div>

                      {/* Flex Stepper */}
                      <div className="flex items-start justify-between w-full relative px-2 sm:px-4">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center z-10 min-w-[70px]">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                              currentStep >= 1
                                ? 'bg-[#2C221D] text-[#FAF6F0] ring-4 ring-[#2C221D]/10'
                                : 'bg-[#FFFDF9] text-[#7D6F64] border border-[#EADECF]'
                            }`}
                          >
                            {currentStep > 1 ? <CheckCircle2 size={16} /> : '1'}
                          </div>
                          <span className="text-[12px] font-semibold text-[#2C221D] mt-2.5 text-center">
                            Dipesan
                          </span>
                          <span className="text-[10px] text-[#7D6F64] mt-0.5">
                            {formatDateTime(b.bookedAt).split(',')[1] || ''}
                          </span>
                        </div>

                        {/* Connector Line 1 -> 2 */}
                        <div className="flex-1 h-[3px] mx-2 mt-4 bg-[#EADECF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2C221D] transition-all duration-500 rounded-full"
                            style={{ width: currentStep >= 2 ? '100%' : '0%' }}
                          />
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center z-10 min-w-[90px]">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                              currentStep >= 2
                                ? 'bg-[#2C221D] text-[#FAF6F0] ring-4 ring-[#2C221D]/10'
                                : 'bg-[#FFFDF9] text-[#7D6F64] border border-[#EADECF]'
                            }`}
                          >
                            {currentStep > 2 ? <CheckCircle2 size={16} /> : '2'}
                          </div>
                          <span className="text-[12px] font-semibold text-[#2C221D] mt-2.5 text-center">
                            Konfirmasi Mitra
                          </span>
                          <span className="text-[10px] text-[#7D6F64] mt-0.5">
                            {currentStep >= 2 ? 'Disetujui' : 'Menunggu'}
                          </span>
                        </div>

                        {/* Connector Line 2 -> 3 */}
                        <div className="flex-1 h-[3px] mx-2 mt-4 bg-[#EADECF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#16a34a] transition-all duration-500 rounded-full"
                            style={{ width: currentStep >= 3 ? '100%' : '0%' }}
                          />
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center z-10 min-w-[70px]">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                              currentStep >= 3
                                ? 'bg-[#16a34a] text-white ring-4 ring-[#16a34a]/20'
                                : 'bg-[#FFFDF9] text-[#7D6F64] border border-[#EADECF]'
                            }`}
                          >
                            {currentStep === 3 ? <CheckCircle2 size={16} /> : '3'}
                          </div>
                          <span className="text-[12px] font-semibold text-[#2C221D] mt-2.5 text-center">
                            Sudah Diambil
                          </span>
                          <span className="text-[10px] text-[#7D6F64] mt-0.5">
                            {currentStep === 3 ? 'Selesai' : 'Siap Diambil'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Food Item Details Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-[12px] bg-[#FAF7F2] border border-[#EADECF] flex items-center justify-center text-[#2C221D] flex-shrink-0">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <h4 className="text-body-strong text-[#2C221D] mb-0.5">
                          {b.surplusName}
                        </h4>
                        <div className="text-caption-apple text-[#7D6F64] space-y-0.5">
                          <div className="flex items-center gap-1 text-[#2C221D]">
                            <MapPin size={13} className="text-[#D95327]" />
                            <span>{b.pickupAddress}</span>
                          </div>
                          <div>
                            Jumlah: <span className="font-semibold text-[#2C221D]">{b.quantity} kg</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#EADECF] justify-end">
                      {['menunggu', 'dikonfirmasi'].includes(b.status) && (
                        <button
                          onClick={() => setSelectedTicket(b)}
                          className="bg-[#FFFDF9] hover:bg-[#F5EFEB] text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 text-[#2C221D] border border-[#EADECF] shadow-xs transition-colors"
                        >
                          <QrCode size={14} /> Tiket Ambil QR
                        </button>
                      )}

                      {['menunggu', 'dikonfirmasi'].includes(b.status) && (
                        <button
                          onClick={() => setSelectedChatBooking(b)}
                          className="bg-[#FFFDF9] hover:bg-[#F5EFEB] text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 text-[#2C221D] border border-[#EADECF] shadow-xs hover:border-[#D95327] transition-colors"
                        >
                          <MessageSquare size={14} className="text-[#D95327]" />
                          <span>{b.status === 'menunggu' ? 'Chat Konfirmasi' : 'Chat Koordinasi'}</span>
                        </button>
                      )}

                      {b.status === 'menunggu' && (
                        <button
                          onClick={() => setCancelModalBooking(b)}
                          className="bg-[#FFFDF9] text-xs py-2 px-3.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Batalkan
                        </button>
                      )}

                      {b.status === 'dikonfirmasi' && (
                        <>
                          <button
                            onClick={() => setCancelModalBooking(b)}
                            className="bg-[#FFFDF9] text-xs py-2 px-3 rounded-xl border border-[#EADECF] text-[#7D6F64] hover:text-red-600 hover:border-red-300 transition-colors"
                            title="Batalkan jika ada kendala darurat"
                          >
                            Batalkan
                          </button>
                          <button
                            onClick={() => handleConfirmPickup(b)}
                            className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-xs py-2 px-4 rounded-xl font-medium shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <PackageCheck size={15} /> Konfirmasi Makanan Diterima
                          </button>
                        </>
                      )}

                      {b.status === 'diambil' && (
                        <div className="text-xs text-[#15803d] font-semibold flex items-center gap-1">
                          <CheckCircle2 size={16} /> Diselamatkan Selesai
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Digital Pickup Ticket & QR Code Simulator Modal */}
        <AnimatePresence>
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18110D]/60 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#FFFDF9] rounded-[24px] max-w-md w-full p-6 sm:p-8 border border-[#EADECF] shadow-2xl relative text-center text-[#2C221D]"
              >
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#7D6F64] hover:text-[#2C221D]"
                >
                  <X size={16} />
                </button>

                <div className="w-12 h-12 rounded-full bg-[#2C221D] text-[#FAF6F0] flex items-center justify-center mx-auto mb-3 shadow-md">
                  <QrCode size={24} />
                </div>

                <h3 className="text-tagline font-bold text-[#2C221D] mb-1">
                  Tiket Digital Penjemputan
                </h3>
                <p className="text-fine-print text-[#7D6F64] mb-4">
                  Tunjukkan kode QR / ID tiket ini kepada staf restoran saat serah terima.
                </p>

                {/* Simulated High-Res QR Code Card */}
                <div className="p-6 bg-[#FAF7F2] rounded-[20px] border border-[#EADECF] mb-5 inline-block w-full">
                  <div className="w-44 h-44 bg-[#FFFDF9] p-3 rounded-[16px] mx-auto mb-3 border border-[#EADECF] shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Simulated Barcode / Matrix Pattern */}
                    <div className="grid grid-cols-6 gap-1 w-full h-full opacity-90">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-[2px] ${
                            (i * 7) % 3 === 0 ? 'bg-[#2C221D]' : 'bg-[#EADECF]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-[#2C221D] uppercase tracking-widest bg-[#FFFDF9] py-1.5 px-3 rounded-full border border-[#EADECF] inline-block">
                    KODE: #{selectedTicket.id.slice(0, 8)}
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="text-left bg-[#FAF7F2] border border-[#EADECF] p-4 rounded-[14px] space-y-2 text-xs mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#7D6F64]">Makanan:</span>
                    <span className="font-semibold text-[#2C221D] truncate max-w-[200px]">
                      {selectedTicket.surplusName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D6F64]">Penyedia:</span>
                    <span className="font-semibold text-[#2C221D]">
                      {selectedTicket.providerBusinessName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D6F64]">Alamat Ambil:</span>
                    <span className="font-semibold text-[#2C221D] truncate max-w-[200px]">
                      {selectedTicket.pickupAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D6F64]">Sisa Batas Waktu:</span>
                    <span className="font-semibold text-[#2C221D]">
                      {formatCountdown(selectedTicket.pickupDeadline)} lagi
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="bg-[#F5EFEB] hover:bg-[#EADECF] text-[#2C221D] flex-1 text-xs py-2.5 rounded-xl border border-[#EADECF] transition-colors"
                  >
                    Tutup
                  </button>
                  {selectedTicket.status === 'dikonfirmasi' && (
                    <button
                      onClick={() => handleConfirmPickup(selectedTicket)}
                      className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] flex-1 text-xs py-2.5 rounded-xl font-medium shadow-sm transition-all"
                    >
                      Konfirmasi Selesai
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Konfirmasi Pembatalan Pesanan */}
        <AnimatePresence>
          {cancelModalBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18110D]/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="bg-[#FFFDF9] rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#EADECF] shadow-2xl relative"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-display-md text-[#2C221D] text-center mb-2">
                  Batalkan Pesanan?
                </h3>
                <p className="text-body-apple text-[#7D6F64] text-center text-sm mb-6 leading-relaxed">
                  Apakah Anda yakin ingin membatalkan pesanan <span className="font-semibold text-[#2C221D]">"{cancelModalBooking.surplusName}"</span> ({cancelModalBooking.quantity} kg)? Porsi makanan ini akan dikembalikan ke inventaris surplus mitra agar dapat diselamatkan orang lain.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCancelModalBooking(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-[#EADECF] text-[#2C221D] font-semibold text-xs hover:bg-[#F5EFEB] transition-colors uppercase tracking-wider"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => {
                      handleCancel(cancelModalBooking);
                      setCancelModalBooking(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 shadow-sm transition-colors uppercase tracking-wider"
                  >
                    Ya, Batalkan Pesanan
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Order Coordination Chat Modal */}
        {selectedChatBooking && (
          <ChatModal
            type="order"
            booking={selectedChatBooking}
            isOpen={!!selectedChatBooking}
            onClose={() => setSelectedChatBooking(null)}
          />
        )}

        {/* Admin Complaint Modal */}
        {isComplaintModalOpen && (
          <ChatModal
            type="complaint"
            isOpen={isComplaintModalOpen}
            onClose={() => setIsComplaintModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

