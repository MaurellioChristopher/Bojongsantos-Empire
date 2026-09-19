'use client';

import React from 'react';
import { X, Clock, MapPin, ShieldCheck, Store } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking } from '@/types';
import { formatCountdown } from '@/lib/utils';

interface PickupTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function PickupTicketModal({ isOpen, onClose, booking }: PickupTicketModalProps) {
  if (!isOpen || !booking) return null;

  const pin = booking.pickupPin || '1234';
  const remaining = formatCountdown(booking.pickupDeadline);

  // QR payload encodes all data needed for penyedia scanner to auto-verify
  const qrPayload = JSON.stringify({
    bookingId: booking.id,
    pin,
    surplusId: booking.surplusId,
    recipientId: booking.recipientId,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C2017]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Ticket Top Header */}
        <div className="bg-[#143628] text-[#F3F8F5] px-6 py-5 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <ShieldCheck size={120} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#CAD6C8]">
              <ShieldCheck size={14} className="text-[#84A98C]" />
              <span>Tiket Resmi Pengambilan</span>
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight mt-0.5">
              Digital Boarding Pass
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6 space-y-5 bg-white text-[#143628]">

          {/* Surplus Item Overview */}
          <div className="flex items-start gap-3.5 pb-4 border-b border-[#E5ECE4]">
            <img
              src={booking.surplusPhoto || '/images/surplus-nasi-padang.jpg'}
              alt={booking.surplusName}
              className="w-16 h-16 rounded-xl object-cover border border-[#DCE5DB] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#EDF2EC] text-[#2D6A4F] font-semibold mb-1">
                {booking.quantity} kg Makanan
              </span>
              <h4 className="text-sm font-semibold text-[#143628] truncate">
                {booking.surplusName}
              </h4>
              <p className="text-xs text-[#597367] flex items-center gap-1 mt-0.5">
                <Store size={12} />
                <span className="truncate">{booking.providerBusinessName}</span>
              </p>
            </div>
          </div>

          {/* QR Code & PIN Presentation */}
          <div className="bg-[#F7F9F6] p-5 rounded-2xl border border-[#DCE5DB] text-center space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#597367]">
              Tunjukkan QR Code ke Penyedia / Sebutkan PIN:
            </div>

            {/* Real scannable QR code */}
            <div className="inline-flex p-3.5 bg-white rounded-xl shadow-xs border border-[#DCE5DB]">
              <QRCodeSVG
                value={qrPayload}
                size={148}
                bgColor="#ffffff"
                fgColor="#143628"
                level="M"
                includeMargin={false}
              />
            </div>

            {/* 4-Digit Large PIN Box */}
            <div className="pt-1">
              <div className="text-[10px] text-[#597367] uppercase font-mono tracking-widest mb-1.5">
                4-DIGIT PIN SERAH TERIMA
              </div>
              <div className="inline-flex items-center gap-2">
                {pin.split('').map((char, i) => (
                  <div
                    key={i}
                    className="w-10 h-11 rounded-lg bg-white border border-[#DCE5DB] shadow-xs flex items-center justify-center font-mono font-bold text-xl text-[#143628]"
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Deadline Info */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7F9F6] border border-[#DCE5DB]">
              <MapPin size={16} className="text-[#2D6A4F] shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-[#143628]">Alamat Pengambilan</div>
                <div className="text-[#597367] mt-0.5 leading-relaxed">{booking.pickupAddress}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9F6] border border-[#DCE5DB]">
              <div className="flex items-center gap-2 text-[#597367]">
                <Clock size={15} className="text-[#B8401A]" />
                <span>Batas Pengambilan:</span>
              </div>
              <span className="font-semibold font-mono text-[#B8401A]">
                {remaining || 'Hari ini'}
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <button
            onClick={onClose}
            className="w-full h-11 bg-[#143628] hover:bg-[#1C4736] text-white font-medium text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Tutup Tiket
          </button>
        </div>

      </div>
    </div>
  );
}
