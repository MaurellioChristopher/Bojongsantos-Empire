'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  QrCode,
  Building2,
  Banknote,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatPrice } from '@/lib/utils';

export type PaymentMethodType = 'qris' | 'va_bca' | 'va_mandiri' | 'va_bri' | 'cash';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  itemName: string;
  deliveryFee?: number;
  onPaymentSuccess: (method: PaymentMethodType, transactionId: string) => void;
}

export function PaymentGatewayModal({
  isOpen,
  onClose,
  orderId,
  amount,
  itemName,
  deliveryFee = 0,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const [activeTab, setActiveTab] = useState<'qris' | 'va' | 'cash'>('qris');
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bri'>('bca');
  const [copiedVa, setCopiedVa] = useState(false);
  const [paymentState, setPaymentState] = useState<'pending' | 'processing' | 'success'>('pending');
  const [countdownSeconds, setCountdownSeconds] = useState(899); // 14:59 min
  const [autoCompleteDemo, setAutoCompleteDemo] = useState(false);

  // Virtual Account Numbers for demo
  const vaNumbers = {
    bca: `8801 4921 ${orderId.slice(-4)} 1045`,
    mandiri: `8902 3810 ${orderId.slice(-4)} 8821`,
    bri: `1280 9940 ${orderId.slice(-4)} 3310`,
  };

  // Timer Countdown
  useEffect(() => {
    if (!isOpen || paymentState !== 'pending') return;

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, paymentState]);

  // Auto-Complete Demo Trigger (if enabled, automatically pays in 5 seconds)
  useEffect(() => {
    if (!isOpen || !autoCompleteDemo || paymentState !== 'pending') return;

    const timer = setTimeout(() => {
      handleSimulatePayment();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, autoCompleteDemo, paymentState]);

  // Reset states on open
  useEffect(() => {
    if (isOpen) {
      setPaymentState('pending');
      setCountdownSeconds(899);
      setAutoCompleteDemo(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentVa = vaNumbers[selectedBank];

  const handleCopyVa = () => {
    try {
      navigator.clipboard.writeText(currentVa.replace(/\s+/g, ''));
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2000);
    } catch (e) {
      console.warn('Clipboard error:', e);
    }
  };

  // "Ngakalin" Simulator: Trigger Instant Success
  const handleSimulatePayment = () => {
    setPaymentState('processing');

    setTimeout(() => {
      setPaymentState('success');
      const methodKey: PaymentMethodType =
        activeTab === 'qris'
          ? 'qris'
          : activeTab === 'va'
          ? `va_${selectedBank}`
          : 'cash';

      const trxId = `TRX-${Date.now().toString().slice(-6)}`;

      setTimeout(() => {
        onPaymentSuccess(methodKey, trxId);
      }, 1500);
    }, 1200);
  };

  // Payload for realistic scannable QRIS
  const qrisPayload = JSON.stringify({
    gateway: 'AksesPangan-PayGateway',
    merchant: 'AksesPangan Eco-Platform',
    orderId,
    amount,
    currency: 'IDR',
    timestamp: new Date().toISOString(),
    status: 'sandbox_ready',
  });

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-3 sm:p-4 bg-[#0C2017]/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-[#FFFFFF] rounded-[24px] border border-[#DCE5DB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#143628]"
      >
        {/* ============================================================
            1. GATEWAY HEADER & ORDER SUMMARY
            ============================================================ */}
        <div className="bg-[#143628] text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
          <div className="flex items-center justify-between relative z-10 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-[#86EFAC] flex items-center justify-center font-bold text-sm shadow-inner">
                💳
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                  <span>AksesPangan Pay</span>
                  <span className="text-[10px] font-mono bg-[#FBBF24]/20 text-[#FDE68A] px-2 py-0.2 rounded-full font-bold border border-[#FBBF24]/30">
                    Sandbox Demo
                  </span>
                </h3>
                <p className="text-[10px] text-white/70 m-0">Payment Gateway Interaktif</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
            <div>
              <span className="text-[11px] text-white/70">Total Pembayaran</span>
              <div className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {formatPrice(amount)}
              </div>
              <div className="text-[10px] text-[#86EFAC] truncate max-w-xs mt-0.5">
                {itemName} {deliveryFee > 0 ? `+ Ongkir Kurir (${formatPrice(deliveryFee)})` : ''}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-white/70 flex items-center justify-end gap-1">
                <Clock size={11} className="text-[#FBBF24]" />
                Sisa Waktu
              </span>
              <div className="font-mono font-bold text-sm text-[#FDE68A]">{formattedTime}</div>
              <div className="text-[10px] text-white/60 font-mono">#{orderId.slice(-8)}</div>
            </div>
          </div>
        </div>

        {/* ============================================================
            2. PAYMENT CHANNEL TABS
            ============================================================ */}
        {paymentState === 'pending' && (
          <div className="flex border-b border-[#DCE5DB] bg-[#F7F9F6] p-1.5 gap-1.5 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('qris')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'qris'
                  ? 'bg-white text-[#143628] shadow-xs font-bold border border-[#DCE5DB]'
                  : 'text-[#597367] hover:text-[#143628]'
              }`}
            >
              <QrCode size={15} className={activeTab === 'qris' ? 'text-[#2D6A4F]' : ''} />
              <span>QRIS Instan</span>
            </button>

            <button
              onClick={() => setActiveTab('va')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'va'
                  ? 'bg-white text-[#143628] shadow-xs font-bold border border-[#DCE5DB]'
                  : 'text-[#597367] hover:text-[#143628]'
              }`}
            >
              <Building2 size={15} className={activeTab === 'va' ? 'text-[#2D6A4F]' : ''} />
              <span>Virtual Account</span>
            </button>

            <button
              onClick={() => setActiveTab('cash')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'cash'
                  ? 'bg-white text-[#143628] shadow-xs font-bold border border-[#DCE5DB]'
                  : 'text-[#597367] hover:text-[#143628]'
              }`}
            >
              <Banknote size={15} className={activeTab === 'cash' ? 'text-[#2D6A4F]' : ''} />
              <span>Tunai / COD</span>
            </button>
          </div>
        )}

        {/* ============================================================
            3. TAB CONTENT BODY
            ============================================================ */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {paymentState === 'processing' && (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin" />
              <h4 className="text-base font-bold text-[#143628]">Menghubungkan ke Bank & Gateway...</h4>
              <p className="text-xs text-[#597367] max-w-xs">
                Memverifikasi mutasi pembayaran real-time Bank Indonesia Sandbox.
              </p>
            </div>
          )}

          {paymentState === 'success' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#EBF7EE] text-[#2D6A4F] flex items-center justify-center shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-lg font-bold text-[#143628]">Pembayaran Berhasil!</h4>
              <p className="text-xs text-[#597367] max-w-xs">
                Transaksi sebesar <strong>{formatPrice(amount)}</strong> telah lunas diverifikasi. Mengalihkan ke tiket pesanan & kurir...
              </p>
            </div>
          )}

          {paymentState === 'pending' && activeTab === 'qris' && (
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs font-bold text-[#143628] tracking-wider uppercase font-mono">
                  QRIS Standar Pembayaran Nasional
                </span>
              </div>

              {/* Dynamic QR Code Box */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#143628] shadow-md inline-block relative group">
                <QRCodeSVG value={qrisPayload} size={170} bgColor="#ffffff" fgColor="#143628" />
                <div className="absolute inset-0 bg-[#2D6A4F]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold bg-[#143628] text-white px-2 py-1 rounded-full shadow-md">
                    Scan Bebas E-Wallet Apa Saja
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#597367] max-w-xs leading-relaxed">
                Scan dengan <strong>GoPay, OVO, Dana, ShopeePay, BCA Mobile</strong>, atau aplikasi banking apa pun.
              </div>

              {/* Auto-Complete Toggle for Demonstration Ease */}
              <label className="flex items-center gap-2 text-[11px] text-[#597367] cursor-pointer bg-[#F7F9F6] px-3 py-1.5 rounded-full border border-[#DCE5DB]">
                <input
                  type="checkbox"
                  checked={autoCompleteDemo}
                  onChange={(e) => setAutoCompleteDemo(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2D6A4F] cursor-pointer"
                />
                <span>Simulasikan lunas otomatis dalam 5 detik (Demo Juri)</span>
              </label>
            </div>
          )}

          {paymentState === 'pending' && activeTab === 'va' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[#597367]">Pilih Bank Tujuan:</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bca', label: 'BCA Virtual Account' },
                  { id: 'mandiri', label: 'Mandiri Livin' },
                  { id: 'bri', label: 'BRI BRIVA' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      selectedBank === b.id
                        ? 'bg-[#EBF7EE] text-[#2D6A4F] border-[#2D6A4F] shadow-xs'
                        : 'bg-white text-[#143628] border-[#DCE5DB] hover:bg-stone-50'
                    }`}
                  >
                    {b.id.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* VA Number Card */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#DCE5DB] space-y-2">
                <div className="text-[11px] text-[#597367]">Nomor Rekening Virtual Account:</div>
                <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-xl border border-[#DCE5DB]">
                  <span className="font-mono text-base font-bold text-[#143628] tracking-wider">
                    {currentVa}
                  </span>
                  <button
                    onClick={handleCopyVa}
                    className="p-1.5 bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#2D6A4F] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    {copiedVa ? <Check size={14} className="text-[#16a34a]" /> : <Copy size={14} />}
                    <span>{copiedVa ? 'Disalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="text-[10px] text-[#597367]">
                  Atas Nama: <strong>AksesPangan / {itemName.slice(0, 20)}</strong>
                </div>
              </div>

              <div className="text-[11px] text-[#597367] space-y-1 bg-[#F7F9F6] p-3 rounded-xl border border-[#DCE5DB]">
                <div className="font-bold text-[#143628]">Petunjuk Pembayaran:</div>
                <div>1. Masuk ke m-Banking atau ATM bank terkait.</div>
                <div>2. Pilih menu <strong>Transfer / Bayar &gt; Virtual Account</strong>.</div>
                <div>3. Masukkan nomor VA di atas dan konfirmasi nominal tagihan.</div>
              </div>
            </div>
          )}

          {paymentState === 'pending' && activeTab === 'cash' && (
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#DCE5DB] space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-[#143628]">
                <Banknote size={16} className="text-[#2D6A4F]" />
                <span>Bayar Tunai Langsung (Cash on Delivery / Pickup)</span>
              </div>
              <p className="text-xs text-[#597367] leading-relaxed">
                Anda dapat membayarkan uang tunai secara langsung sebesar{' '}
                <strong>{formatPrice(amount)}</strong> kepada mitra kurir saat pesanan tiba, atau kepada kasir resto saat mengambil mandiri.
              </p>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                💡 Mohon siapkan uang pas untuk mempermudah serah terima.
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            4. ACTION CONTROLS & "NGAKALIN" SIMULATOR BUTTON
            ============================================================ */}
        {paymentState === 'pending' && (
          <div className="p-4 sm:p-5 bg-[#FFFFFF] border-t border-[#DCE5DB] space-y-2.5 shrink-0">
            {/* The Magic Simulator Button for Judges */}
            <button
              onClick={handleSimulatePayment}
              className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1C4736] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 group"
            >
              <Zap size={15} className="text-[#FBBF24] fill-[#FBBF24] group-hover:scale-110 transition-transform" />
              <span>⚡ Simulasikan Pembayaran Berhasil (Mode Demo Juri)</span>
              <ArrowRight size={14} />
            </button>

            <div className="flex items-center justify-between text-[10px] text-[#597367] px-1">
              <div className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#16a34a]" />
                <span>Enkripsi 256-Bit SSL Terverifikasi</span>
              </div>
              <button
                onClick={onClose}
                className="hover:underline text-[#597367] hover:text-[#143628] cursor-pointer"
              >
                Batalkan Transaksi
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
