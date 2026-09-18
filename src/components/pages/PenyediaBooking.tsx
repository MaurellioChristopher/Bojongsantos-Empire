'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, User, Phone, MapPin, ArrowLeft, MessageSquare, ShieldAlert, AlertCircle, Scale, Inbox, QrCode, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getBookingsByProvider, updateBookingStatus, addNotification, verifyPickupPin } from '@/lib/data';
import { bookingService } from '@/services/bookingService';
import { getRelativeTime, formatCountdown, formatDateTime } from '@/lib/utils';
import { BOOKING_STATUS_LABELS } from '@/types';
import type { Booking } from '@/types';
import { ChatModal } from '@/components/chat/ChatModal';

export function PenyediaBooking() {
  const { user, login } = useAuth();
  const { success, warning, error: notifyError } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedChatBooking, setSelectedChatBooking] = useState<Booking | null>(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [verifyingBooking, setVerifyingBooking] = useState<Booking | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const refresh = async () => {
    if (!user) return;
    try {
      const data = await bookingService.getByProvider(user.id);
      setBookings(data);
    } catch {
      setBookings(getBookingsByProvider(user.id));
    }
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const handleConfirm = async (booking: Booking) => {
    try {
      await bookingService.updateStatus(booking.id, 'dikonfirmasi');
    } catch {
      updateBookingStatus(booking.id, 'dikonfirmasi');
    }
    addNotification({
      type: 'success',
      title: 'Booking Dikonfirmasi',
      message: `${booking.recipientName} akan mengambil ${booking.surplusName}`,
      userId: booking.recipientId,
    });
    success('Booking Dikonfirmasi', `${booking.recipientName} akan segera mengambil makanan`);
    refresh();
  };

  const handleReject = async (booking: Booking) => {
    try {
      await bookingService.updateStatus(booking.id, 'dibatalkan');
    } catch {
      updateBookingStatus(booking.id, 'dibatalkan');
    }
    addNotification({
      type: 'warning',
      title: 'Booking Dibatalkan',
      message: `Booking ${booking.surplusName} telah dibatalkan`,
      userId: booking.recipientId,
    });
    warning('Booking Ditolak', 'Stok surplus telah dikembalikan ke katalog');
    refresh();
  };

  const handleOpenVerify = (booking: Booking) => {
    setVerifyingBooking(booking);
    setPinInput('');
    setPinError('');
  };

  const handleVerifySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verifyingBooking) return;
    setIsVerifying(true);
    setPinError('');

    try {
      const res = verifyPickupPin(verifyingBooking.id, pinInput);
      if (res.success) {
        success('Verifikasi Berhasil!', `Pesanan ${verifyingBooking.quantity} kg makanan telah diserahterimakan.`);
        setVerifyingBooking(null);
        refresh();
      } else {
        setPinError(res.error || 'PIN verifikasi tidak sesuai');
      }
    } catch {
      setPinError('Terjadi kesalahan saat memverifikasi PIN');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulatedScan = () => {
    if (!verifyingBooking) return;
    const pin = verifyingBooking.pickupPin || '1234';
    setPinInput(pin);
    setTimeout(() => {
      const res = verifyPickupPin(verifyingBooking.id, pin);
      if (res.success) {
        success('QR Code Berhasil Dipindai!', `Serah terima ${verifyingBooking.quantity} kg makanan sukses.`);
        setVerifyingBooking(null);
        refresh();
      }
    }, 500);
  };

  if (!user || user.role !== 'penyedia') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#143628] mb-4 border border-[#DCE5DB] shadow-sm">
          <Clock size={32} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">Akses Khusus Mitra Penyedia</h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Halaman ini hanya dapat diakses oleh akun Mitra Penyedia untuk mengelola permintaan klaim makanan.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => login('penyedia@aksespangan.id', 'penyedia123')}
            className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-sm py-2.5 px-5 rounded-xl font-medium shadow-sm transition-all"
          >
            Masuk Akun Demo Penyedia (1-Klik)
          </button>
          <a href="#/login" className="bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] text-sm py-2.5 px-5 rounded-xl font-medium border border-[#DCE5DB] transition-colors">
            Masuk dengan Akun Lain
          </a>
        </div>
      </div>
    );
  }

  const pending = bookings.filter((b) => b.status === 'menunggu');
  const past = bookings.filter((b) => b.status !== 'menunggu');

  return (
    <div className="min-h-screen bg-[#F7F9F6] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <a href="#/penyedia" className="text-[#2D6A4F] hover:text-[#B8401A] text-xs mb-2 inline-flex items-center gap-1 font-semibold">
              <ArrowLeft size={14} /> Kembali ke Dashboard
            </a>
            <h1 className="text-display-lg text-[#143628]">Daftar Pesanan &amp; Pengambilan</h1>
            <p className="text-body-apple text-[#597367] m-0">
              Kelola permintaan makanan dari masyarakat, konfirmasi serah terima, dan koordinasi via chat.
            </p>
          </div>

          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="bg-[#FFFFFF] hover:bg-[#EDF2EC] text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-center text-[#143628] border border-[#DCE5DB] rounded-xl shadow-xs transition-colors"
          >
            <AlertCircle size={15} className="text-[#2D6A4F]" />
            <span>Sampaikan Keluhan ke Admin</span>
          </button>
        </div>

        {/* Pending Requests */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 sm:p-8 mb-8 shadow-xs">
          <h2 className="text-tagline text-[#143628] mb-4 flex items-center gap-2">
            <span>Perlu Konfirmasi Segera</span>
            <span className="bg-[#FFF2EB] text-[#2D6A4F] border border-[#FAD7C8] text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">{pending.length}</span>
          </h2>

          {pending.length === 0 ? (
            <div className="text-center py-10 text-[#597367]">
              <Inbox size={32} className="text-[#A8988B] mx-auto mb-2" />
              <p className="text-body-apple m-0">Semua pesanan telah diproses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((b) => (
                <div key={b.id} className="p-5 rounded-[16px] bg-[#FAF7F2] border border-[#DCE5DB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-body-strong text-[#143628] mb-1">{b.surplusName}</h3>
                    <div className="text-caption-apple text-[#597367] space-y-0.5">
                      <div className="flex items-center gap-1">
                        <User size={13} className="text-[#A8988B]" />
                        <span>Penerima: <span className="text-[#143628] font-medium">{b.recipientName}</span> ({b.recipientPhone})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Scale size={13} className="text-[#A8988B]" />
                        <span>Jumlah: {b.quantity} kg • Dipesan: {getRelativeTime(b.bookedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedChatBooking(b)}
                      className="bg-[#FFFFFF] hover:bg-[#EDF2EC] text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 text-[#143628] border border-[#DCE5DB] shadow-xs transition-colors"
                    >
                      <MessageSquare size={13} className="text-[#2D6A4F]" />
                      <span>Chat Penerima</span>
                    </button>
                    <button
                      onClick={() => handleReject(b)}
                      className="bg-[#FFFFFF] text-xs py-2 px-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleConfirm(b)}
                      className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-xs py-2 px-4 rounded-xl font-medium shadow-sm transition-all"
                    >
                      Konfirmasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed / Active & Past History */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 sm:p-8 shadow-xs">
          <h2 className="text-tagline text-[#143628] mb-4">Pesanan Aktif &amp; Riwayat</h2>

          {past.length === 0 ? (
            <p className="text-caption-apple text-[#597367] text-center py-8">Belum ada riwayat transaksi sebelumnya.</p>
          ) : (
            <div className="divide-y divide-[#DCE5DB]">
              {past.map((b) => {
                const isConfirmed = b.status === 'dikonfirmasi';
                return (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-body-strong text-[#143628] mb-0.5 font-medium">{b.surplusName}</div>
                      <div className="text-caption-apple text-[#597367]">
                        Penerima: <span className="text-[#143628] font-medium">{b.recipientName}</span> • {b.quantity} kg • {formatDateTime(b.bookedAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => handleOpenVerify(b)}
                            className="bg-[#2D6A4F] hover:bg-[#1E4D38] text-[#FFFFFF] text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-sm transition-all font-medium cursor-pointer"
                          >
                            <QrCode size={13} />
                            <span>Verifikasi Pengambilan</span>
                          </button>
                          <button
                            onClick={() => setSelectedChatBooking(b)}
                            className="bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 border border-[#DCE5DB] transition-all cursor-pointer"
                          >
                            <MessageSquare size={13} />
                            <span>Chat</span>
                          </button>
                        </>
                      )}

                      <span className={`badge-apple ${
                        b.status === 'diambil' ? 'badge-apple-success' : b.status === 'dikonfirmasi' ? 'badge-apple-info' : 'badge-apple-neutral'
                      }`}>
                        {BOOKING_STATUS_LABELS[b.status] || b.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Verifikasi Serah Terima / PIN Modal */}
      {verifyingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C2017]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#DCE5DB] shadow-2xl p-6 text-[#143628] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECE4] mb-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2D6A4F]">
                <ShieldCheck size={16} />
                <span>Validasi Serah Terima Pangan</span>
              </div>
              <button
                onClick={() => setVerifyingBooking(null)}
                className="p-1 rounded-lg text-[#597367] hover:text-[#143628] hover:bg-[#EDF2EC] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-[#F7F9F6] rounded-xl border border-[#DCE5DB] text-xs">
                <div className="font-semibold text-sm text-[#143628]">{verifyingBooking.surplusName}</div>
                <div className="text-[#597367] mt-0.5">
                  Penerima: <span className="font-medium text-[#143628]">{verifyingBooking.recipientName}</span> • {verifyingBooking.quantity} kg
                </div>
              </div>

              {/* PIN Input Form */}
              <form onSubmit={handleVerifySubmit} className="space-y-3">
                <label className="block text-xs font-medium text-[#143628]">
                  Masukkan 4-Digit PIN Pengambilan Penerima:
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                      setPinError('');
                    }}
                    placeholder="••••"
                    className="w-48 h-12 text-center text-2xl font-mono tracking-[0.4em] font-bold rounded-xl border-2 border-[#DCE5DB] focus:border-[#2D6A4F] outline-none transition-all bg-[#FAF7F2] text-[#143628]"
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-red-600 text-center font-medium">{pinError}</p>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isVerifying || pinInput.length < 4}
                    className="w-full h-11 bg-[#143628] hover:bg-[#1C4736] text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={15} />
                    <span>{isVerifying ? 'Memvalidasi...' : 'Verifikasi & Selesaikan Pesanan'}</span>
                  </button>

                  <div className="relative my-1 text-center">
                    <span className="text-[10px] uppercase font-mono text-[#597367] bg-white px-2">atau</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulatedScan}
                    className="w-full h-10 bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] font-medium text-xs rounded-xl border border-[#DCE5DB] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <QrCode size={14} className="text-[#2D6A4F]" />
                    <span>Pindai QR Code Tiket (Simulasi Cepat)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
  );
}

