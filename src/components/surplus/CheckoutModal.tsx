'use client';

import { useState, useEffect } from 'react';
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
  Bike,
  Navigation,
  Star,
  Sparkles,
} from 'lucide-react';
import { formatPrice, formatCountdown, getSurplusPhoto } from '@/lib/utils';
import { getSafetyGuideline } from '@/lib/safetyGuidelines';
import { calculateDeliveryFee } from '@/services/navigationService';
import { assignNearestCourier } from '@/services/courierService';
import { PaymentGatewayModal, type PaymentMethodType } from '@/components/payment/PaymentGatewayModal';
import type { SurplusItem, FulfillmentMethod, CourierDriver, Coordinates } from '@/types';

export interface DeliveryOptionsPayload {
  fulfillmentMethod: FulfillmentMethod;
  deliveryFee?: number;
  deliveryDistanceKm?: number;
  deliveryAddress?: string;
  deliveryCoords?: Coordinates;
  courier?: CourierDriver;
  paymentStatus?: 'pending' | 'paid' | 'free';
  paymentMethod?: PaymentMethodType;
  paidAt?: string;
  totalPaidAmount?: number;
}

interface CheckoutModalProps {
  item: SurplusItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCheckout: (item: SurplusItem, deliveryOptions?: DeliveryOptionsPayload) => Promise<void>;
  isLoading?: boolean;
}

export function CheckoutModal({
  item,
  isOpen,
  onClose,
  onConfirmCheckout,
  isLoading = false,
}: CheckoutModalProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [activeTab, setActiveTab] = useState<'rincian' | 'keamanan'>('rincian');
  
  // Delivery & Courier Fulfillment states
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Asrama Telkom University, Jl. Telekomunikasi No. 1, Bojongsoang'
  );
  const [distanceKm, setDistanceKm] = useState(2.4);
  const [courier, setCourier] = useState<CourierDriver | null>(null);

  // Payment Gateway states
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<DeliveryOptionsPayload | null>(null);

  useEffect(() => {
    if (item) {
      const assigned = assignNearestCourier(item.location);
      setCourier(assigned);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const guideline = getSafetyGuideline(item.foodCategory);
  const deliveryFeeInfo = calculateDeliveryFee(distanceKm);
  const foodPrice = item.isFree ? 0 : item.price;
  const totalPayment = fulfillmentMethod === 'courier' ? foodPrice + deliveryFeeInfo.totalFee : foodPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!agreedToTerms) {
      setAgreedToTerms(true);
    }

    const payload: DeliveryOptionsPayload = {
      fulfillmentMethod,
      deliveryFee: fulfillmentMethod === 'courier' ? deliveryFeeInfo.totalFee : 0,
      deliveryDistanceKm: fulfillmentMethod === 'courier' ? deliveryFeeInfo.distanceKm : 0,
      deliveryAddress: fulfillmentMethod === 'courier' ? deliveryAddress : item.address,
      courier: fulfillmentMethod === 'courier' && courier ? courier : undefined,
      totalPaidAmount: totalPayment,
    };

    // If there is an amount to pay (> Rp 0), open the interactive Payment Gateway first
    if (totalPayment > 0) {
      setPendingPayload(payload);
      setIsPaymentGatewayOpen(true);
      return;
    }

    // Otherwise 100% Free pickup order
    await onConfirmCheckout(item, { ...payload, paymentStatus: 'free' });
  };

  const handlePaymentSuccess = async (method: PaymentMethodType, trxId: string) => {
    setIsPaymentGatewayOpen(false);
    const finalPayload: DeliveryOptionsPayload = {
      ...(pendingPayload || {
        fulfillmentMethod,
        deliveryFee: fulfillmentMethod === 'courier' ? deliveryFeeInfo.totalFee : 0,
        deliveryDistanceKm: fulfillmentMethod === 'courier' ? deliveryFeeInfo.distanceKm : 0,
        deliveryAddress: fulfillmentMethod === 'courier' ? deliveryAddress : item.address,
        courier: fulfillmentMethod === 'courier' && courier ? courier : undefined,
      }),
      paymentStatus: 'paid',
      paymentMethod: method,
      paidAt: new Date().toISOString(),
      totalPaidAmount: totalPayment,
    };

    await onConfirmCheckout(item, finalPayload);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#0C2017]/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-[#FFFFFF] rounded-[24px] max-w-2xl w-full p-6 sm:p-8 border border-[#DCE5DB] shadow-2xl relative my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden text-[#143628]"
      >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DB]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#143628] text-[#F3F8F5] flex items-center justify-center text-lg shadow-sm">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-tagline font-bold text-[#143628] tracking-tight leading-none mb-1">
                  Checkout & Konfirmasi Pesanan
                </h2>
                <p className="text-fine-print text-[#597367] m-0">
                  Langkah 2 dari 2: Tinjau rincian biaya & panduan mutu makanan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#EDF2EC] flex items-center justify-center text-[#597367] hover:text-[#143628] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Switcher for Quick Navigation */}
          <div className="flex items-center bg-[#EDF2EC] p-1 rounded-full my-4 self-center sm:self-start text-xs font-semibold border border-[#DCE5DB]">
            <button
              type="button"
              onClick={() => setActiveTab('rincian')}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rincian'
                  ? 'bg-[#FFFFFF] text-[#143628] shadow-sm font-bold border border-[#DCE5DB]'
                  : 'text-[#597367] hover:text-[#143628]'
              }`}
            >
              <ShoppingBag size={14} /> Ringkasan Pesanan & Pengantaran
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keamanan')}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'keamanan'
                  ? 'bg-[#FFFFFF] text-[#143628] shadow-sm font-bold border border-[#DCE5DB]'
                  : 'text-[#597367] hover:text-[#143628]'
              }`}
            >
              <ShieldCheck size={14} className="text-[#16a34a]" /> Panduan Mutu ({guideline.categoryName})
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto pr-1 space-y-5 my-2 max-h-[52vh]">
            {activeTab === 'rincian' ? (
              <>
                {/* 1. Item Header Card */}
                <div className="p-4 sm:p-5 rounded-[18px] bg-[#FAF7F2] border border-[#DCE5DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-16 h-16 rounded-[14px] overflow-hidden bg-[#EDF2EC] shadow-sm border border-[#DCE5DB] flex-shrink-0 relative">
                      <img
                        src={getSurplusPhoto(item)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.2 rounded-full font-mono">
                        {item.foodCategory}
                      </span>
                    </div>

                    <div>
                      <span className="inline-block text-fine-print font-mono uppercase px-2 py-0.5 rounded-full bg-[#EDF2EC] text-[#2D6A4F] font-semibold mb-1">
                        Surplus Siap Konsumsi
                      </span>
                      <h3 className="text-body-strong font-bold text-[#143628] leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-caption-apple text-[#597367] flex items-center gap-1 mt-0.5">
                        <Store size={13} className="text-[#2D6A4F]" />
                        <span>{item.providerBusinessName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <div className="text-fine-print text-[#597367]">Harga Makanan</div>
                    <div className="text-body-strong font-bold text-[#143628]">
                      {item.isFree ? (
                        <span className="text-[#16a34a] font-bold">100% GRATIS</span>
                      ) : (
                        formatPrice(item.price)
                      )}
                    </div>
                    <div className="text-[11px] text-[#597367]">{item.portionCount} Porsi ({item.quantity} kg)</div>
                  </div>
                </div>

                {/* 2. Metode Pemenuhan Pesanan (Ambil Sendiri vs Kurir Profesional) */}
                <div className="space-y-3">
                  <h4 className="text-caption-strong text-[#143628] flex items-center gap-1.5">
                    <Navigation size={14} className="text-[#2D6A4F]" />
                    <span>Pilih Metode Pengambilan Pangan:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Self-Pickup */}
                    <div
                      onClick={() => setFulfillmentMethod('pickup')}
                      className={`p-4 rounded-[16px] border cursor-pointer transition-all flex flex-col justify-between ${
                        fulfillmentMethod === 'pickup'
                          ? 'bg-[#EBF7EE] border-[#2D6A4F] shadow-xs'
                          : 'bg-[#FFFFFF] border-[#DCE5DB] hover:border-[#CAD6C8]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Store size={18} className={fulfillmentMethod === 'pickup' ? 'text-[#2D6A4F]' : 'text-[#597367]'} />
                          <span className="font-bold text-xs text-[#143628]">Ambil Mandiri (Self-Pickup)</span>
                        </div>
                        <input
                          type="radio"
                          name="fulfillment"
                          checked={fulfillmentMethod === 'pickup'}
                          onChange={() => setFulfillmentMethod('pickup')}
                          className="accent-[#2D6A4F]"
                        />
                      </div>
                      <p className="text-[11px] text-[#597367] mt-2 mb-2 leading-relaxed">
                        Ambil sendiri ke outlet resto membawa wadah & tunjukkan Digital QR Pass.
                      </p>
                      <span className="text-[11px] font-bold text-[#16a34a] bg-white px-2 py-0.5 rounded-full self-start border border-[#C8E6C9]">
                        Bebas Ongkir (Rp 0)
                      </span>
                    </div>

                    {/* Option 2: Professional Courier */}
                    <div
                      onClick={() => setFulfillmentMethod('courier')}
                      className={`p-4 rounded-[16px] border cursor-pointer transition-all flex flex-col justify-between ${
                        fulfillmentMethod === 'courier'
                          ? 'bg-[#EBF7EE] border-[#2D6A4F] shadow-xs'
                          : 'bg-[#FFFFFF] border-[#DCE5DB] hover:border-[#CAD6C8]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Bike size={18} className={fulfillmentMethod === 'courier' ? 'text-[#2D6A4F]' : 'text-[#597367]'} />
                          <span className="font-bold text-xs text-[#143628]">Kirim via Mitra Kurir</span>
                        </div>
                        <input
                          type="radio"
                          name="fulfillment"
                          checked={fulfillmentMethod === 'courier'}
                          onChange={() => setFulfillmentMethod('courier')}
                          className="accent-[#2D6A4F]"
                        />
                      </div>
                      <p className="text-[11px] text-[#597367] mt-2 mb-2 leading-relaxed">
                        Diantar cepat oleh kurir resmi bersertifikat dengan tas termal higienis.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#143628] bg-white px-2 py-0.5 rounded-full border border-[#DCE5DB]">
                          Rp {deliveryFeeInfo.totalFee.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-[#597367]">({deliveryFeeInfo.distanceKm} km)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Detail Pengantaran Kurir (Jika dipilih) */}
                {fulfillmentMethod === 'courier' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-[18px] bg-[#FFFFFF] border border-[#2D6A4F]/40 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#DCE5DB]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#143628]">
                        <Bike size={15} className="text-[#2D6A4F]" />
                        <span>Mitra Kurir Pangan yang Ditugaskan:</span>
                      </div>
                      {courier && (
                        <span className="text-[10px] bg-[#EBF7EE] text-[#2D6A4F] px-2 py-0.5 rounded-full font-bold border border-[#C8E6C9] flex items-center gap-1">
                          <Sparkles size={10} />
                          <span>{courier.badge}</span>
                        </span>
                      )}
                    </div>

                    {courier && (
                      <div className="flex items-center justify-between bg-[#F7F9F6] p-3 rounded-xl border border-[#DCE5DB]">
                        <div className="flex items-center gap-3">
                          <img
                            src={courier.avatar}
                            alt={courier.name}
                            className="w-11 h-11 rounded-full object-cover border border-[#DCE5DB]"
                          />
                          <div>
                            <div className="font-bold text-xs text-[#143628] flex items-center gap-1.5">
                              <span>{courier.name}</span>
                              <span className="text-[10px] text-[#597367] font-mono font-normal">
                                ({courier.plateNumber})
                              </span>
                            </div>
                            <div className="text-[10px] text-[#597367] flex items-center gap-1 mt-0.5">
                              <Star size={11} className="text-[#FBBF24] fill-[#FBBF24]" />
                              <span className="font-bold text-[#143628]">{courier.rating}</span>
                              <span>• {courier.totalReviews} ulasan ({courier.completedDeliveries} order sukses)</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-[#597367]">Estimasi Tiba</span>
                          <div className="text-xs font-bold text-[#2D6A4F]">15 - 25 Menit</div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-[#597367] mb-1">
                        Alamat Pengantaran Penerima:
                      </label>
                      <div className="flex items-center gap-2 bg-[#F7F9F6] border border-[#DCE5DB] rounded-xl px-3 py-2 text-xs focus-within:border-[#2D6A4F] focus-within:bg-white transition-all">
                        <MapPin size={14} className="text-[#2D6A4F] shrink-0" />
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Masukkan alamat lengkap pengantaran..."
                          className="w-full bg-transparent text-xs text-[#143628] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. Rincian Pembayaran Transparan */}
                <div className="p-5 rounded-[18px] bg-[#FFFFFF] border border-[#DCE5DB] space-y-3">
                  <h4 className="text-caption-strong text-[#143628] border-b border-[#DCE5DB] pb-2 flex items-center justify-between">
                    <span>Rincian Pembayaran</span>
                    <span className="text-fine-print font-normal text-[#597367]">Bebas Biaya Admin</span>
                  </h4>

                  <div className="flex justify-between text-caption-apple text-[#597367]">
                    <span>Harga Makanan ({item.portionCount} porsi)</span>
                    <span className="text-[#143628] font-medium">
                      {item.isFree ? 'Rp 0 (100% Gratis)' : formatPrice(item.price)}
                    </span>
                  </div>

                  {fulfillmentMethod === 'courier' && (
                    <>
                      <div className="flex justify-between text-caption-apple text-[#597367]">
                        <span>Ongkos Kirim Kurir ({deliveryFeeInfo.distanceKm} km)</span>
                        <span className="text-[#143628] font-medium">
                          Rp {(deliveryFeeInfo.baseFee + deliveryFeeInfo.distanceFee).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between text-caption-apple text-[#597367]">
                        <span>Biaya Tas Termal Higienis</span>
                        <span className="text-[#143628] font-medium">
                          Rp {deliveryFeeInfo.ecoHandlingFee.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-caption-apple text-[#597367]">
                    <span>Biaya Penyelamatan Pangan (ESG)</span>
                    <span className="text-[#16a34a] font-medium">Rp 0 (Subsidi AksesPangan)</span>
                  </div>

                  <div className="pt-2 border-t border-[#DCE5DB] flex justify-between items-center">
                    <div>
                      <span className="text-body-strong text-[#143628] font-bold">Total Pembayaran</span>
                      <p className="text-fine-print text-[#597367] m-0">
                        {fulfillmentMethod === 'courier'
                          ? 'Bayar tunai/QRIS ke kurir saat makanan tiba'
                          : 'Ambil langsung di resto'}
                      </p>
                    </div>
                    <span className="text-display-md text-[#143628] font-bold">
                      Rp {totalPayment.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Quick Quality Teaser Card */}
                <div className="p-4 rounded-[16px] bg-[#FAF7F2] border border-[#DCE5DB] flex items-start gap-3">
                  <ShieldCheck size={18} className="text-[#2D6A4F] flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-[#597367]">
                    <span className="font-semibold text-[#143628]">Penjaminan Mutu Pangan:</span> {guideline.reheatingInstructions}
                    <button
                      type="button"
                      onClick={() => setActiveTab('keamanan')}
                      className="block mt-1 font-semibold text-[#2D6A4F] underline hover:opacity-75 cursor-pointer"
                    >
                      Lihat instruksi penyimpanan & Do's/Don'ts lengkap →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* 5. Complete Food Safety & Storage Specs Tab */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB]">
                    <div className="text-fine-print text-[#597367] mb-1 flex items-center gap-1">
                      <ThermometerSun size={13} className="text-[#2D6A4F]" /> Suhu Penyimpanan
                    </div>
                    <div className="text-caption-strong text-[#143628]">
                      {guideline.storageTemp}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB]">
                    <div className="text-fine-print text-[#597367] mb-1 flex items-center gap-1">
                      <Clock size={13} className="text-[#2D6A4F]" /> Maks. Suhu Ruang
                    </div>
                    <div className="text-caption-strong text-[#143628]">
                      {guideline.maxSafeHours} Jam sejak diambil
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB]">
                    <div className="text-fine-print text-[#597367] mb-1 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-[#16a34a]" /> Maks. Kulkas (&lt;4°C)
                    </div>
                    <div className="text-caption-strong text-[#143628]">
                      {guideline.maxRefrigeratedHours} Jam
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-[16px] bg-[#FFF2EB] border border-[#FAD7C8]">
                  <div className="text-caption-strong text-[#2D6A4F] mb-1 flex items-center gap-1.5 font-bold">
                    <Flame size={16} /> Tata Cara Pemanasan Ulang (Reheating)
                  </div>
                  <p className="text-caption-apple text-[#933719] m-0 leading-relaxed">
                    {guideline.reheatingInstructions}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[16px] bg-[#F1F8F3] border border-[#CDE5D4]">
                    <h5 className="text-caption-strong text-[#1E5D34] mb-2 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={16} className="text-[#16a34a]" /> Hal yang Boleh Dilakukan (Do's)
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
          <div className="pt-4 border-t border-[#DCE5DB] space-y-4">
            <label className="flex items-start gap-3 cursor-pointer select-none bg-[#FAF7F2] p-3 rounded-[12px] border border-[#DCE5DB]">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-[#143628] cursor-pointer"
              />
              <span className="text-xs text-[#143628] leading-snug">
                Saya menyetujui panduan keselamatan mutu makanan di atas dan berkomitmen untuk menerima/mengambil makanan sebelum batas waktu habis.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] font-medium text-sm py-3 rounded-xl border border-[#DCE5DB] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {isLoading
                  ? 'Memproses Pesanan...'
                  : fulfillmentMethod === 'courier'
                  ? `Konfirmasi & Panggil Kurir (Rp ${totalPayment.toLocaleString('id-ID')})`
                  : 'Konfirmasi Ambil Mandiri'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Interactive Payment Gateway Sandbox Modal (Midtrans Snap Style) */}
        {isPaymentGatewayOpen && (
          <PaymentGatewayModal
            isOpen={isPaymentGatewayOpen}
            onClose={() => setIsPaymentGatewayOpen(false)}
            orderId={`AP-${Date.now().toString().slice(-7)}`}
            amount={totalPayment}
            itemName={item.name}
            deliveryFee={fulfillmentMethod === 'courier' ? deliveryFeeInfo.totalFee : 0}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    );
  }
