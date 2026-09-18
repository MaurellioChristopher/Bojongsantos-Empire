'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  User,
  UtensilsCrossed,
  Mail,
  Lock,
  Phone,
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { UserRole, BusinessType } from '@/types';

export function RegisterPage() {
  const { register } = useAuth();
  const { success, error } = useNotification();
  const [role, setRole] = useState<UserRole>('penerima');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('restoran');
  const [businessAddress, setBusinessAddress] = useState('');

  const totalSteps = role === 'penyedia' ? 2 : 1;

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const result = await register({
        name,
        email,
        password,
        role,
        phone,
        ...(role === 'penyedia' && {
          businessName,
          businessType,
          businessAddress,
          location: {
            lat: -6.2088 + (Math.random() - 0.5) * 0.05,
            lng: 106.8456 + (Math.random() - 0.5) * 0.05,
          },
        }),
      });

      if (result.success) {
        success('Pendaftaran Berhasil', 'Selamat datang di ekosistem AksesPangan');
        setTimeout(() => {
          if (role === 'penyedia') window.location.hash = '#/penyedia';
          else window.location.hash = '#/penerima';
        }, 500);
      } else {
        error('Pendaftaran Gagal', result.error || 'Terjadi kesalahan sistem');
      }
    } catch (err: any) {
      error('Pendaftaran Gagal', err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-between">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl bg-white rounded-[28px] border border-[rgba(0,0,0,0.07)] shadow-2xl shadow-neutral-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          
          {/* LEFT COLUMN: Visual Showcase & Benefits (lg: 6 cols) */}
          <div className="relative lg:col-span-6 bg-[#121216] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Background Image & Texture Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none scale-105"
              style={{ backgroundImage: 'url(/images/hero-food-delivery.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#121216]/95 via-[#18181f]/90 to-[#121216]/98 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF5A1F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FFB200]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Content Top */}
            <div className="relative z-10">
              <a href="#/" className="inline-flex items-center gap-3 no-underline group mb-8">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/25 transition-transform group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2.5L3.5 8.5L12 14.5L20.5 8.5L12 2.5Z" fill="currentColor" />
                    <path
                      d="M3.5 13.5L12 19.5L20.5 13.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-white block leading-none">
                    AksesPangan
                  </span>
                  <span className="text-[11px] font-mono tracking-wider text-neutral-400 uppercase">
                    Pendaftaran Pengguna
                  </span>
                </div>
              </a>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-orange-200 mb-4 font-medium">
                <Sparkles size={12} className="text-amber-400" />
                <span>Bergabunglah Bersama 450+ Relawan & Mitra</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-[1.2] mb-3">
                Wujudkan Ekosistem Pangan Inklusif & Berkelanjutan.
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed mb-8">
                Pilih peran Anda untuk mulai menyelamatkan makanan surplus dari restoran, kafe, dan hotel di sekitar Anda.
              </p>

              {/* 3 Value Propositions */}
              <div className="space-y-4 max-w-md mb-8">
                <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UtensilsCrossed size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Bagi Mitra Penyedia</h4>
                    <p className="text-[11px] text-neutral-400 m-0 leading-normal">
                      Kurangi biaya limbah, catat kontribusi ESG riil, dan bantu warga sekitar secara terukur.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HeartHandshake size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Bagi Penerima Manfaat</h4>
                    <p className="text-[11px] text-neutral-400 m-0 leading-normal">
                      Akses makanan lezat dan higienis gratis atau bersubsidi dengan tiket QR digital bermartabat.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trust Guarantee */}
            <div className="relative z-10 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                Data & Kontak Terenkripsi Aman
              </span>
              <span className="font-mono">100% Gratis</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Multi-Step Register Form (lg: 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono font-semibold tracking-wider text-[#FF5A1F]">
                    Langkah Pendaftaran
                  </span>
                  {role === 'penyedia' && (
                    <span className="text-xs font-mono font-semibold text-neutral-400">
                      Langkah {step} dari {totalSteps}
                    </span>
                  )}
                </div>
                <h2 className="text-display-md text-[#1d1d1f] font-bold tracking-tight mt-1">
                  Buat Akun Baru
                </h2>
                <p className="text-body-apple text-[#86868b] text-xs sm:text-sm mt-1">
                  Pilih peran Anda dalam ekosistem penyelamatan makanan.
                </p>
              </div>

              {/* Role Selection Toggle */}
              <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 bg-[#f7f7f9] rounded-2xl border border-neutral-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setRole('penerima');
                    setStep(1);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-2 ${
                    role === 'penerima'
                      ? 'bg-white text-[#1d1d1f] shadow-sm border border-neutral-200 ring-2 ring-[#FF5A1F]/15'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <User size={14} className={role === 'penerima' ? 'text-[#FF5A1F]' : ''} />
                  <span>Penerima (Warga)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('penyedia');
                    setStep(1);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-2 ${
                    role === 'penyedia'
                      ? 'bg-white text-[#1d1d1f] shadow-sm border border-neutral-200 ring-2 ring-[#FF5A1F]/15'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <UtensilsCrossed size={14} className={role === 'penyedia' ? 'text-[#FF5A1F]' : ''} />
                  <span>Penyedia (Mitra)</span>
                </button>
              </div>

              {/* STEP 1: Personal Account Info */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="apple-input pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="apple-input pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <Phone size={15} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="apple-input pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <Lock size={15} />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="apple-input pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!name || !email || !password || !phone}
                      className="btn-apple-primary w-full text-sm font-semibold py-3 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {role === 'penyedia' ? (
                        <>
                          <span>Lanjut: Info Usaha Mitra</span>
                          <ArrowRight size={15} />
                        </>
                      ) : isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Mendaftarkan Akun...
                        </span>
                      ) : (
                        <>
                          <span>Selesaikan Pendaftaran</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Business Info (Only for Penyedia) */}
              {step === 2 && role === 'penyedia' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                      Nama Usaha / Restoran / Toko
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <Building2 size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Contoh: Dapur Sedap Buahbatu"
                        className="apple-input pl-10 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                      Kategori Usaha Kuliner
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="apple-input text-sm"
                    >
                      <option value="restoran">Restoran / Rumah Makan</option>
                      <option value="hotel">Hotel & Convention</option>
                      <option value="kafe">Kafe / Coffee Shop</option>
                      <option value="katering">Jasa Katering / Event</option>
                      <option value="supermarket">Bakery / Supermarket</option>
                      <option value="lainnya">Usaha Makanan Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1d1d1f] mb-1">
                      Alamat Usaha (Lokasi Penjemputan Makanan)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 text-neutral-400 pointer-events-none">
                        <MapPin size={15} />
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Jl. Raya Buahbatu No. 120, Kota Bandung..."
                        className="apple-input pl-10 text-sm h-auto py-2.5"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn-apple-secondary flex-1 py-3 text-sm flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      <span>Kembali</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || !businessName || !businessAddress}
                      className="btn-apple-primary flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Memproses...
                        </span>
                      ) : (
                        <>
                          <span>Mulai Jadi Mitra</span>
                          <Check size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Login Link */}
              <div className="mt-6 pt-5 border-t border-neutral-100 text-center text-xs text-[#86868b]">
                Sudah memiliki akun terdaftar?{' '}
                <a
                  href="#/login"
                  className="font-semibold text-[#FF5A1F] hover:underline transition-colors inline-flex items-center gap-0.5"
                >
                  Masuk di sini
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Brand Info */}
      <footer className="py-4 text-center text-fine-print text-neutral-400 border-t border-neutral-200/60 bg-white/50 backdrop-blur-sm">
        <p className="m-0">
          AksesPangan &copy; 2026 • Platform Berkelanjutan Penyelamatan Surplus Makanan & Ketahanan Pangan
        </p>
      </footer>
    </div>
  );
}
