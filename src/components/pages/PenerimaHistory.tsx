'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, PackageCheck, Leaf, Calendar, ClipboardList, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getBookingsByRecipient } from '@/lib/data';
import { formatDateTime } from '@/lib/utils';
import { BOOKING_STATUS_LABELS } from '@/types';
import type { Booking, BookingStatus } from '@/types';

export function PenerimaHistory() {
  const { user, login } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      setBookings(
        getBookingsByRecipient(user.id)
          .filter((b) => ['diambil', 'dibatalkan', 'kedaluwarsa'].includes(b.status))
          .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
      );
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#143628] mb-4 border border-[#DCE5DB] shadow-sm">
          <Clock size={32} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">Booking &amp; Rescue History</h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Please log in to your account to view the complete archive of food you have claimed.
        </p>
        <div className="flex items-center justify-center">
          <a
            href="#/login"
            className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-sm py-2.5 px-6 rounded-xl font-medium shadow-sm transition-all text-center"
          >
            Log in to Your Account
          </a>
        </div>
      </div>
    );
  }

  const statusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'diambil':
        return <span className="badge-apple badge-apple-success">Completed</span>;
      case 'dibatalkan':
        return <span className="badge-apple badge-apple-error">Cancelled</span>;
      case 'kedaluwarsa':
        return <span className="badge-apple badge-apple-warning">Expired</span>;
      default:
        return <span className="badge-apple badge-apple-neutral">{BOOKING_STATUS_LABELS[status] || status}</span>;
    }
  };

  const totalSaved = bookings.filter((b) => b.status === 'diambil').reduce((sum, b) => sum + b.quantity, 0);
  const co2Saved = (totalSaved * 2.5).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F7F9F6] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Header */}
        <div className="mb-8">
          <a href="#/penerima" className="text-[#2D6A4F] hover:text-[#B8401A] text-xs mb-2 inline-flex items-center gap-1 font-semibold">
            <ArrowLeft size={14} /> Back to Beneficiary Home
          </a>
          <h1 className="text-display-lg text-[#143628]">Booking History</h1>
          <p className="text-body-apple text-[#597367] m-0">
            A comprehensive record of surplus food you have claimed and rescued.
          </p>
        </div>

        {/* Environmental Impact Highlight */}
        {totalSaved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0C2017] text-[#F3F8F5] p-6 sm:p-8 rounded-[20px] mb-8 relative overflow-hidden border border-[#2C2018] shadow-md"
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#CAD6C8] font-semibold mb-1 flex items-center gap-1.5">
                  <Leaf size={14} className="text-[#30d158]" /> Total Environmental Impact
                </p>
                <div className="text-[44px] font-bold tracking-tight text-[#F3F8F5] leading-none mb-2">
                  {totalSaved} <span className="text-xl font-medium text-[#CAD6C8]">kg food rescued</span>
                </div>
                <p className="text-body-apple text-[#CAD6C8] m-0 max-w-xl">
                  Equivalent to reducing <span className="text-[#F3F8F5] font-medium">{co2Saved} kg CO₂e</span> of greenhouse gas emissions from landfill food decomposition.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto bg-[#F3F8F5]/10 px-5 py-3 rounded-full border border-[#F3F8F5]/20">
                <PackageCheck size={20} className="text-[#30d158]" />
                <span className="text-sm font-semibold text-[#F3F8F5]">
                  {bookings.filter((b) => b.status === 'diambil').length} Completed Rescues
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* History List */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-tagline text-[#143628] font-bold">Transaction Records</h2>
            <span className="text-caption-apple text-[#597367]">{bookings.length} records</span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 text-[#597367]">
              <ClipboardList size={36} className="text-[#A8988B] mx-auto mb-3" />
              <p className="text-body-strong text-[#143628] mb-1">No booking history yet</p>
              <p className="text-caption-apple text-[#597367] max-w-xs mx-auto mb-4">
                When you complete or cancel an order, its history will appear here.
              </p>
              <a href="#/penerima" className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] px-4 py-2 rounded-xl text-xs font-semibold inline-flex shadow-sm transition-all">
                Explore Surplus Food
              </a>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE5DB]">
              {bookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body-strong text-[#143628]">{b.surplusName}</h3>
                      {statusBadge(b.status)}
                    </div>
                    <p className="text-caption-apple text-[#597367] mb-1">
                      Provider Partner: <span className="text-[#143628] font-medium">{b.providerBusinessName}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#597367]">
                      <span className="font-semibold text-[#143628] flex items-center gap-1">
                        <Scale size={12} /> {b.quantity} kg
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatDateTime(b.bookedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs text-[#597367] font-mono">ID: {b.id.slice(0, 8)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
