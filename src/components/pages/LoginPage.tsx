'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { UserRole } from '@/types';
import { DEMO_CREDENTIALS } from '@/lib/constants';
import { getCurrentUser } from '@/lib/data';

export function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useNotification();
  const [role, setRole] = useState<UserRole>('penerima');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
    <div className="min-h-screen bg-[#FBF7F0] flex flex-col justify-between text-[#2C221D]">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl bg-[#FFFDF9] rounded-2xl border border-[#EADECF] shadow-[0_4px_24px_rgba(60,40,20,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Editorial Photography & Authentic Narrative (lg: 6 cols) */}
          <div className="relative lg:col-span-6 bg-[#18110D] text-[#FAF6F0] p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Real Photography Background with Natural Warm Dark Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-100"
              style={{ backgroundImage: 'url(/images/hero-food-kitchen.jpg)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140E0A] via-[#18110D]/85 to-[#18110D]/95" />

            {/* Top Brand Identity */}
            <div className="relative z-10">
              <a href="#/" className="inline-flex items-center gap-3 no-underline group mb-10">
                <div className="w-8 h-8 rounded-md bg-[#FAF6F0] text-[#18110D] flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
                  AP
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#FAF6F0] leading-none">
                    AksesPangan
                  </span>
                  <span className="text-[10px] tracking-[0.18em] uppercase font-mono text-[#FAF6F0]/60 mt-1">
                    Surplus Network
                  </span>
                </div>
              </a>

              <div className="max-w-md">
                <p className="text-xs font-mono uppercase tracking-widest text-[#FAF6F0]/70 mb-3">
                  Inisiatif Ketahanan Pangan
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#FAF6F0] leading-snug mb-4">
                  Menghubungkan surplus makanan dengan kebutuhan nyata masyarakat.
                </h2>
                <p className="text-sm text-[#FAF6F0]/80 leading-relaxed mb-8">
                  Sistem distribusi terpadu yang membantu industri kuliner mendokumentasikan dampak lingkungan sekaligus memperluas akses pangan berkualitas secara bermartabat.
                </p>
              </div>
            </div>

            {/* Bottom Minimalist Metric Data */}
            <div className="relative z-10 pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#FAF6F0] tracking-tight">
                    12.450 kg
                  </div>
                  <div className="text-[11px] text-[#FAF6F0]/60 mt-1">
                    Pangan Terselamatkan
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#FAF6F0] tracking-tight">
                    31.200
                  </div>
                  <div className="text-[11px] text-[#FAF6F0]/60 mt-1">
                    Porsi Tersalurkan
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#FAF6F0] tracking-tight">
                    100%
                  </div>
                  <div className="text-[11px] text-[#FAF6F0]/60 mt-1">
                    Standar Mutu Uji
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Clean, Restrained Warm Gourmet Auth Form (lg: 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#FFFDF9]">
            <div className="max-w-sm w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-7">
                <h2 className="text-2xl font-semibold tracking-tight text-[#2C221D] mb-1.5">
                  Masuk ke Akun
                </h2>
                <p className="text-sm text-[#7D6F64]">
                  Gunakan akun Anda atau pilih akun demo pengujian di bawah ini.
                </p>
              </div>

              {/* Clean 1-Click Demo Accounts Segmented Control */}
              <div className="mb-6">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#7D6F64] mb-2">
                  Akun Demo Pengujian (1-Klik)
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#F5EFEB] rounded-xl border border-[#EADECF]">
                  <button
                    type="button"
                    onClick={() => fillDemo('penerima')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      role === 'penerima' && email === DEMO_CREDENTIALS.penerima.email
                        ? 'bg-[#FFFDF9] text-[#2C221D] shadow-xs font-semibold border border-[#EADECF]'
                        : 'text-[#7D6F64] hover:text-[#2C221D]'
                    }`}
                  >
                    Penerima
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('penyedia')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      role === 'penyedia' && email === DEMO_CREDENTIALS.penyedia.email
                        ? 'bg-[#FFFDF9] text-[#2C221D] shadow-xs font-semibold border border-[#EADECF]'
                        : 'text-[#7D6F64] hover:text-[#2C221D]'
                    }`}
                  >
                    Penyedia
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('admin')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                      role === 'admin' && email === DEMO_CREDENTIALS.admin.email
                        ? 'bg-[#FFFDF9] text-[#2C221D] shadow-xs font-semibold border border-[#EADECF]'
                        : 'text-[#7D6F64] hover:text-[#2C221D]'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#2C221D] mb-1.5">
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
                      className="w-full bg-[#FFFDF9] text-[#2C221D] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#2C221D]">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Kata sandi demo: "demo123"')}
                      className="text-xs text-[#D95327] hover:underline"
                    >
                      Bantuan Sandi
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7D6F64] pointer-events-none">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FFFDF9] text-[#2C221D] text-sm h-11 pl-10 pr-10 rounded-xl border border-[#EADECF] focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D6F64] hover:text-[#2C221D] p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#7D6F64]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#EADECF] text-[#D95327] focus:ring-[#D95327]"
                    />
                    <span>Ingat sesi masuk di perangkat ini</span>
                  </label>
                </div>

                {/* Primary Action Button (Deep Espresso Cacao) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {isLoading ? 'Memverifikasi...' : 'Lanjutkan ke Platform'}
                  </button>
                </div>
              </form>

              {/* Registration Link */}
              <div className="mt-6 pt-5 border-t border-[#EFE6DA] text-center text-xs text-[#7D6F64]">
                Belum memiliki akun?{' '}
                <a
                  href="#/register"
                  className="font-semibold text-[#D95327] hover:text-[#B8401A] hover:underline transition-colors"
                >
                  Daftar akun baru
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Minimalist Footer */}
      <footer className="py-4 text-center text-xs text-[#7D6F64] border-t border-[#EADECF] bg-[#FBF7F0]">
        <p className="m-0">
          AksesPangan &copy; 2026 • Platform Kolaborasi Penyelamatan Surplus Pangan
        </p>
      </footer>
    </div>
  );
}
