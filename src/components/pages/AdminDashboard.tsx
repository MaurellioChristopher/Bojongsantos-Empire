'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Receipt, BarChart3, Trash2, Search, Shield, Server, CheckCircle2, RefreshCw, Activity, MessageSquare, BookOpen, Target, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { adminService } from '@/services/adminService';
import { impactService } from '@/services/impactService';
import { getAdminComplaints, updateComplaintStatus, getQualityStandards, getEsgConfig } from '@/lib/data';
import { formatDateTime } from '@/lib/utils';
import { BOOKING_STATUS_LABELS } from '@/types';
import type { User, Booking, BookingStatus, ImpactData, AdminComplaint } from '@/types';
import type { ServiceHealth } from '@/types/api';
import { ChatModal } from '@/components/chat/ChatModal';

export function AdminDashboard() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'complaints' | 'governance' | 'microservices'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const [u, b, imp, s] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getTransactions(),
        impactService.getStats(),
        adminService.getServicesHealth(),
      ]);
      setUsers(u);
      setBookings(b);
      setImpact(imp);
      setServices(s);
      setComplaints(getAdminComplaints());
    } catch {
      error('Gagal memuat data', 'Terjadi kesalahan saat memuat data admin');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDeleteUser = async (userId: string, name: string) => {
    if (userId === user?.id) return;
    try {
      await adminService.deleteUser(userId);
      success('Pengguna Dihapus', `${name} telah dihapus dari sistem`);
      refresh();
    } catch {
      error('Gagal menghapus', 'Terjadi kesalahan saat menghapus pengguna');
    }
  };

  const handleUpdateComplaint = (complaintId: string, status: 'open' | 'in_progress' | 'resolved') => {
    updateComplaintStatus(complaintId, status);
    success('Status Diperbarui', `Status keluhan diubah menjadi ${status.toUpperCase()}`);
    setComplaints(getAdminComplaints());
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#f5f5f7]">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#86868b] mb-4 border border-[rgba(0,0,0,0.08)]">
          <Shield size={32} />
        </div>
        <h2 className="text-display-md text-[#1d1d1f] mb-2">Akses Dibatasi</h2>
        <p className="text-body-apple text-[#86868b] max-w-sm mb-6">
          Halaman ini khusus untuk administrator platform AksesPangan.
        </p>
        <a href="#/login" className="btn-apple-primary">
          Masuk Sebagai Admin
        </a>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'complaints' as const, label: `Keluhan (${complaints.filter(c => c.status !== 'resolved').length})`, icon: MessageSquare },
    { id: 'governance' as const, label: 'Standar & ESG', icon: BookOpen },
    { id: 'users' as const, label: 'Pengguna', icon: Users },
    { id: 'transactions' as const, label: 'Transaksi', icon: Receipt },
    { id: 'microservices' as const, label: 'Sistem', icon: Server },
  ];

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-display-lg text-[#1d1d1f] mb-1">Admin Governance</h1>
            <p className="text-body-apple text-[#86868b]">
              Pengawasan platform & status kesehatan seluruh microservices.
            </p>
          </div>

          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="btn-apple-dark text-xs flex items-center gap-1.5 self-start sm:self-auto py-2 px-3.5"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Sinkronisasi Data</span>
          </button>
        </div>

        {/* Apple Segmented Control Switcher */}
        <div className="flex items-center bg-[#e5e5ea] p-1 rounded-full w-full max-w-md mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold tracking-tight transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. Overview Tab */}
        {activeTab === 'overview' && impact && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-apple-utility bg-white p-5 text-center">
                <div className="text-display-md font-semibold text-[#1d1d1f]">{users.length}</div>
                <div className="text-caption-apple text-[#86868b]">Total Akun Terdaftar</div>
              </div>
              <div className="card-apple-utility bg-white p-5 text-center">
                <div className="text-display-md font-semibold text-[#34c759]">{impact.totalKgSaved} kg</div>
                <div className="text-caption-apple text-[#86868b]">Makanan Terselamatkan</div>
              </div>
              <div className="card-apple-utility bg-white p-5 text-center">
                <div className="text-display-md font-semibold text-[#1d1d1f]">{bookings.length}</div>
                <div className="text-caption-apple text-[#86868b]">Transaksi Tercatat</div>
              </div>
              <div className="card-apple-utility bg-white p-5 text-center">
                <div className="text-display-md font-semibold text-[#15803d]">{impact.totalCO2eSaved} kg</div>
                <div className="text-caption-apple text-[#86868b]">CO₂e Ditekan</div>
              </div>
            </div>

            <div className="card-apple-utility bg-white p-6">
              <h3 className="text-tagline text-[#1d1d1f] mb-4">Transaksi Terkini</h3>
              <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-body-strong text-[#1d1d1f]">{b.surplusName}</div>
                      <div className="text-caption-apple text-[#86868b]">
                        {b.recipientName} • {b.providerBusinessName} • {b.quantity} kg
                      </div>
                    </div>
                    <span className="badge-apple badge-apple-neutral text-xs">
                      {BOOKING_STATUS_LABELS[b.status] || b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Users Tab */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
              <input
                type="text"
                placeholder="Cari akun pengguna berdasarkan nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="apple-search-pill"
              />
            </div>

            <div className="card-apple-utility bg-white p-0 overflow-hidden">
              <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 sm:px-6 flex items-center justify-between">
                    <div>
                      <div className="text-body-strong text-[#1d1d1f] flex items-center gap-2">
                        {u.name}
                        {u.id === user.id && (
                          <span className="text-xs text-[#1d1d1f] font-normal">(Akun Anda)</span>
                        )}
                      </div>
                      <div className="text-caption-apple text-[#86868b]">
                        {u.email} • {u.phone} {u.businessName ? `• ${u.businessName}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge-apple ${
                        u.role === 'admin' ? 'badge-apple-info' : u.role === 'penyedia' ? 'badge-apple-warning' : 'badge-apple-success'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-full transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. Transactions Tab */}
        {activeTab === 'transactions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="card-apple-utility bg-white p-0 overflow-hidden">
              <div className="divide-y divide-[rgba(0,0,0,0.06)]">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 sm:px-6 flex items-center justify-between">
                    <div>
                      <div className="text-body-strong text-[#1d1d1f] mb-0.5">{b.surplusName}</div>
                      <div className="text-caption-apple text-[#86868b]">
                        Penerima: {b.recipientName} • Restoran: {b.providerBusinessName} • Jumlah: {b.quantity} kg
                      </div>
                      <div className="text-fine-print text-[#86868b] mt-1">
                        {formatDateTime(b.bookedAt)}
                      </div>
                    </div>
                    <span className="badge-apple badge-apple-neutral text-xs">
                      {BOOKING_STATUS_LABELS[b.status] || b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Complaints / Keluhan Pengguna Tab */}
        {activeTab === 'complaints' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-tagline text-[#1d1d1f] mb-1">Pusat Layanan &amp; Keluhan Pengguna</h3>
                <p className="text-caption-apple text-[#86868b]">
                  Daftar laporan kendala dan tiket aduan dari Mitra Penyedia dan Penerima Manfaat.
                </p>
              </div>
              <div className="text-xs text-neutral-500 font-mono">
                Total {complaints.length} Tiket
              </div>
            </div>

            {complaints.length === 0 ? (
              <div className="card-apple-utility bg-white p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-body-strong text-neutral-800 mb-1">Tidak Ada Keluhan Tertunda</h4>
                <p className="text-caption-apple text-neutral-500 m-0">Semua laporan kendala pengguna telah berhasil diselesaikan.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div key={c.id} className="card-apple-utility bg-white p-5 sm:p-6 border border-neutral-200">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full ${
                            c.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {c.status === 'resolved' ? 'SELESAI' : c.status === 'in_progress' ? 'SEDANG DITANGANI' : 'BARU'}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {formatDateTime(c.createdAt)}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-neutral-900 m-0">{c.subject}</h4>
                        <div className="text-xs text-neutral-500 mt-1">
                          Dari: <strong className="text-neutral-800">{c.userName}</strong> ({c.userRole.toUpperCase()} • {c.userEmail})
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="btn-apple-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                        >
                          <MessageSquare size={13} />
                          <span>Buka Chat ({c.replies?.length || 0})</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-700 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 m-0 leading-relaxed">
                      {c.message}
                    </p>

                    <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-neutral-100 text-xs">
                      <span className="text-neutral-500">Ubah Status Tiket:</span>
                      <div className="flex items-center gap-2">
                        {c.status !== 'in_progress' && (
                          <button
                            onClick={() => handleUpdateComplaint(c.id, 'in_progress')}
                            className="text-xs font-medium text-amber-700 hover:underline cursor-pointer"
                          >
                            Tandai Sedang Ditangani
                          </button>
                        )}
                        {c.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateComplaint(c.id, 'resolved')}
                            className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                            <span>Tandai Selesai</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Standar Mutu & ESG Governance Tab */}
        {activeTab === 'governance' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h3 className="text-tagline text-[#1d1d1f] mb-1">Tata Kelola Standar Mutu &amp; Dampak ESG</h3>
              <p className="text-caption-apple text-[#86868b]">
                Pintasan cepat untuk mengelola regulasi keselamatan makanan dan target keberlanjutan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="card-apple-utility bg-white p-6 border border-neutral-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFF7ED] text-[#E8592A] border border-[#FFEDD5] mb-3">
                    <BookOpen size={20} />
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900 mb-1">Standar Mutu &amp; Regulasi</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                    Kelola pasal dan klausul keamanan makanan, batas waktu penyimpanan, protokol suhu, dan hak kewajiban pengguna.
                  </p>
                </div>
                <a href="#/terms" className="btn-apple-primary text-xs py-2.5 px-4 text-center">
                  Buka &amp; Kelola Standar Mutu (CRUD)
                </a>
              </div>

              <div className="card-apple-utility bg-white p-6 border border-neutral-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFF7ED] text-[#E8592A] border border-[#FFEDD5] mb-3">
                    <Target size={20} />
                  </div>
                  <h4 className="text-base font-semibold text-neutral-900 mb-1">Laporan &amp; Target Dampak ESG</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                    Kelola target penyelamatan tonase pangan nasional, reduksi emisi CO₂e, target porsi, dan pernyataan misi keberlanjutan.
                  </p>
                </div>
                <a href="#/dashboard" className="btn-apple-primary text-xs py-2.5 px-4 text-center">
                  Buka &amp; Kelola Target ESG
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. Microservices Observability Tab (Apple Server Monitoring) */}
        {activeTab === 'microservices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <h3 className="text-tagline text-[#1d1d1f] mb-1">Status Operasional Microservices</h3>
              <p className="text-caption-apple text-[#86868b]">
                Seluruh endpoint beroperasi mandiri dengan kontrak REST API TypeScript murni.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div key={svc.service} className="card-apple-utility bg-white p-5 flex items-start justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a] flex-shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div className="text-body-strong text-[#1d1d1f] mb-0.5">{svc.service}</div>
                      <div className="flex items-center gap-2 text-xs text-[#15803d] font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                        100% Operasional
                      </div>
                      <div className="text-fine-print text-[#86868b] mt-1.5">
                        Uptime: {Math.floor(svc.uptimeSeconds / 60)} menit • Sinkron: {new Date(svc.timestamp).toLocaleTimeString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <span className="badge-apple badge-apple-success text-xs font-mono">200 OK</span>
                </div>
              ))}
            </div>

            {/* Microservice Endpoints Registry */}
            <div className="card-apple-utility bg-white p-6">
              <h4 className="text-body-strong text-[#1d1d1f] mb-3">Katalog Endpoint Terintegrasi</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[#1d1d1f]">
                <div className="bg-[#f5f5f7] p-2.5 rounded-[8px] flex items-center justify-between">
                  <span>POST /api/auth/login</span>
                  <span className="text-[#16a34a]">Active</span>
                </div>
                <div className="bg-[#f5f5f7] p-2.5 rounded-[8px] flex items-center justify-between">
                  <span>POST /api/auth/register</span>
                  <span className="text-[#16a34a]">Active</span>
                </div>
                <div className="bg-[#f5f5f7] p-2.5 rounded-[8px] flex items-center justify-between">
                  <span>GET /api/surplus</span>
                  <span className="text-[#16a34a]">Active</span>
                </div>
                <div className="bg-[#f5f5f7] p-2.5 rounded-[8px] flex items-center justify-between">
                  <span>POST /api/surplus</span>
                  <span className="text-[#16a34a]">Active</span>
                </div>
                <div className="bg-[#f5f5f7] p-2.5 rounded-[8px] flex items-center justify-between">
                  <span>POST /api/bookings</span>
                  <span className="text-[#16a34a]">Active</span>
                </div>
                <div className="bg-[#f5f5f7] p-2.5 rounded-[8px] flex items-center justify-between">
                  <span>GET /api/impact/stats</span>
                  <span className="text-[#16a34a]">Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Admin Complaint Chat & Resolution Modal */}
      {selectedComplaint && (
        <ChatModal
          type="complaint"
          complaint={selectedComplaint}
          isOpen={!!selectedComplaint}
          onClose={() => {
            setSelectedComplaint(null);
            setComplaints(getAdminComplaints());
          }}
        />
      )}
    </div>
  );
}

