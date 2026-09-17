'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        success('Autentikasi Berhasil', 'Selamat datang di AksesPangan');
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
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-[440px]">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <a href="#/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-white shadow-lg shadow-orange-500/20 no-underline transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2.5L3.5 8.5L12 14.5L20.5 8.5L12 2.5Z" fill="currentColor" />
              <path d="M3.5 13.5L12 19.5L20.5 13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <h1 className="text-display-md text-[#1d1d1f] mb-1 font-semibold tracking-tight">
            Masuk ke AksesPangan
          </h1>
          <p className="text-body-apple text-[#86868b] m-0">
            Gunakan akun Anda untuk mengakses ekosistem surplus pangan.
          </p>
        </div>

        {/* Apple Centered Card */}
        <div className="bg-white rounded-[22px] p-8 border border-[rgba(0,0,0,0.08)] product-hero-shadow mb-6">
          {/* Quick Demo Selector Chips */}
          <div className="mb-6 pb-5 border-b border-[rgba(0,0,0,0.06)]">
            <div className="text-caption-strong text-[#1d1d1f] mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#1d1d1f]" />
              Akun Demo Cepat (1-Klik):
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemo('penerima')}
                className={`apple-chip text-xs py-1.5 px-3 ${
                  role === 'penerima' && email === DEMO_CREDENTIALS.penerima.email
                    ? 'apple-chip-active'
                    : ''
                }`}
              >
                Penerima
              </button>
              <button
                type="button"
                onClick={() => fillDemo('penyedia')}
                className={`apple-chip text-xs py-1.5 px-3 ${
                  role === 'penyedia' && email === DEMO_CREDENTIALS.penyedia.email
                    ? 'apple-chip-active'
                    : ''
                }`}
              >
                Penyedia (Restoran)
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className={`apple-chip text-xs py-1.5 px-3 ${
                  role === 'admin' && email === DEMO_CREDENTIALS.admin.email
                    ? 'apple-chip-active'
                    : ''
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-caption-strong text-[#1d1d1f] mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="apple-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-caption-strong text-[#1d1d1f] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="apple-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-apple-primary w-full text-base py-3"
              >
                {isLoading ? 'Memverifikasi...' : 'Lanjutkan ke Platform'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[rgba(0,0,0,0.06)] text-center text-caption-apple text-[#86868b]">
            Belum memiliki akun?{' '}
            <a href="#/register" className="link-apple text-caption-strong">
              Buat akun baru sekarang
            </a>
          </div>
        </div>

        {/* Fine print */}
        <div className="text-center text-fine-print text-[#86868b]">
          AksesPangan melindungi privasi data Anda dengan standar enkripsi modern.
        </div>
      </div>
    </div>
  );
}
