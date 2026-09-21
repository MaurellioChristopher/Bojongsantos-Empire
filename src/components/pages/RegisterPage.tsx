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
        success('Registration Successful', 'Welcome to the AksesPangan ecosystem');
        setTimeout(() => {
          if (role === 'penyedia') window.location.hash = '#/penyedia';
          else window.location.hash = '#/penerima';
        }, 500);
      } else {
        error('Registration Failed', result.error || 'A system error occurred');
      }
    } catch (err: any) {
      error('Registration Failed', err.message || 'A system error occurred');
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
                    User Registration
                  </span>
                </div>
              </a>

              <div className="max-w-md">
                <p className="text-xs font-mono uppercase tracking-widest text-[#2D6A4F] mb-3 font-semibold">
                  Collaborative Movement
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#F3F8F5] leading-snug mb-4">
                  Join the sustainable food rescue ecosystem.
                </h2>
                <p className="text-sm text-[#CAD6C8] leading-relaxed mb-8">
                  Choose your role to redistribute surplus food or claim quality meals with secure, dignified digital verification.
                </p>

                <div className="space-y-3 text-xs text-[#CAD6C8]">
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F8F5]/10">
                    <span className="font-mono text-[#2D6A4F] text-xs font-bold">01</span>
                    <span>Instant registration with zero platform fees</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F8F5]/10">
                    <span className="font-mono text-[#2D6A4F] text-xs font-bold">02</span>
                    <span>Digital QR ticket verification for hygienic handovers</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-[#F3F8F5]/10">
                    <span className="font-mono text-[#2D6A4F] text-xs font-bold">03</span>
                    <span>ESG metrics and measurable waste reduction reports</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="relative z-10 pt-6 border-t border-[#F3F8F5]/10 text-xs text-[#A8988B]">
              Food Safety Standards & Data Privacy Guaranteed
            </div>
          </div>

          {/* RIGHT COLUMN: Clean Gourmet Form (lg: 6 cols) */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-[#FFFFFF]">
            <div className="max-w-sm w-full mx-auto">
              
              {/* Form Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight text-[#143628]">
                    Create Account
                  </h2>
                  {role === 'penyedia' && (
                    <span className="text-xs font-mono text-[#597367] bg-[#EDF2EC] px-2 py-0.5 rounded-full border border-[#DCE5DB]">
                      Step {step} of {totalSteps}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#597367] mt-1">
                  Choose your role in the food ecosystem.
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
                  Recipient (Community)
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
                  Provider (Partner)
                </button>
              </div>

              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Full Name
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
                        placeholder="Your full name"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
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
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Phone Number / WhatsApp
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
                        placeholder="+62812xxxxxxxx"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Password
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
                        placeholder="At least 6 characters"
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
                      {role === 'penyedia' ? 'Continue: Partner Business Info' : isLoading ? 'Registering...' : 'Complete Registration'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Business Info (Only for Penyedia) */}
              {step === 2 && role === 'penyedia' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Culinary Business Name
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
                        placeholder="e.g., Dapur Rasa Resto"
                        className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 pl-10 pr-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all placeholder:text-[#597367]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Business Type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                      className="w-full bg-[#FAF7F2] text-[#143628] text-sm h-11 px-3.5 rounded-xl border border-[#DCE5DB] focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 outline-none transition-all"
                    >
                      <option value="restoran">Restaurant / Eatery</option>
                      <option value="hotel">Hotel</option>
                      <option value="kafe">Cafe / Coffee Shop</option>
                      <option value="katering">Catering Service</option>
                      <option value="supermarket">Bakery / Supermarket</option>
                      <option value="lainnya">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#143628] mb-1">
                      Business Address (Pickup Location)
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
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading || !businessName || !businessAddress}
                      className="flex-1 bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] font-medium text-sm h-11 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isLoading ? 'Processing...' : 'Finish'}
                    </button>
                  </div>
                </div>
              )}

              {/* Login Link */}
              <div className="mt-6 pt-5 border-t border-[#DCE5DB] text-center text-xs text-[#597367]">
                Already have an account?{' '}
                <a
                  href="#/login"
                  className="font-semibold text-[#2D6A4F] hover:text-[#B8401A] hover:underline transition-colors"
                >
                  Sign in here
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Gourmet Footer */}
      <footer className="py-4 text-center text-xs text-[#597367] border-t border-[#DCE5DB] bg-[#F7F9F6]">
        <p className="m-0">
          AksesPangan &copy; 2026 • Surplus Food Rescue & Redistribution Network
        </p>
      </footer>
    </div>
  );
}
