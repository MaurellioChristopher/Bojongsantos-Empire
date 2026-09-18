'use client';

import { useState } from 'react';
import { Mail, Lock, Phone, User, Building2, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { UserRole, BusinessType } from '@/types';

export function RegisterPage() {
  const { register, loginWithGoogle, loginWithGoogleDemo } = useAuth();
  const { success, error } = useNotification();
  const [role, setRole] = useState<UserRole>('penerima');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleGuideModal, setShowGoogleGuideModal] = useState(false);

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle(role);
      if (!result.success) {
        setShowGoogleGuideModal(true);
      }
    } catch {
      setShowGoogleGuideModal(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleDemoSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogleDemo(role);
      if (result.success) {
        success(
          'Pendaftaran Google Berhasil',
          `Akun ${role === 'penyedia' ? 'Penyedia (Mitra Terverifikasi)' : 'Penerima'} Google siap digunakan`
        );
        setShowGoogleGuideModal(false);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#F7F9F6] flex flex-col justify-between text-[#143628]">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] shadow-[0_8px_32px_rgba(44,34,29,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Editorial Showcase (lg: 6 cols) */}
          <div className="relative lg:col-span-6 bg-[#0C2017] text-[#F3F8F5] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Real Photography Background with Warm Cacao Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-100"
              style={{ backgroundImage: 'url(/images/hero-food-delivery.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081710] via-[#0C2017]/90 to-[#0C2017]/95" />

            {/* Content Top */}
            <div className="relative z-10">
              <a href="#/" className="inline-flex items-center gap-3 no-underline group mb-10">
                <div className="w-8 h-8 rounded-md bg-[#F3F8F5] text-[#0C2017] flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                  AP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F3F8F5] leading-none">
                    AksesPangan
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#CAD6C8] mt-1">
                    Registrasi Pengguna
                  </span>
                </div>
              </a>

              <div className="max-w-md">
                <p className="text-xs font-mono uppercase tracking-widest text-[#2D6A4F] mb-3 font-semibold">
                  Gerakan Kolaborasi
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F3F8F5] leading-snug mb-4">
                  Bergabung dalam ekosistem penyelamatan pangan berkelanjutan.
                </h2>
                <p className="text-sm text-[#CAD6C8] leading-relaxed mb-8">
                  Pilih peran Anda untuk mendistribusikan makanan berlebih atau mengklaim pangan berkualitas dengan verifikasi digital yang aman dan bermartabat.
                </p>

                <div className="space-y-3 text-xs text-[#CAD6C8]">
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F8F5]/10">
                    <span className="font-mono text-[#2D6A4F] text-xs font-bold">01</span>
                    <span>Proses pendaftaran instan tanpa biaya platform</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F8F5]/10">
                    <span className="font-mono text-[#2D6A4F] text-xs font-bold">02</span>
                    <span>Verifikasi tiket QR digital untuk serah terima higienis</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F8F5]/10">
                    <span className="font-mono text-[#2D6A4F] text-xs font-bold">03</span>
                    <span>Laporan metrik ESG dan pengurangan limbah terukur</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="relative z-10 pt-6 border-t border-[#F3F8F5]/10 text-xs text-[#A8988B]">
              Standar Keamanan Pangan & Privasi Data Terjamin
            </div>
          </div>

          {/* RIGHT COLUMN: Clean Gourmet Form (lg: 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#FFFFFF]">
            <div className="max-w-sm w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-[#143628]">
                    Daftar Akun
                  </h2>
                  {role === 'penyedia' && (
                    <span className="text-xs font-mono text-[#597367] bg-[#EDF2EC] px-2 py-0.5 rounded-full border border-[#DCE5DB]">
                      Langkah {step} dari {totalSteps}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#597367] mt-1">
                  Pilih peran Anda dalam ekosistem pangan.
                </p>
              </div>

              {/* Segmented Control for Role */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#EDF2EC] rounded-xl border border-[#DCE5DB] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setRole('penerima');
                    setStep(1);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    role === 'penerima'
                      ? 'bg-[#FFFFFF] text-[#143628] shadow-xs font-semibold border border-[#DCE5DB]'
                      : 'text-[#597367] hover:text-[#143628]'
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
                      ? 'bg-[#FFFFFF] text-[#143628] shadow-xs font-semibold border border-[#DCE5DB]'
                      : 'text-[#597367] hover:text-[#143628]'
                  }`}
                >
                  Penyedia (Mitra)
                </button>
              </div>

              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-3.5">
                  {/* Google Quick Registration */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={isGoogleLoading || isLoading}
                      className="w-full h-11 px-4 bg-white hover:bg-[#F3F7F2] active:bg-[#EAEFE9] text-[#143628] font-medium text-sm rounded-xl border border-[#DCE5DB] shadow-xs hover:border-[#CAD6C8] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                    >
                      {isGoogleLoading ? (
                        <div className="w-4 h-4 border-2 border-[#143628] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                      )}
                      <span>Daftar Cepat dengan Google</span>
                    </button>

                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E5ECE4]" />
                      </div>
                      <span className="relative bg-[#FFFFFF] px-3 text-[11px] font-mono uppercase tracking-wider text-[#597367]">
                        atau isi form manual
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#597367] pointer-events-none">
                        <User size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#597367] pointer-events-none">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#597367] pointer-events-none">
                        <Phone size={15} />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#597367] pointer-events-none">
                        <Lock size={15} />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!name || !email || !password || !phone}
                      className="w-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-sm hover:shadow-md"
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
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Nama Usaha Kuliner
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#597367] pointer-events-none">
                        <Building2 size={15} />
                      </div>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Contoh: Dapur Rasa Buahbatu"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Jenis Usaha
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 px-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all"
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
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Alamat Usaha (Lokasi Penjemputan)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 text-[#597367] pointer-events-none">
                        <MapPin size={15} />
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="Jl. Raya Buahbatu No. 120, Bandung..."
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm p-3 pl-10 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] font-medium text-sm h-11 rounded-xl transition-colors cursor-pointer border border-[#DCE5DB]"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || !businessName || !businessAddress}
                      className="flex-1 bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isLoading ? 'Memproses...' : 'Selesai'}
                    </button>
                  </div>
                </div>
              )}

              {/* Login Link */}
              <div className="mt-6 pt-5 border-t border-[#DCE5DB] text-center text-xs text-[#597367]">
                Sudah memiliki akun?{' '}
                <a
                  href="#/login"
                  className="font-semibold text-[#2D6A4F] hover:text-[#B8401A] hover:underline transition-colors"
                >
                  Masuk di sini
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Gourmet Footer */}
      <footer className="py-4 text-center text-xs text-[#597367] border-t border-[#DCE5DB] bg-[#F7F9F6]">
        <p className="m-0">
          AksesPangan &copy; 2026 • Platform Kolaborasi Penyelamatan Surplus Pangan
        </p>
      </footer>

      {/* Google OAuth Help & Demo Modal */}
      {showGoogleGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C2017]/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DCE5DB] shadow-2xl max-w-md w-full p-6 text-[#143628] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EDF2EC] flex items-center justify-center border border-[#DCE5DB] shadow-xs">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#143628]">Daftar Cepat via Google</h3>
                <p className="text-xs text-[#597367]">Supabase Authentication</p>
              </div>
            </div>

            <div className="bg-[#F7F9F6] p-3.5 rounded-xl border border-[#DCE5DB] text-xs text-[#2E4A3B] space-y-2 mb-4 leading-relaxed">
              <p className="font-medium text-[#143628]">
                Kode otentikasi Google telah aktif terintegrasi dengan Supabase Client!
              </p>
              <p>
                Jika Google Cloud Client ID belum diaktifkan di dashboard Supabase proyek Anda, Anda dapat langsung menguji alur pendaftaran menggunakan <strong>Akun Google Demo Terverifikasi</strong> di bawah ini.
              </p>
            </div>

            <div className="space-y-2 mb-5">
              <button
                type="button"
                onClick={handleGoogleDemoSignup}
                disabled={isGoogleLoading}
                className="w-full h-11 px-4 bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isGoogleLoading ? 'Memproses...' : `Daftar sebagai Akun Google Demo (${role})`}
              </button>

              <button
                type="button"
                onClick={() => setShowGoogleGuideModal(false)}
                className="w-full h-10 px-4 bg-white hover:bg-[#F3F7F2] text-[#597367] font-medium text-xs rounded-xl border border-[#DCE5DB] transition-all cursor-pointer"
              >
                Tutup & Isi Form Manual
              </button>
            </div>

            <div className="pt-3 border-t border-[#E5ECE4]">
              <p className="text-[11px] font-mono text-[#597367] uppercase tracking-wider mb-1.5">
                Cara Mengaktifkan Google di Supabase:
              </p>
              <ol className="text-[11px] text-[#597367] space-y-1 list-decimal list-inside leading-snug">
                <li>Buka Supabase Dashboard &rarr; Authentication &rarr; Providers</li>
                <li>Pilih <strong>Google</strong> & toggle Enabled</li>
                <li>Masukkan Client ID & Secret dari Google Cloud Console</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
