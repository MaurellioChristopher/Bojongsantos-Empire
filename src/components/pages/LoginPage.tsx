'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getCurrentUser } from '@/lib/data';

export function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(email, password);
      if (result.success) {
        success('Authentication Successful', 'Welcome back to AksesPangan');
        const currentUser = getCurrentUser();
        const finalRole = currentUser?.role || 'penerima';
        if (finalRole === 'penyedia') window.location.hash = '#/penyedia';
        else if (finalRole === 'admin') window.location.hash = '#/admin';
        else window.location.hash = '#/penerima';
      } else {
        setErrorMessage(result.error || 'Invalid email or password');
        error('Sign In Failed', result.error || 'Invalid email or password');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'A system error occurred');
      error('Sign In Failed', err.message || 'A system error occurred');
    } finally {
      setIsLoading(false);
    }
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
                  Food Security Initiative
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F3F8F5] leading-snug mb-4">
                  Connecting food surplus with real community needs.
                </h2>
                <p className="text-sm text-[#F3F8F5]/80 leading-relaxed mb-8">
                  An integrated distribution system helping culinary businesses document environmental impact while expanding dignified access to nutritious food.
                </p>
              </div>
            </div>

            {/* Bottom Minimalist Metric Data */}
            <div className="relative z-10 pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#F3F8F5] tracking-tight">
                    12,450 kg
                  </div>
                  <div className="text-[11px] text-[#F3F8F5]/60 mt-1">
                    Rescued Food
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#F3F8F5] tracking-tight">
                    31,200
                  </div>
                  <div className="text-[11px] text-[#F3F8F5]/60 mt-1">
                    Meals Distributed
                  </div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-semibold font-mono text-[#F3F8F5] tracking-tight">
                    100%
                  </div>
                  <div className="text-[11px] text-[#F3F8F5]/60 mt-1">
                    Quality Tested
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
                  Sign in to Account
                </h2>
                <p className="text-sm text-[#597367]">
                  Enter your email address and password to continue to the platform.
                </p>
              </div>

              {/* Microservice Offline Alert Banner */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-bold mb-0.5 text-red-800">Microservice Service Disconnected</p>
                    <p className="leading-relaxed m-0 text-red-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#143628] mb-1.5">
                    Email Address
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
                      placeholder="name@email.com"
                      className="w-full bg-[#FFFFFF] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#143628]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('For password assistance or account reset, please contact the administrator team at support@aksespangan.id')}
                      className="text-xs text-[#2D6A4F] hover:underline cursor-pointer"
                    >
                      Password Help
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
                    <span>Remember session on this device</span>
                  </label>
                </div>

                {/* Primary Action Button (Deep Espresso Cacao) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Continue to Platform'}
                  </button>
                </div>
              </form>

              {/* Registration Link */}
              <div className="mt-6 pt-5 border-t border-[#E5ECE4] text-center text-xs text-[#597367]">
                Don&apos;t have an account?{' '}
                <a
                  href="#/register"
                  className="font-semibold text-[#2D6A4F] hover:text-[#B8401A] hover:underline transition-colors"
                >
                  Register new account
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Minimalist Footer */}
      <footer className="py-4 text-center text-xs text-[#597367] border-t border-[#DCE5DB] bg-[#F7F9F6]">
        <p className="m-0">
          AksesPangan &copy; 2026 • Surplus Food Rescue & Redistribution Network
        </p>
      </footer>
    </div>
  );
}
