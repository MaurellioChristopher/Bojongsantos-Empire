'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ThermometerSun,
  Flame,
  ShieldCheck,
  ShoppingBag,
  Store,
  ChevronRight,
  Info,
} from 'lucide-react';
import { formatPrice, formatCountdown, getSurplusPhoto } from '@/lib/utils';
import { getSafetyGuideline } from '@/lib/safetyGuidelines';
import { FOOD_CATEGORY_EMOJI, FOOD_CATEGORY_LABELS } from '@/types';
import type { SurplusItem } from '@/types';

interface CheckoutModalProps {
  item: SurplusItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCheckout: (item: SurplusItem) => Promise<void>;
  isLoading?: boolean;
}

export function CheckoutModal({
  item,
  isOpen,
  onClose,
  onConfirmCheckout,
  isLoading = false,
}: CheckoutModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [activeTab, setActiveTab] = useState<'rincian' | 'keamanan'>('rincian');

  if (!isOpen || !item) return null;

  const guideline = getSafetyGuideline(item.foodCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || isLoading) return;
    await onConfirmCheckout(item);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#18110D]/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-[#FFFDF9] rounded-[24px] max-w-2xl w-full p-6 sm:p-8 border border-[#EADECF] shadow-2xl relative my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden text-[#2C221D]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EADECF]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#2C221D] text-[#FAF6F0] flex items-center justify-center text-lg shadow-sm">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-tagline font-bold text-[#2C221D] tracking-tight leading-none mb-1">
                  Checkout & Konfirmasi Pesanan
                </h2>
                <p className="text-fine-print text-[#7D6F64] m-0">
                  Langkah 2 dari 2: Tinjau rincian biaya & panduan mutu makanan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#7D6F64] hover:text-[#2C221D] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Switcher for Quick Navigation */}
          <div className="flex items-center bg-[#F5EFEB] p-1 rounded-full my-4 self-center sm:self-start text-xs font-semibold border border-[#EADECF]">
            <button
              type="button"
              onClick={() => setActiveTab('rincian')}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'rincian'
                  ? 'bg-[#FFFDF9] text-[#2C221D] shadow-sm font-bold border border-[#EADECF]'
                  : 'text-[#7D6F64] hover:text-[#2C221D]'
              }`}
            >
              <ShoppingBag size={14} /> Ringkasan Pesanan & Biaya
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keamanan')}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'keamanan'
                  ? 'bg-[#FFFDF9] text-[#2C221D] shadow-sm font-bold border border-[#EADECF]'
                  : 'text-[#7D6F64] hover:text-[#2C221D]'
              }`}
            >
              <ShieldCheck size={14} className="text-[#16a34a]" /> Panduan Mutu ({guideline.categoryName})
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto pr-1 space-y-5 my-2 max-h-[52vh]">
            {/* 1. Item Header Card */}
            <div className="p-4 sm:p-5 rounded-[18px] bg-[#FAF7F2] border border-[#EADECF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-16 h-16 rounded-[14px] overflow-hidden bg-[#F5EFEB] shadow-sm border border-[#EADECF] flex-shrink-0 relative">
                  <img
                    src={getSurplusPhoto(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#2C221D] text-[#FAF6F0]">
                      {FOOD_CATEGORY_LABELS[item.foodCategory] || item.foodCategory}
                    </span>
                    {item.isFree && (
                      <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#16a34a]/10 text-[#15803d]">
                        Gratis
                      </span>
                    )}
                  </div>
                  <h3 className="text-body-strong text-[#2C221D] line-clamp-1 mb-0.5">
                    {item.name}
                  </h3>
                  <p className="text-caption-apple text-[#7D6F64] m-0 flex items-center gap-1">
                    <Store size={13} className="text-[#D95327]" />
                    <span>{item.providerBusinessName}</span>
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EADECF] flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                <span className="text-fine-print text-[#7D6F64]">Jumlah Porsi</span>
                <span className="text-body-strong text-[#2C221D]">
                  {item.quantity} kg ({item.portionCount} porsi)
                </span>
              </div>
            </div>

            {activeTab === 'rincian' ? (
              <>
                {/* 2. Pickup Location & Deadline Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-[16px] bg-[#FFFDF9] border border-[#EADECF]">
                    <div className="text-fine-print uppercase font-semibold text-[#7D6F64] tracking-wider mb-1 flex items-center gap-1">
                      <MapPin size={13} className="text-[#D95327]" /> Lokasi Penjemputan
                    </div>
                    <div className="text-caption-strong text-[#2C221D] line-clamp-1">
                      {item.address}
                    </div>
                    <div className="text-fine-print text-[#7D6F64] mt-0.5">
                      Mitra: {item.providerBusinessName}
                    </div>
                  </div>

                  <div className="p-4 rounded-[16px] bg-[#FFFDF9] border border-[#EADECF]">
                    <div className="text-fine-print uppercase font-semibold text-[#7D6F64] tracking-wider mb-1 flex items-center gap-1">
                      <Clock size={13} className="text-[#D95327]" /> Batas Waktu Ambil
                    </div>
                    <div className="text-caption-strong text-[#2C221D] font-bold">
                      {formatCountdown(item.expiryTime)} lagi
                    </div>
                    <div className="text-fine-print text-[#7D6F64] mt-0.5">
                      Segera ambil sebelum stok kedaluwarsa
                    </div>
                  </div>
                </div>

                {/* 3. Pricing Breakdown */}
                <div className="p-5 rounded-[18px] bg-[#FFFDF9] border border-[#EADECF] space-y-3">
                  <h4 className="text-caption-strong text-[#2C221D] border-b border-[#EADECF] pb-2 flex items-center justify-between">
                    <span>Rincian Pembayaran</span>
                    <span className="text-fine-print font-normal text-[#7D6F64]">Bebas Biaya Admin</span>
                  </h4>

                  <div className="flex justify-between text-caption-apple text-[#7D6F64]">
                    <span>Harga Makanan ({item.portionCount} porsi)</span>
                    <span className="text-[#2C221D] font-medium">
                      {item.isFree ? 'Rp 0 (Gratis)' : formatPrice(item.price)}
                    </span>
                  </div>

                  <div className="flex justify-between text-caption-apple text-[#7D6F64]">
                    <span>Biaya Penyelamatan Pangan (ESG)</span>
                    <span className="text-[#16a34a] font-medium">Rp 0 (Subsidi AksesPangan)</span>
                  </div>

                  <div className="pt-2 border-t border-[#EADECF] flex justify-between items-center">
                    <div>
                      <span className="text-body-strong text-[#2C221D]">Total Bayar</span>
                      <p className="text-fine-print text-[#7D6F64] m-0">Bayar langsung di tempat jika berbayar</p>
                    </div>
                    <span className="text-display-md text-[#2C221D] font-bold">
                      {item.isFree ? 'GRATIS' : formatPrice(item.price)}
                    </span>
                  </div>
                </div>

                {/* Quick Quality Teaser Card */}
                <div className="p-4 rounded-[16px] bg-[#FAF7F2] border border-[#EADECF] flex items-start gap-3">
                  <ShieldCheck size={18} className="text-[#D95327] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#7D6F64]">
                    <span className="font-semibold text-[#2C221D]">Penjaminan Mutu Pangan:</span> {guideline.reheatingInstructions}
                    <button
                      type="button"
                      onClick={() => setActiveTab('keamanan')}
                      className="block mt-1 font-semibold text-[#D95327] underline hover:opacity-75"
                    >
                      Lihat instruksi penyimpanan & Do's/Don'ts lengkap →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* 4. Complete Dynamic Food Safety & Storage Specs Tab */
              <div className="space-y-4">
                {/* Temperature & Storage Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF]">
                    <div className="text-fine-print text-[#7D6F64] mb-1 flex items-center gap-1">
                      <ThermometerSun size={13} className="text-[#D95327]" /> Suhu Penyimpanan
                    </div>
                    <div className="text-caption-strong text-[#2C221D]">
                      {guideline.storageTemp}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF]">
                    <div className="text-fine-print text-[#7D6F64] mb-1 flex items-center gap-1">
                      <Clock size={13} className="text-[#D95327]" /> Maks. Suhu Ruang
                    </div>
                    <div className="text-caption-strong text-[#2C221D]">
                      {guideline.maxSafeHours} Jam sejak diambil
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF]">
                    <div className="text-fine-print text-[#7D6F64] mb-1 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-[#16a34a]" /> Maks. Kulkas (&lt;4°C)
                    </div>
                    <div className="text-caption-strong text-[#2C221D]">
                      {guideline.maxRefrigeratedHours} Jam
                    </div>
                  </div>
                </div>

                {/* Reheating Guide Box */}
                <div className="p-4 rounded-[16px] bg-[#FFF2EB] border border-[#FAD7C8]">
                  <div className="text-caption-strong text-[#D95327] mb-1 flex items-center gap-1.5 font-bold">
                    <Flame size={16} /> Tata Cara Pemanasan Ulang (Reheating)
                  </div>
                  <p className="text-caption-apple text-[#933719] m-0 leading-relaxed">
                    {guideline.reheatingInstructions}
                  </p>
                </div>

                {/* Do's & Don'ts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DO'S */}
                  <div className="p-4 rounded-[16px] bg-[#F1F8F3] border border-[#CDE5D4]">
                    <h5 className="text-caption-strong text-[#1E5D34] mb-2 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={16} className="text-[#16a34a]" /> Hal yang Berhak/Boleh Dilakukan (Do's)
                    </h5>
                    <ul className="space-y-1.5 pl-0 text-xs text-[#1E5D34] list-none m-0">
                      {guideline.dos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#16a34a] font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DON'TS */}
                  <div className="p-4 rounded-[16px] bg-[#FDF2F2] border border-[#F9CFCF]">
                    <h5 className="text-caption-strong text-[#982020] mb-2 flex items-center gap-1.5 font-bold">
                      <AlertTriangle size={16} className="text-[#dc2626]" /> Larangan & Tanda Rusak (Don'ts)
                    </h5>
                    <ul className="space-y-1.5 pl-0 text-xs text-[#982020] list-none m-0">
                      {guideline.donts.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#dc2626] font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terms Agreement Checkbox & Footer Controls */}
          <div className="pt-4 border-t border-[#EADECF] space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none bg-[#FAF7F2] p-3 rounded-[12px] border border-[#EADECF]">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#2C221D] cursor-pointer"
              />
              <span className="text-xs text-[#2C221D] leading-snug">
                Saya menyetujui panduan keselamatan mutu makanan di atas dan berkomitmen untuk mengambil makanan di lokasi sebelum batas waktu habis.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#F5EFEB] hover:bg-[#EADECF] text-[#2C221D] font-medium text-sm py-3 rounded-xl border border-[#EADECF] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!agreedToTerms || isLoading}
                className="flex-1 bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] font-medium text-sm py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? 'Memproses Checkout...' : 'Konfirmasi & Buat Pesanan Sekarang'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
