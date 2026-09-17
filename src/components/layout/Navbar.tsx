'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { getBookingsByRecipient } from '@/lib/data';

interface NavbarProps {
  currentRoute?: string;
}

export function Navbar({ currentRoute }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { info } = useNotification();
  const [mobileMenuOpen, setMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(currentRoute || '/');
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setActiveRoute(hash);
      setMenuOpen(false);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (user && user.role === 'penerima') {
      const bookings = getBookingsByRecipient(user.id);
      const active = bookings.filter((b) => ['menunggu', 'dikonfirmasi'].includes(b.status));
      setActiveBookingsCount(active.length);
    } else {
      setActiveBookingsCount(0);
    }
  }, [user, activeRoute]);

  const handleLogout = () => {
    logout();
    info('Sampai jumpa!', 'Anda telah keluar dari akun');
    window.location.hash = '#/';
  };

  const isLanding = activeRoute === '/' || activeRoute === '';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
      const threshold = window.innerHeight * 2.4;
      setIsPastHero(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  const isDark = isLanding ? !isPastHero : false;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
        isDark
          ? 'bg-black/80 border-b border-white/10 text-white'
          : 'bg-white/95 border-b border-[rgba(0,0,0,0.06)] text-black shadow-xs'
      }`}
    >
      {/* SINGLE LUXURY EDITORIAL NAVIGATION BAR (68px) */}
      <nav className="w-full h-[68px] px-6 sm:px-10 flex items-center justify-between">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-8">
          {/* Left: Luxury Brand Mark + Editorial Navigation */}
          <div className="flex items-center gap-10">
            {/* Peak Design Style Monogram */}
            <a
              href={
                !isAuthenticated
                  ? '#/'
                  : user?.role === 'penyedia'
                  ? '#/penyedia'
                  : user?.role === 'admin'
                  ? '#/admin'
                  : '#/penerima'
              }
              className={`flex items-center gap-3 no-underline group ${isDark ? 'text-white' : 'text-black'}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-[3px] transition-transform duration-300 group-hover:scale-105 ${
                isDark ? 'bg-white text-black' : ''
              }`}
              style={!isDark ? { background: 'linear-gradient(135deg, #FFB200 0%, #FF5A1F 55%, #FF3913 100%)', color: '#ffffff' } : {}}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2.5L3.5 8.5L12 14.5L20.5 8.5L12 2.5Z" fill="currentColor" />
                  <path d="M3.5 13.5L12 19.5L20.5 13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[13px] tracking-[0.2em] uppercase leading-none">
                  Akses<span className={isDark ? 'font-light text-white/80' : 'font-light text-[#777777]'}>Pangan</span>
                </span>
                <span className={`text-[9px] tracking-[0.25em] uppercase font-mono mt-0.5 ${
                  isDark ? 'text-white/60' : 'text-[#999999]'
                }`}>
                  Surplus Network
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links - Dynamically filtered by Role */}
            <div className={`hidden lg:flex items-center gap-7 text-[12px] font-medium tracking-[0.08em] uppercase ${
              isDark ? 'text-white/80' : 'text-[#666666]'
            }`}>
              {/* Guest links */}
              {!isAuthenticated && (
                <>
                  <a
                    href="#/"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute === '/' ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute === '/' ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Beranda
                    {activeRoute === '/' && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/dashboard"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/dashboard') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/dashboard') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Dampak ESG
                    {activeRoute.startsWith('/dashboard') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/terms"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/terms') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/terms') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Standar Mutu
                    {activeRoute.startsWith('/terms') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                </>
              )}

              {/* Penerima links (strictly NO Beranda, NO ESG, NO Standar Mutu) */}
              {isAuthenticated && user?.role === 'penerima' && (
                <>
                  <a
                    href="#/penerima"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute === '/penerima' ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute === '/penerima' ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Katalog Surplus
                    {activeRoute === '/penerima' && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/penerima/booking"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/penerima/booking') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/penerima/booking') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Pesanan Saya
                    {activeRoute.startsWith('/penerima/booking') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/penerima/history"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/penerima/history') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/penerima/history') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Riwayat
                    {activeRoute.startsWith('/penerima/history') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                </>
              )}

              {/* Penyedia links (Strictly NO ESG, NO Standar Mutu, NO Katalog Penerima) */}
              {isAuthenticated && user?.role === 'penyedia' && (
                <>
                  <a
                    href="#/penyedia"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute === '/penyedia' ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute === '/penyedia' ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Dashboard
                    {activeRoute === '/penyedia' && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/penyedia/surplus"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/penyedia/surplus') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/penyedia/surplus') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Surplus Saya
                    {activeRoute.startsWith('/penyedia/surplus') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/penyedia/booking"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/penyedia/booking') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/penyedia/booking') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Pesanan Masuk
                    {activeRoute.startsWith('/penyedia/booking') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/penyedia/history"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/penyedia/history') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/penyedia/history') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Riwayat
                    {activeRoute.startsWith('/penyedia/history') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                </>
              )}

              {/* Admin links */}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <a
                    href="#/admin"
                    className={`transition-colors no-underline font-semibold flex items-center gap-1.5 py-1 ${
                      isDark ? 'text-white' : 'text-black'
                    }`}
                  >
                    <Shield size={13} className={isDark ? 'text-white' : 'text-black'} />
                    Dashboard Admin
                  </a>
                  <a
                    href="#/terms"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/terms') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/terms') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Kelola Standar Mutu
                    {activeRoute.startsWith('/terms') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                  <a
                    href="#/dashboard"
                    className={`transition-colors no-underline py-1 relative ${
                      isDark
                        ? activeRoute.startsWith('/dashboard') ? 'text-white font-semibold' : 'hover:text-white'
                        : activeRoute.startsWith('/dashboard') ? 'text-black font-semibold' : 'hover:text-black'
                    }`}
                  >
                    Kelola Dampak ESG
                    {activeRoute.startsWith('/dashboard') && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: isDark ? '#ffffff' : 'linear-gradient(90deg, #FFB200, #FF3913)' }} />
                    )}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Right: High-End Actions */}
          <div className="flex items-center gap-5 sm:gap-6 text-[12px] font-medium tracking-[0.06em] uppercase">
            {/* Support Link (only for Guest and Penerima) */}
            {(!user || user.role === 'penerima') && (
              <a
                href="#/terms"
                className={`hidden sm:inline-block transition-colors no-underline ${
                  isDark ? 'text-white/70 hover:text-white' : 'text-[#666666] hover:text-black'
                }`}
              >
                Bantuan
              </a>
            )}

            {/* Account Status */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <a
                  href={user.role === 'penyedia' ? '#/penyedia' : user.role === 'admin' ? '#/admin' : '#/penerima'}
                  className={`flex items-center gap-1.5 no-underline font-semibold ${
                    isDark ? 'text-white' : 'text-black'
                  }`}
                >
                  <User size={15} />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </a>
                <button
                  onClick={handleLogout}
                  className={`text-xs transition-colors p-1 cursor-pointer ${
                    isDark ? 'text-white/70 hover:text-white' : 'text-[#888888] hover:text-black'
                  }`}
                  title="Keluar"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <a
                href="#/login"
                className={`flex items-center gap-1.5 transition-opacity no-underline font-semibold ${
                  isDark ? 'text-white hover:text-white/80' : 'hover:opacity-80'
                }`}
                style={!isDark ? { color: '#FF5A1F' } : {}}
              >
                <User size={15} />
                <span className="hidden sm:inline">Masuk</span>
              </a>
            )}

            {/* Claim Bag / Cart Icon (Only for logged-in Penerima or Penyedia) */}
            {isAuthenticated && user && (user.role === 'penerima' || user.role === 'penyedia') && (
              <a
                href={user.role === 'penyedia' ? '#/penyedia/booking' : '#/penerima/booking'}
                className={`relative p-1.5 transition-opacity no-underline ${
                  isDark ? 'text-white' : 'text-black'
                }`}
                title={user.role === 'penyedia' ? 'Pesanan Masuk' : 'Pesanan Saya'}
              >
                <ShoppingBag size={17} />
                {activeBookingsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white"
                    style={{ background: isDark ? '#ffffff' : 'linear-gradient(135deg, #FFB200, #FF3913)', color: isDark ? '#000000' : '#ffffff' }}
                  >
                    {activeBookingsCount}
                  </span>
                )}
              </a>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-1 hover:opacity-75 focus:outline-none ${isDark ? 'text-white' : 'text-black'}`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white text-black px-6 py-6 border-b border-[rgba(0,0,0,0.08)] shadow-xl"
          >
            <div className="flex flex-col gap-4 text-[14px] font-medium tracking-[0.06em] uppercase">
              {/* Guest links */}
              {!isAuthenticated && (
                <>
                  <a
                    href="#/"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Beranda
                  </a>
                  <a
                    href="#/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Dampak ESG
                  </a>
                  <a
                    href="#/terms"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Standar Mutu
                  </a>
                </>
              )}

              {/* Penerima links */}
              {isAuthenticated && user?.role === 'penerima' && (
                <>
                  <a
                    href="#/penerima"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Katalog Surplus
                  </a>
                  <a
                    href="#/penerima/booking"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Pesanan Saya
                  </a>
                  <a
                    href="#/penerima/history"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Riwayat
                  </a>
                </>
              )}

              {/* Penyedia links */}
              {isAuthenticated && user?.role === 'penyedia' && (
                <>
                  <a
                    href="#/penyedia"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Dashboard
                  </a>
                  <a
                    href="#/penyedia/surplus"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Surplus Saya
                  </a>
                  <a
                    href="#/penyedia/booking"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Pesanan Masuk
                  </a>
                  <a
                    href="#/penyedia/history"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Riwayat
                  </a>
                </>
              )}

              {/* Admin links */}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <a
                    href="#/admin"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100 font-semibold"
                  >
                    Dashboard Admin
                  </a>
                  <a
                    href="#/terms"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Kelola Standar Mutu
                  </a>
                  <a
                    href="#/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-black hover:opacity-70 no-underline py-1.5 border-b border-gray-100"
                  >
                    Kelola Dampak ESG
                  </a>
                </>
              )}

              <div className="pt-4 flex flex-col gap-3 normal-case tracking-normal">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#888888]">{user.name} ({user.role})</span>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-xs font-semibold uppercase tracking-wider py-1.5 px-3 border border-black rounded-[3px]"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <a
                      href="#/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-xs font-bold uppercase tracking-wider py-2.5 text-center flex-1 border border-black rounded-[3px] text-black no-underline"
                    >
                      Masuk
                    </a>
                    <a
                      href="#/register"
                      onClick={() => setMenuOpen(false)}
                      className="text-xs font-bold uppercase tracking-wider py-2.5 text-center flex-1 bg-black text-white rounded-[3px] no-underline"
                    >
                      Daftar Akun
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
