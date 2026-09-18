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
    <div className="min-h-screen bg-[#FBF7F0] flex flex-col justify-between text-[#2C221D]">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-[#FFFDF9] rounded-2xl border border-[#EADECF] shadow-[0_8px_32px_rgba(44,34,29,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Editorial Showcase (lg: 6 cols) */}
          <div className="relative lg:col-span-6 bg-[#18110D] text-[#FAF6F0] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Real Photography Background with Warm Cacao Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-100"
              style={{ backgroundImage: 'url(/images/hero-food-delivery.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140E0A] via-[#18110D]/90 to-[#18110D]/95" />

            {/* Content Top */}
            <div className="relative z-10">
              <a href="#/" className="inline-flex items-center gap-3 no-underline group mb-10">
                <div className="w-8 h-8 rounded-md bg-[#FAF6F0] text-[#18110D] flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                  AP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FAF6F0] leading-none">
                    AksesPangan
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#D4C3AF] mt-1">
                    Registrasi Pengguna
                  </span>
                </div>
              </a>

              <div className="max-w-md">
                <p className="text-xs font-mono uppercase tracking-widest text-[#D95327] mb-3 font-semibold">
                  Gerakan Kolaborasi
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#FAF6F0] leading-snug mb-4">
                  Bergabung dalam ekosistem penyelamatan pangan berkelanjutan.
                </h2>
                <p className="text-sm text-[#D4C3AF] leading-relaxed mb-8">
                  Pilih peran Anda untuk mendistribusikan makanan berlebih atau mengklaim pangan berkualitas dengan verifikasi digital yang aman dan bermartabat.
                </p>

                <div className="space-y-3 text-xs text-[#D4C3AF]">
                  <div className="flex items-center gap-3 py-2 border-b border-[#FAF6F0]/10">
                    <span className="font-mono text-[#D95327] text-xs font-bold">01</span>
                    <span>Proses pendaftaran instan tanpa biaya platform</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-[#FAF6F0]/10">
                    <span className="font-mono text-[#D95327] text-xs font-bold">02</span>
                    <span>Verifikasi tiket QR digital untuk serah terima higienis</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-[#FAF6F0]/10">
                    <span className="font-mono text-[#D95327] text-xs font-bold">03</span>
                    <span>Laporan metrik ESG dan pengurangan limbah terukur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="relative z-10 pt-6 border-t border-[#FAF6F0]/10 text-xs text-[#A8988B]">
              Standar Keamanan Pangan & Privasi Data Terjamin
            </div>
          </div>

          {/* RIGHT COLUMN: Clean Gourmet Form (lg: 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#FFFDF9]">
            <div className="max-w-sm w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-[#2C221D]">
                    Daftar Akun
                  </h2>
                  {role === 'penyedia' && (
                    <span className="text-xs font-mono text-[#7D6F64] bg-[#F5EFEB] px-2 py-0.5 rounded-full border border-[#EADECF]">
                      Langkah {step} dari {totalSteps}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#7D6F64] mt-1">
                  Pilih peran Anda dalam ekosistem pangan.
                </p>
              </div>

              {/* Segmented Control for Role */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5EFEB] rounded-xl border border-[#EADECF] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setRole('penerima');
                    setStep(1);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    role === 'penerima'
                      ? 'bg-[#FFFDF9] text-[#2C221D] shadow-xs font-semibold border border-[#EADECF]'
                      : 'text-[#7D6F64] hover:text-[#2C221D]'
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
                      ? 'bg-[#FFFDF9] text-[#2C221D] shadow-xs font-semibold border border-[#EADECF]'
                      : 'text-[#7D6F64] hover:text-[#2C221D]'
                  }`}
                >
                  Penyedia (Mitra)
                </button>
              </div>

              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#2C221D] mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6F64] pointer-events-none">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="w-full bg-[#FAF7F2] text-[#2C221D] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all placeholder:text-[#7D6F64]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2C221D] mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6F64] pointer-events-none">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-[#FAF7F2] text-[#2C221D] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all placeholder:text-[#7D6F64]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2C221D] mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6F64] pointer-events-none">
                        <Phone size={15} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full bg-[#FAF7F2] text-[#2C221D] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all placeholder:text-[#7D6F64]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2C221D] mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6F64] pointer-events-none">
                        <Lock size={15} />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-[#FAF7F2] text-[#2C221D] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all placeholder:text-[#7D6F64]/60"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!name || !email || !password || !phone}
                      className="w-full bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
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
                    <label className="block text-xs font-medium text-[#2C221D] mb-1">
                      Nama Usaha Kuliner
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6F64] pointer-events-none">
                        <Building2 size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Contoh: Dapur Rasa Buahbatu"
                        className="w-full bg-[#FAF7F2] text-[#2C221D] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all placeholder:text-[#7D6F64]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#2C221D] mb-1">
                      Jenis Usaha
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="w-full bg-[#FAF7F2] text-[#2C221D] text-sm h-11 px-3.5 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all"
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
                    <label className="block text-xs font-medium text-[#2C221D] mb-1">
                      Alamat Usaha (Lokasi Penjemputan)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 text-[#7D6F64] pointer-events-none">
                        <MapPin size={15} />
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Jl. Raya Buahbatu No. 120, Bandung..."
                        className="w-full bg-[#FAF7F2] text-[#2C221D] text-sm p-3 pl-10 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all placeholder:text-[#7D6F64]/60"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-[#F5EFEB] hover:bg-[#EADECF] text-[#2C221D] font-medium text-sm h-11 rounded-xl transition-colors cursor-pointer border border-[#EADECF]"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || !businessName || !businessAddress}
                      className="flex-1 bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isLoading ? 'Memproses...' : 'Selesai'}
                    </button>
                  </div>
                </div>
              )}

              {/* Login Link */}
              <div className="mt-6 pt-5 border-t border-[#EADECF] text-center text-xs text-[#7D6F64]">
                Sudah memiliki akun?{' '}
                <a
                  href="#/login"
                  className="font-semibold text-[#D95327] hover:text-[#B8401A] hover:underline transition-colors"
                >
                  Masuk di sini
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Gourmet Footer */}
      <footer className="py-4 text-center text-xs text-[#7D6F64] border-t border-[#EADECF] bg-[#FBF7F0]">
        <p className="m-0">
          AksesPangan &copy; 2026 • Platform Kolaborasi Penyelamatan Surplus Pangan
        </p>
      </footer>
    </div>
  );
}
