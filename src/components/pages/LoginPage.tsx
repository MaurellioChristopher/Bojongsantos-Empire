'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { UserRole } from '@/types';
import { DEMO_CREDENTIALS } from '@/lib/constants';
import { getCurrentUser } from '@/lib/data';

export function LoginPage() {
  const { login, loginWithGoogle, loginWithGoogleDemo } = useAuth();
  const { success, error } = useNotification();
  const [role, setRole] = useState<UserRole>('penerima');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleGuideModal, setShowGoogleGuideModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle(role);
      if (!result.success) {
        // If Supabase OAuth failed or provider not enabled, show helper modal
        setShowGoogleGuideModal(true);
      }
    } catch {
      setShowGoogleGuideModal(true);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleDemoLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogleDemo(role);
      if (result.success) {
        success(
          'Autentikasi Google Berhasil',
          `Masuk sebagai ${role === 'penyedia' ? 'Penyedia (Mitra Terverifikasi)' : 'Penerima'} via Akun Google`
        );
        setShowGoogleGuideModal(false);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        success('Autentikasi Berhasil', 'Selamat datang kembali di AksesPangan');
        const currentUser = getCurrentUser();
        const finalRole = currentUser?.role || role;
        if (finalRole === 'penyedia') window.location.hash = '#/penyedia';
        else if (finalRole === 'admin') window.location.hash = '#/admin';
        else window.location.hash = '#/penerima';
      } else {
        error('Gagal Masuk', result.error || 'Email atau kata sandi tidak sesuai');
      }
    } catch (err: any) {
      error('Gagal Masuk', err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (r: UserRole) => {
    const cred = DEMO_CREDENTIALS[r];
    setEmail(cred.email);
    setPassword(cred.password);
    setRole(r);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] flex flex-col justify-between text-[#143628]">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] shadow-[0_4px_24px_rgba(60,40,20,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Editorial Photography & Authentic Narrative (lg: 6 cols) */}
          <div className="relative lg:col-span-6 bg-[#0C2017] text-[#F3F8F5] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Real Photography Background with Natural Warm Dark Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-100"
              style={{ backgroundImage: 'url(/images/hero-food-kitchen.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081710] via-[#0C2017]/85 to-[#0C2017]/95" />

            {/* Top Brand Identity */}
            <div className="relative z-10">
              <a href="#/" className="inline-flex items-center gap-3 no-underline group mb-10">
                <div className="w-8 h-8 rounded-md bg-[#F3F8F5] text-[#0C2017] flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
                  AP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F3F8F5] leading-none">
                    AksesPangan
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#F3F8F5]/60 mt-1">
                    Surplus Network
                  </span>
                </div>
              </a>

              <div className="max-w-md">
                <p className="text-xs font-mono uppercase tracking-widest text-[#F3F8F5]/70 mb-3">
                  Inisiatif Ketahanan Pangan
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F3F8F5] leading-snug mb-4">
                  Menghubungkan surplus makanan dengan kebutuhan nyata masyarakat.
                </h2>
                <p className="text-sm text-[#F3F8F5]/80 leading-relaxed mb-8">
                  Sistem distribusi terpadu yang membantu industri kuliner mendokumentasikan dampak lingkungan sekaligus memperluas akses pangan berkualitas secara bermartabat.
                </p>
              </div>
            </div>

            {/* Bottom Minimalist Metric Data */}
            <div className="relative z-10 pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#F3F8F5] tracking-tight">
                    12.450 kg
                  </div>
                  <div className="text-[11px] text-[#F3F8F5]/60 mt-1">
                    Pangan Terselamatkan
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#F3F8F5] tracking-tight">
                    31.200
                  </div>
                  <div className="text-[11px] text-[#F3F8F5]/60 mt-1">
                    Porsi Tersalurkan
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#F3F8F5] tracking-tight">
                    100%
                  </div>
                  <div className="text-[11px] text-[#F3F8F5]/60 mt-1">
                    Standar Mutu Uji
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Clean, Restrained Warm Gourmet Auth Form (lg: 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#FFFFFF]">
            <div className="max-w-sm w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-7">
                <h2 className="text-2xl font-semibold tracking-tight text-[#143628] mb-1.5">
                  Masuk ke Akun
                </h2>
                <p className="text-sm text-[#597367]">
                  Gunakan akun Anda atau pilih akun demo pengujian di bawah ini.
                </p>
              </div>

              {/* Clean 1-Click Demo Accounts Segmented Control */}
              <div className="mb-6">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#597367] mb-2">
                  Akun Demo Pengujian (1-Klik)
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#EDF2EC] rounded-xl border border-[#DCE5DB]">
                  <button
                    type="button"
                    onClick={() => fillDemo('penerima')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      role === 'penerima' && email === DEMO_CREDENTIALS.penerima.email
                        ? 'bg-[#FFFFFF] text-[#143628] shadow-xs font-semibold border border-[#DCE5DB]'
                        : 'text-[#597367] hover:text-[#143628]'
                    }`}
                  >
                    Penerima
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('penyedia')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      role === 'penyedia' && email === DEMO_CREDENTIALS.penyedia.email
                        ? 'bg-[#FFFFFF] text-[#143628] shadow-xs font-semibold border border-[#DCE5DB]'
                        : 'text-[#597367] hover:text-[#143628]'
                    }`}
                  >
                    Penyedia
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('admin')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      role === 'admin' && email === DEMO_CREDENTIALS.admin.email
                        ? 'bg-[#FFFFFF] text-[#143628] shadow-xs font-semibold border border-[#DCE5DB]'
                        : 'text-[#597367] hover:text-[#143628]'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Google Sign In Option */}
              <div className="mb-5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
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
                  <span>Masuk dengan Google</span>
                </button>
              </div>

              {/* Clean Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5ECE4]" />
                </div>
                <span className="relative bg-[#FFFFFF] px-3 text-[11px] font-mono uppercase tracking-wider text-[#597367]">
                  atau masuk dengan email
                </span>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#143628] mb-1.5">
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
                      className="w-full bg-[#FFFFFF] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#143628]">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Kata sandi demo: "demo123"')}
                      className="text-xs text-[#2D6A4F] hover:underline"
                    >
                      Bantuan Sandi
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#597367] pointer-events-none">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FFFFFF] text-[#143628] text-sm h-11 pl-10 pr-10 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#597367] hover:text-[#143628] p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#597367]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#DCE5DB] text-[#2D6A4F] focus:ring-[#2D6A4F]"
                    />
                    <span>Ingat sesi masuk di perangkat ini</span>
                  </label>
                </div>

                {/* Primary Action Button (Deep Espresso Cacao) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {isLoading ? 'Memverifikasi...' : 'Lanjutkan ke Platform'}
                  </button>
                </div>
              </form>

              {/* Registration Link */}
              <div className="mt-6 pt-5 border-t border-[#E5ECE4] text-center text-xs text-[#597367]">
                Belum memiliki akun?{' '}
                <a
                  href="#/register"
                  className="font-semibold text-[#2D6A4F] hover:text-[#B8401A] hover:underline transition-colors"
                >
                  Daftar akun baru
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Minimalist Footer */}
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
                <h3 className="text-base font-semibold text-[#143628]">Integrasi Google OAuth</h3>
                <p className="text-xs text-[#597367]">Supabase Authentication</p>
              </div>
            </div>

            <div className="bg-[#F7F9F6] p-3.5 rounded-xl border border-[#DCE5DB] text-xs text-[#2E4A3B] space-y-2 mb-4 leading-relaxed">
              <p className="font-medium text-[#143628]">
                Kode otentikasi Google telah aktif terintegrasi dengan Supabase Client!
              </p>
              <p>
                Jika Google Cloud Client ID belum diaktifkan di dashboard Supabase proyek Anda, Anda dapat langsung menguji alur login menggunakan <strong>Akun Google Demo Terverifikasi</strong> di bawah ini.
              </p>
            </div>

            <div className="space-y-2 mb-5">
              <button
                type="button"
                onClick={handleGoogleDemoLogin}
                disabled={isGoogleLoading}
                className="w-full h-11 px-4 bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isGoogleLoading ? 'Memproses...' : `Masuk sebagai Akun Google Demo (${role})`}
              </button>

              <button
                type="button"
                onClick={() => setShowGoogleGuideModal(false)}
                className="w-full h-10 px-4 bg-white hover:bg-[#F3F7F2] text-[#597367] font-medium text-xs rounded-xl border border-[#DCE5DB] transition-all cursor-pointer"
              >
                Tutup & Gunakan Form Biasa
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
