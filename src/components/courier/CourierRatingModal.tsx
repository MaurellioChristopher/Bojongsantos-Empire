'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  CheckCircle2,
  Heart,
  Bike,
  Sparkles,
  Send,
  ThumbsUp,
} from 'lucide-react';
import { submitCourierReview } from '@/services/courierService';
import type { Booking, CourierRating, CourierDriver } from '@/types';

interface CourierRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onRatingSubmitted?: (rating: CourierRating) => void;
}

const FEEDBACK_TAGS = [
  '⚡ Cepat & Tepat Waktu',
  '🍲 Pangan Hangat & Higienis',
  '😊 Kurir Ramah & Sopan',
  '📍 Mudah Menemukan Alamat',
  '🛡️ Protokol Aman Terjaga',
  '🎒 Tas Termal Bersih',
];

const TIP_OPTIONS = [0, 2000, 5000, 10000];

export function CourierRatingModal({
  isOpen,
  onClose,
  booking,
  onRatingSubmitted,
}: CourierRatingModalProps) {
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⚡ Cepat & Tepat Waktu',
    '🍲 Pangan Hangat & Higienis',
  ]);
  const [reviewText, setReviewText] = useState('');
  const [tipAmount, setTipAmount] = useState<number>(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const courier: CourierDriver = booking.courier || {
    id: 'driver-01',
    name: 'Budi Prasetyo',
    phone: '0812-3456-7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    vehicleType: 'motor',
    plateNumber: 'D 4521 BOJ',
    rating: 4.9,
    totalReviews: 148,
    completedDeliveries: 382,
    badge: 'Top Courier • Food Safety Certified',
    currentCoords: { lat: -6.9745, lng: 107.6312 },
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getStarLabel = (stars: number) => {
    switch (stars) {
      case 1:
        return 'Kurang Memuaskan 🙁';
      case 2:
        return 'Cukup 😐';
      case 3:
        return 'Baik 🙂';
      case 4:
        return 'Sangat Baik 😊';
      case 5:
        return 'Luar Biasa & Sangat Higienis! 🌟';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ratingPayload: CourierRating = {
      rating: selectedStars,
      reviewText: reviewText.trim() || undefined,
      tags: selectedTags,
      tipAmount: tipAmount > 0 ? tipAmount : undefined,
      createdAt: new Date().toISOString(),
    };

    submitCourierReview(booking.id, ratingPayload, courier.id);

    if (onRatingSubmitted) {
      onRatingSubmitted(ratingPayload);
    }

    setIsSubmitting(false);
    setIsSubmittedSuccess(true);

    setTimeout(() => {
      setIsSubmittedSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-[#0C2017]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-md bg-[#FFFFFF] rounded-[24px] border border-[#DCE5DB] shadow-2xl overflow-hidden p-6 sm:p-7 text-[#143628]"
      >
        {isSubmittedSuccess ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#EBF7EE] text-[#2D6A4F] flex items-center justify-center shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-[#143628]">Ulasan Berhasil Dikirim!</h3>
            <p className="text-xs text-[#597367] max-w-xs">
              Terima kasih! Penilaian Anda membantu menjaga standar higienitas dan mutu mitra kurir AksesPangan.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DB]">
              <div className="flex items-center gap-2">
                <Bike size={18} className="text-[#2D6A4F]" />
                <h3 className="font-bold text-sm text-[#143628]">Ulasan & Rating Mitra Kurir</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-stone-100 text-[#597367] transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>

            {/* Courier Profile Overview */}
            <div className="flex items-center gap-3.5 my-4 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#DCE5DB]">
              <img
                src={courier.avatar}
                alt={courier.name}
                className="w-14 h-14 rounded-2xl object-cover border border-[#DCE5DB] shrink-0"
              />
              <div>
                <div className="font-bold text-sm text-[#143628] flex items-center gap-1.5">
                  <span>{courier.name}</span>
                  <span className="text-[10px] bg-[#EBF7EE] text-[#2D6A4F] px-1.5 py-0.2 rounded-md font-mono font-bold">
                    {courier.plateNumber}
                  </span>
                </div>
                <div className="text-xs text-[#597367] mt-0.5">
                  Pengantaran {booking.surplusName} ({booking.quantity} kg)
                </div>
                <div className="text-[11px] text-[#16a34a] font-semibold mt-0.5 flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>{courier.badge}</span>
                </div>
              </div>
            </div>

            {/* Interactive Star Rating */}
            <div className="text-center py-2">
              <div className="text-xs text-[#597367] font-semibold mb-2">
                Bagaimana kualitas pengantaran oleh kurir?
              </div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverStars || selectedStars) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverStars(star)}
                      onMouseLeave={() => setHoverStars(null)}
                      onClick={() => setSelectedStars(star)}
                      className="p-1 transition-transform hover:scale-120 active:scale-95 cursor-pointer"
                    >
                      <Star
                        size={32}
                        className={
                          isFilled
                            ? 'text-[#FBBF24] fill-[#FBBF24] drop-shadow-xs'
                            : 'text-[#DCE5DB]'
                        }
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-bold text-[#2D6A4F] mt-1.5 h-4">
                {getStarLabel(hoverStars || selectedStars)}
              </div>
            </div>

            {/* Quick Feedback Chips */}
            <div className="my-3 space-y-1.5">
              <span className="text-[11px] font-semibold text-[#597367]">Poin yang Anda sukai:</span>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                          : 'bg-white text-[#143628] border-[#DCE5DB] hover:bg-[#F7F9F6]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Comment Box */}
            <div className="my-3">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tulis pesan atau apresiasi untuk kurir (opsional)..."
                rows={2}
                className="w-full p-3 bg-[#F7F9F6] border border-[#DCE5DB] rounded-xl text-xs text-[#143628] placeholder:text-[#597367]/60 focus:bg-white focus:outline-hidden focus:border-[#2D6A4F] transition-all resize-none"
              />
            </div>

            {/* Courier Tip Options */}
            <div className="my-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#DCE5DB]">
              <div className="text-[11px] font-bold text-[#143628] flex items-center justify-between mb-2">
                <span className="flex items-center gap-1">
                  <Heart size={12} className="text-[#E63946] fill-[#E63946]" />
                  Beri Tip untuk Mitra Kurir:
                </span>
                <span className="font-mono text-[#2D6A4F]">
                  {tipAmount > 0 ? `+Rp ${tipAmount.toLocaleString('id-ID')}` : 'Tanpa Tip'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {TIP_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTipAmount(val)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                      tipAmount === val
                        ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                        : 'bg-white text-[#143628] border-[#DCE5DB] hover:bg-stone-50'
                    }`}
                  >
                    {val === 0 ? 'Nanti' : `Rp ${val.toLocaleString('id-ID')}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Lewati
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-[#2D6A4F] hover:bg-[#1C4736] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Send size={13} />
                <span>Kirim Penilaian</span>
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
