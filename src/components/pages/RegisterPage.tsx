'use client';

import { useState } from 'react';
import { Mail, Lock, Phone, User, Building2, MapPin } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between text-[#1d1d1f]">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Editorial Showcase (lg: 6 cols) */}
          <div className="relative lg:col-span-6 bg-[#161617] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Real Photography Background with Natural Dark Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-100"
              style={{ backgroundImage: 'url(/images/hero-food-delivery.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161617] via-[#161617]/85 to-[#161617]/95" />

            {/* Content Top */}
            <div className="relative z-10">
              <a href="#/" className="inline-flex items-center gap-3 no-underline group mb-10">
                <div className="w-8 h-8 rounded-md bg-white text-[#161617] flex items-center justify-center font-bold text-xs tracking-wider">
                  AP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white leading-none">
                    AksesPangan
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#86868b] mt-1">
                    Registrasi Pengguna
                  </span>
                </div>
              </a>

              <div className="max-w-md">
                <p className="text-xs font-mono uppercase tracking-widest text-[#86868b] mb-3">
                  Gerakan Kolaborasi
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug mb-4">
                  Bergabung dalam ekosistem penyelamatan pangan berkelanjutan.
                </h2>
                <p className="text-sm text-[#a1a1a6] leading-relaxed mb-8">
                  Pilih peran Anda untuk mendistribusikan makanan berlebih atau mengklaim pangan berkualitas dengan verifikasi digital yang aman dan bermartabat.
                </p>

                <div className="space-y-3 text-xs text-[#a1a1a6]">
                  <div className="flex items-center gap-3 py-2 border-b border-white/10">
                    <span className="font-mono text-white text-xs">01</span>
                    <span>Proses pendaftaran instan tanpa biaya platform</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-white/10">
                    <span className="font-mono text-white text-xs">02</span>
                    <span>Verifikasi tiket QR digital untuk serah terima higienis</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-white/10">
                    <span className="font-mono text-white text-xs">03</span>
                    <span>Laporan metrik ESG dan pengurangan limbah terukur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-[#86868b]">
              Standar Keamanan Pangan & Privasi Data Terjamin
            </div>
          </div>

          {/* RIGHT COLUMN: Clean Apple-Grade Form (lg: 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                    Daftar Akun
                  </h2>
                  {role === 'penyedia' && (
                    <span className="text-xs font-mono text-[#86868b]">
                      Langkah {step} dari {totalSteps}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#86868b] mt-1">
                  Pilih peran Anda dalam ekosistem pangan.
                </p>
              </div>

              {/* Segmented Control for Role */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#f5f5f7] rounded-xl border border-[rgba(0,0,0,0.06)] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setRole('penerima');
                    setStep(1);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    role === 'penerima'
                      ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold border border-[rgba(0,0,0,0.08)]'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  Penerima (Warga)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('penyedia');
                    setStep(1);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    role === 'penyedia'
                      ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold border border-[rgba(0,0,0,0.08)]'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  Penyedia (Mitra)
                </button>
              </div>

              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="w-full bg-white text-[#111215] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#e5e7eb] focus:border-[#E8592A] focus:ring-2 focus:ring-[#E8592A]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111215] mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-white text-[#111215] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#e5e7eb] focus:border-[#E8592A] focus:ring-2 focus:ring-[#E8592A]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111215] mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                        <Phone size={15} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full bg-white text-[#111215] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#e5e7eb] focus:border-[#E8592A] focus:ring-2 focus:ring-[#E8592A]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1d1d1f] mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b] pointer-events-none">
                        <Lock size={15} />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-white text-[#111215] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#e5e7eb] focus:border-[#E8592A] focus:ring-2 focus:ring-[#E8592A]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!name || !email || !password || !phone}
                      className="w-full bg-[#111215] hover:bg-[#23252a] active:bg-black text-white font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      {role === 'penyedia' ? 'Lanjut: Data Usaha Mitra' : isLoading ? 'Mendaftarkan...' : 'Selesaikan Pendaftaran'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Business Info (Only for Penyedia) */}
              {step === 2 && role === 'penyedia' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#111215] mb-1">
                      Nama Usaha Kuliner
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none">
                        <Building2 size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Contoh: Dapur Rasa Buahbatu"
                        className="w-full bg-white text-[#111215] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#e5e7eb] focus:border-[#E8592A] focus:ring-2 focus:ring-[#E8592A]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111215] mb-1">
                      Jenis Usaha
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="w-full bg-white text-[#111215] text-sm h-11 px-3.5 rounded-xl border border-[#e5e7eb] focus:border-[#E8592A] focus:ring-2 focus:ring-[#E8592A]/15 outline-none transition-all"
                    >
                      <option value="restoran">Restoran / Rumah Makan</option>
                      <option value="hotel">Hotel</option>
                      <option value="kafe">Kafe / Kedai Kopi</option>
                      <option value="katering">Jasa Katering</option>
                      <option value="supermarket">Bakery / Supermarket</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111215] mb-1">
                      Alamat Usaha (Lokasi Penjemputan)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 text-[#6b7280] pointer-events-none">
                        <MapPin size={15} />
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Jl. Raya Buahbatu No. 120, Bandung..."
                        className="w-full bg-white text-[#111215] text-sm p-3 pl-10 rounded-xl border border-[#e5e7eb] focus:border-[#E8592A] focus:ring-2 focus:ring-[#E8592A]/15 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#111215] font-medium text-sm h-11 rounded-xl transition-colors cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || !businessName || !businessAddress}
                      className="flex-1 bg-[#111215] hover:bg-[#23252a] active:bg-black text-white font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Memproses...' : 'Selesai'}
                    </button>
                  </div>
                </div>
              )}

              {/* Login Link */}
              <div className="mt-6 pt-5 border-t border-[#f3f4f6] text-center text-xs text-[#6b7280]">
                Sudah memiliki akun?{' '}
                <a
                  href="#/login"
                  className="font-semibold text-[#E8592A] hover:text-[#D44719] hover:underline transition-colors"
                >
                  Masuk di sini
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Footer */}
      <footer className="py-4 text-center text-xs text-[#86868b] border-t border-[rgba(0,0,0,0.06)] bg-white">
        <p className="m-0">
          AksesPangan &copy; 2026 • Platform Kolaborasi Penyelamatan Surplus Pangan
        </p>
      </footer>
    </div>
  );
}
