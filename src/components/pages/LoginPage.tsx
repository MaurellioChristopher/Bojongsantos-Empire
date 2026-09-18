'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  UtensilsCrossed,
  Shield,
  Leaf,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
} from 'lucide-react';
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
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-between">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl bg-white rounded-[28px] border border-[rgba(0,0,0,0.07)] shadow-2xl shadow-neutral-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* LEFT COLUMN: Visual Showcase & Mission Hero (lg: 7 cols) */}
          <div className="relative lg:col-span-7 bg-[#121216] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Background Texture & Image Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none scale-105 transition-transform duration-1000"
              style={{ backgroundImage: 'url(/images/hero-food-kitchen.jpg)' }}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#121216]/95 via-[#18181f]/90 to-[#121216]/98 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF5A1F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FFB200]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Content Top: Brand Mark & Mission */}
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
                    Ekosistem Surplus Pangan
                  </span>
                </div>
              </a>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-orange-200 mb-4 font-medium">
                <Sparkles size={12} className="text-amber-400" />
                <span>Gerakan Nol Limbah Pangan Indonesia</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-[1.2] mb-3">
                Dari Surplus Menjadi Solusi Kebaikan Nyata.
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
                Platform terintegrasi yang menghubungkan restoran, supermarket, dan bakery untuk mendistribusikan makanan berlebih berkualitas prima kepada masyarakat secara bermartabat.
              </p>

              {/* Floating Live Card Preview */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/15 max-w-md shadow-xl mb-8">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 relative">
                    <img
                      src="/images/surplus-bakery.jpg"
                      alt="Preview Surplus"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/70 text-[9px] font-mono text-white px-1.5 py-0.5 rounded">
                      Gratis
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                        Artisan Croissant & Brioche
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Siap Diambil
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 truncate mb-1">
                      Toko Roti Aroma Buahbatu • 1,2 km
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-amber-400" /> Sisa 3 jam
                      </span>
                      <span className="flex items-center gap-1">
                        <Leaf size={11} className="text-emerald-400" /> 4,2 kg CO₂ dicegah
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Bottom: Impact Stats & Trust */}
            <div className="relative z-10 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                    12.450+
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                    kg Pangan Diselamatkan
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400 tracking-tight">
                    31.200+
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                    Porsi Tersalurkan
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                    100%
                  </div>
                  <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                    Standar Mutu Higienis
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Login Form (lg: 5 cols) */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-6">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-[#FF5A1F] block mb-1">
                  Autentikasi Aman
                </span>
                <h2 className="text-display-md text-[#1d1d1f] font-bold tracking-tight">
                  Masuk ke Platform
                </h2>
                <p className="text-body-apple text-[#86868b] text-xs sm:text-sm mt-1">
                  Pilih demo 1-klik atau masukkan email Anda untuk melanjutkan.
                </p>
              </div>

              {/* Interactive 1-Click Demo Accounts Selector */}
              <div className="mb-6 bg-[#f7f7f9] p-3.5 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#1d1d1f] uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#FF5A1F]" />
                    Pilih Akun Demo (1-Klik):
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Auto-fill instant</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Penerima Demo Button */}
                  <button
                    type="button"
                    onClick={() => fillDemo('penerima')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      role === 'penerima' && email === DEMO_CREDENTIALS.penerima.email
                        ? 'bg-white border-[#FF5A1F] shadow-sm ring-2 ring-[#FF5A1F]/15'
                        : 'bg-white/80 border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <User
                      size={14}
                      className={
                        role === 'penerima' && email === DEMO_CREDENTIALS.penerima.email
                          ? 'text-[#FF5A1F]'
                          : 'text-neutral-500'
                      }
                    />
                    <span className="text-[11px] font-semibold block leading-tight">Penerima</span>
                    <span className="text-[9px] text-neutral-400 leading-none">Masyarakat</span>
                  </button>

                  {/* Penyedia Demo Button */}
                  <button
                    type="button"
                    onClick={() => fillDemo('penyedia')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      role === 'penyedia' && email === DEMO_CREDENTIALS.penyedia.email
                        ? 'bg-white border-[#FF5A1F] shadow-sm ring-2 ring-[#FF5A1F]/15'
                        : 'bg-white/80 border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <UtensilsCrossed
                      size={14}
                      className={
                        role === 'penyedia' && email === DEMO_CREDENTIALS.penyedia.email
                          ? 'text-[#FF5A1F]'
                          : 'text-neutral-500'
                      }
                    />
                    <span className="text-[11px] font-semibold block leading-tight">Penyedia</span>
                    <span className="text-[9px] text-neutral-400 leading-none">Restoran</span>
                  </button>

                  {/* Admin Demo Button */}
                  <button
                    type="button"
                    onClick={() => fillDemo('admin')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      role === 'admin' && email === DEMO_CREDENTIALS.admin.email
                        ? 'bg-white border-[#FF5A1F] shadow-sm ring-2 ring-[#FF5A1F]/15'
                        : 'bg-white/80 border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <ShieldCheck
                      size={14}
                      className={
                        role === 'admin' && email === DEMO_CREDENTIALS.admin.email
                          ? 'text-[#FF5A1F]'
                          : 'text-neutral-500'
                      }
                    />
                    <span className="text-[11px] font-semibold block leading-tight">Admin</span>
                    <span className="text-[9px] text-neutral-400 leading-none">Supervisi</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#1d1d1f]">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Untuk akun demo gunakan password: "demo123", atau klik tombol demo di atas.')}
                      className="text-[11px] text-[#FF5A1F] hover:underline"
                    >
                      Bantuan Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <Lock size={15} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="apple-input pl-10 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-neutral-300 text-[#FF5A1F] focus:ring-[#FF5A1F]"
                    />
                    <span>Ingat saya di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-apple-primary w-full text-sm font-semibold py-3 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.99] transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Memverifikasi...
                      </span>
                    ) : (
                      <>
                        <span>Lanjutkan ke Platform</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Registration Link */}
              <div className="mt-6 pt-5 border-t border-neutral-100 text-center text-xs text-[#86868b]">
                Belum memiliki akun?{' '}
                <a
                  href="#/register"
                  className="font-semibold text-[#FF5A1F] hover:underline transition-colors inline-flex items-center gap-0.5"
                >
                  Buat akun baru sekarang
                </a>
              </div>

              {/* Security & Privacy Badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-neutral-400">
                <div className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Enkripsi 256-Bit</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-neutral-400" />
                  <span>Data Terlindungi</span>
                </div>
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
