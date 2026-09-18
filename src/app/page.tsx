'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotificationProvider, useNotification } from '@/contexts/NotificationContext';
import { ToastContainer } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { LandingPage } from '@/components/pages/LandingPage';
import { LoginPage } from '@/components/pages/LoginPage';
import { RegisterPage } from '@/components/pages/RegisterPage';
import { PenyediaDashboard } from '@/components/pages/PenyediaDashboard';
import { PenyediaSurplus } from '@/components/pages/PenyediaSurplus';
import { PenyediaBooking } from '@/components/pages/PenyediaBooking';
import { PenyediaHistory } from '@/components/pages/PenyediaHistory';
import { PenerimaDashboard } from '@/components/pages/PenerimaDashboard';
import { PenerimaBooking } from '@/components/pages/PenerimaBooking';
import { PenerimaHistory } from '@/components/pages/PenerimaHistory';
import { ImpactDashboard } from '@/components/pages/ImpactDashboard';
import { AdminDashboard } from '@/components/pages/AdminDashboard';
import { TermsPage } from '@/components/pages/TermsPage';
import { checkAndExpireItems } from '@/lib/data';

function AppRouter() {
  const [route, setRoute] = useState('/');
  const { user, isAuthenticated, isLoading } = useAuth();
  const { warning } = useNotification();

  // Hash-based routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      setRoute(hash);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Central Role-Based Access Guard according to system specifications
  useEffect(() => {
    if (isLoading) return;

    // 0. Pengguna yang sudah login sama sekali TIDAK BISA mengakses Beranda / Halaman Utama ('/' atau '')
    if (route === '/' || route === '') {
      if (user?.role === 'penyedia') {
        window.location.hash = '#/penyedia';
        return;
      }
      if (user?.role === 'penerima') {
        window.location.hash = '#/penerima';
        return;
      }
      if (user?.role === 'admin') {
        window.location.hash = '#/admin';
        return;
      }
    }

    // 1. Sebelum Login (Tamu)
    // Hak akses: Beranda (/), Dampak ESG (/dashboard), Standar Mutu (/terms), Login/Register (/login, /register)
    const guestAllowed = ['/', '/login', '/register', '/dashboard', '/terms'];

    if (!isAuthenticated) {
      if (!guestAllowed.includes(route)) {
        warning('Akses Dibatasi', 'Pengguna sebelum login tidak dapat mengakses fitur ini. Silakan masuk terlebih dahulu.');
        window.location.hash = '#/login';
      }
      return;
    }

    // 2. Penyedia
    // Hak akses: Dashboard (/penyedia), Surplus (/penyedia/surplus), Booking (/penyedia/booking), Riwayat (/penyedia/history).
    // Batasan: Tidak dapat akses beranda (/), /penerima*, /dashboard & /terms, /admin*.
    if (user?.role === 'penyedia') {
      const penyediaAllowed = ['/penyedia', '/penyedia/surplus', '/penyedia/booking', '/penyedia/history'];
      if (!penyediaAllowed.includes(route)) {
        if (route === '/dashboard' || route === '/terms') {
          warning('Akses Dibatasi', 'Penyedia tidak dapat melihat atau mengelola Dampak ESG dan Standar Mutu.');
        } else {
          warning('Akses Dibatasi', 'Penyedia hanya dapat mengelola surplus dan pesanan masuk.');
        }
        window.location.hash = '#/penyedia';
      }
      return;
    }

    // 3. Penerima
    // Hak akses: Katalog Surplus (/penerima), Pesanan Saya (/penerima/booking), Riwayat (/penerima/history).
    // Batasan: Tidak dapat akses beranda (/), Dampak ESG (/dashboard), Standar Mutu (/terms), /penyedia*, /admin*.
    if (user?.role === 'penerima') {
      const penerimaAllowed = ['/penerima', '/penerima/booking', '/penerima/history'];
      if (!penerimaAllowed.includes(route)) {
        if (route === '/dashboard' || route === '/terms') {
          warning('Akses Dibatasi', 'Penerima tidak dapat melihat halaman Dampak ESG dan Standar Mutu.');
        } else {
          warning('Akses Dibatasi', 'Penerima tidak memiliki izin untuk mengakses halaman tersebut.');
        }
        window.location.hash = '#/penerima';
      }
      return;
    }

    // 4. Admin
    // Hak akses: Admin Dashboard (/admin), Standar Mutu (/terms), Dampak ESG (/dashboard).
    // Batasan: Tidak dapat akses beranda (/), /penerima*, /penyedia*.
    if (user?.role === 'admin') {
      const adminAllowed = ['/admin', '/dashboard', '/terms'];
      if (!adminAllowed.includes(route)) {
        warning('Akses Dibatasi', 'Admin mengelola sistem dan keluhan melalui Admin Dashboard.');
        window.location.hash = '#/admin';
      }
      return;
    }
  }, [route, isAuthenticated, user, isLoading, warning]);

  // Periodically check for expired items
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndExpireItems();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#F7F9F6]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center flex flex-col items-center"
        >
          <div
            className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/15"
            style={{ background: '#2D6A4F' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2.5L3.5 8.5L12 14.5L20.5 8.5L12 2.5Z" fill="currentColor" />
              <path d="M3.5 13.5L12 19.5L20.5 13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-display-md font-semibold text-[#143628] tracking-tight">AksesPangan</div>
          <div className="mt-2 text-caption-apple text-[#597367]">Memuat ekosistem penyelamatan pangan...</div>
        </motion.div>
      </div>
    );
  }

  // Show Apple 2-row navigation across app, except clean full-screen auth pages
  const isAuthPage = ['/login', '/register'].includes(route);
  const showNav = !isAuthPage;
  const showMobileDock = isAuthenticated && !isAuthPage;

  const renderPage = () => {
    switch (route) {
      case '/':
        return <LandingPage />;
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      case '/penyedia':
        return <PenyediaDashboard />;
      case '/penyedia/surplus':
        return <PenyediaSurplus />;
      case '/penyedia/booking':
        return <PenyediaBooking />;
      case '/penyedia/history':
        return <PenyediaHistory />;
      case '/penerima':
        return <PenerimaDashboard />;
      case '/penerima/booking':
        return <PenerimaBooking />;
      case '/penerima/history':
        return <PenerimaHistory />;
      case '/dashboard':
        return <ImpactDashboard />;
      case '/admin':
        return <AdminDashboard />;
      case '/terms':
        return <TermsPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen text-[#143628] antialiased bg-[#F7F9F6] selection:bg-[#2D6A4F] selection:text-white">
      {showNav && <Navbar currentRoute={route} />}
      <AnimatePresence mode="wait">
        <motion.main
          key={route}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full ${showMobileDock ? 'pb-24 md:pb-0' : ''}`}
          style={{ paddingTop: showNav && route !== '/' ? '68px' : '0' }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      {showMobileDock && <BottomNav />}
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </AuthProvider>
  );
}
