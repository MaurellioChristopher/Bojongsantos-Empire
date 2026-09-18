'use client';

import React from 'react';
import { Award, Printer, X, CheckCircle2, ShieldCheck, Leaf, Globe } from 'lucide-react';
import type { User } from '@/types';

interface EsgCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  totalKgSaved: number;
  totalCompletedCount: number;
}

export function EsgCertificateModal({
  isOpen,
  onClose,
  user,
  totalKgSaved,
  totalCompletedCount,
}: EsgCertificateModalProps) {
  if (!isOpen) return null;

  const co2Prevented = Math.round(totalKgSaved * 2.5 * 10) / 10;
  const portions = Math.round(totalKgSaved * 2.5);
  const certNumber = `AP-ESG-2026-${user.id ? user.id.slice(-6).toUpperCase() : 'BDG01'}`;
  const issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0C2017]/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 print:m-0 print:border-none print:shadow-none print:max-w-none">
        
        {/* Header Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE5DB] bg-[#F7F9F6] print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#2D6A4F]">
            <ShieldCheck size={16} />
            <span>Sertifikat Terverifikasi AksesPangan</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-xs font-medium rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#597367] hover:text-[#143628] hover:bg-[#EDF2EC] transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CERTIFICATE BODY (Aesthetic Warm Gourmet Parchment) */}
        <div className="p-8 sm:p-12 bg-[#FBFDFB] text-[#143628] relative">
          
          {/* Ornate Inner Border */}
          <div className="border-2 border-[#DCE5DB] p-6 sm:p-10 rounded-xl relative bg-white/70">
            {/* Corner Accents */}
            <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#2D6A4F]" />
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#2D6A4F]" />
            <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#2D6A4F]" />
            <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#2D6A4F]" />

            {/* Top Logo & Credential */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EDF2EC] text-[#2D6A4F] mb-3 shadow-xs border border-[#DCE5DB]">
                <Award size={24} />
              </div>
              <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#597367]">
                AKSES PANGAN • ESG INITIATIVE
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#143628] mt-1 mb-1 font-bold">
                Sertifikat Penyelamat Pangan & Iklim
              </h1>
              <p className="text-xs text-[#597367] max-w-lg mx-auto">
                Diberikan sebagai pengakuan atas dedikasi dan kontribusi nyata dalam penekanan food waste dan perlindungan lingkungan hidup.
              </p>
            </div>

            {/* Awardee Presentation */}
            <div className="text-center my-6 py-4 border-y border-[#E5ECE4]">
              <div className="text-[11px] uppercase tracking-wider text-[#597367] mb-1">
                Diberikan Secara Resmi Kepada:
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#143628] tracking-tight">
                {user.businessName || user.name}
              </div>
              <div className="text-xs text-[#597367] mt-0.5">
                {user.businessAddress || 'Bandung Raya, Jawa Barat'} • Mitra Terverifikasi
              </div>
            </div>

            {/* Verified Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 my-6 text-center">
              <div className="p-3 bg-[#F7F9F6] rounded-xl border border-[#DCE5DB]">
                <div className="text-lg sm:text-2xl font-bold font-mono text-[#143628]">
                  {totalKgSaved.toFixed(1)} <span className="text-xs font-normal">kg</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#597367] mt-0.5">
                  Surplus Terselamatkan
                </div>
              </div>
              <div className="p-3 bg-[#F7F9F6] rounded-xl border border-[#DCE5DB]">
                <div className="text-lg sm:text-2xl font-bold font-mono text-[#2D6A4F]">
                  {co2Prevented} <span className="text-xs font-normal">kg CO₂e</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#597367] mt-0.5">
                  Emisi Gas Dicegah
                </div>
              </div>
              <div className="p-3 bg-[#F7F9F6] rounded-xl border border-[#DCE5DB]">
                <div className="text-lg sm:text-2xl font-bold font-mono text-[#143628]">
                  {portions} <span className="text-xs font-normal">porsi</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#597367] mt-0.5">
                  Akses Pangan Tersalurkan
                </div>
              </div>
            </div>

            {/* SDGs Compliance Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 my-6 text-xs text-[#2E4A3B]">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EDF2EC] rounded-full border border-[#DCE5DB] text-[11px] font-medium">
                <Globe size={13} className="text-[#2D6A4F]" />
                <span>SDG 2: Zero Hunger</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EDF2EC] rounded-full border border-[#DCE5DB] text-[11px] font-medium">
                <Leaf size={13} className="text-[#2D6A4F]" />
                <span>SDG 12: Responsible Consumption</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EDF2EC] rounded-full border border-[#DCE5DB] text-[11px] font-medium">
                <CheckCircle2 size={13} className="text-[#2D6A4F]" />
                <span>Green Food Safety Audit</span>
              </div>
            </div>

            {/* Signatures & Verification Stamp */}
            <div className="flex items-end justify-between pt-6 border-t border-[#E5ECE4] text-xs text-[#597367]">
              <div>
                <div className="font-mono text-[10px] text-[#597367]/80">NOMOR REGISTRASI:</div>
                <div className="font-mono font-bold text-[#143628] text-xs">{certNumber}</div>
                <div className="text-[10px] text-[#597367] mt-0.5">Terbit: {issueDate}</div>
              </div>

              {/* Stamp Seal */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#2D6A4F] flex flex-col items-center justify-center text-[8px] font-bold uppercase text-[#2D6A4F] tracking-tighter rotate-[-12deg] bg-[#2D6A4F]/5">
                <span>AKSES PANGAN</span>
                <span>VERIFIED</span>
                <span>ESG 2026</span>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-base text-[#143628] font-bold mb-1">
                  Prof. Dr. Ir. Pangan Lestari
                </div>
                <div className="text-[10px] text-[#597367]">Komite Penilai Keberlanjutan Pangan</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
