'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  AlertTriangle,
  Shield,
  BookOpen,
  ThermometerSun,
  Clock,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  getQualityStandards,
  addQualityStandard,
  updateQualityStandard,
  deleteQualityStandard,
} from '@/lib/data';
import type { QualityStandardItem } from '@/types';

export function TermsPage() {
  const { user } = useAuth();
  const { success, warning } = useNotification();
  const [standards, setStandards] = useState<QualityStandardItem[]>([]);
  const [openSection, setOpenSection] = useState<number | null>(0);

  // Admin CRUD Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QualityStandardItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const refreshStandards = () => {
    setStandards(getQualityStandards());
  };

  useEffect(() => {
    refreshStandards();
  }, []);

  const toggleSection = (index: number) => {
    setOpenSection(openSection === index ? null : index);
  };

  // Block access for Penyedia & Penerima
  if (user?.role === 'penyedia' || user?.role === 'penerima') {
    const isPenyedia = user.role === 'penyedia';
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#f5f5f7]">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-amber-500 mb-4 border border-black/10 shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#1d1d1f] mb-2">
          Akses Dibatasi untuk {isPenyedia ? 'Penyedia' : 'Penerima'}
        </h2>
        <p className="text-body-apple text-[#86868b] max-w-md mb-6">
          Sesuai aturan hak akses platform AksesPangan, akun {isPenyedia ? 'Mitra Penyedia' : 'Penerima Manfaat'} tidak memiliki izin untuk melihat maupun mengelola informasi pada fitur Standar Mutu dan Regulasi Konsumsi.
        </p>
        <a
          href={isPenyedia ? '#/penyedia' : '#/penerima'}
          className="btn-apple-primary text-sm py-2.5 px-6"
        >
          Kembali ke {isPenyedia ? 'Dashboard Penyedia' : 'Katalog Surplus'}
        </a>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormContent('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: QualityStandardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setIsModalOpen(true);
  };

  const handleDelete = (item: QualityStandardItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Apakah Anda yakin ingin menghapus pasal: "${item.title}"?`)) {
      deleteQualityStandard(item.id);
      success('Pasal Dihapus', `Standar mutu "${item.title}" telah dihapus.`);
      refreshStandards();
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      warning('Data Tidak Lengkap', 'Judul dan isi pasal wajib diisi.');
      return;
    }

    if (editingItem) {
      updateQualityStandard(editingItem.id, {
        title: formTitle.trim(),
        content: formContent.trim(),
      });
      success('Berhasil Diperbarui', 'Pasal standar mutu telah disimpan.');
    } else {
      addQualityStandard({
        title: formTitle.trim(),
        content: formContent.trim(),
        order: standards.length + 1,
      });
      success('Pasal Ditambahkan', 'Pasal standar mutu baru berhasil diterbitkan.');
    }

    setIsModalOpen(false);
    refreshStandards();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[rgba(0,0,0,0.08)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[#555555] text-xs font-semibold uppercase tracking-wider mb-3">
              <Shield size={14} style={{ color: '#FF5A1F' }} />
              <span>Standar Keamanan Pangan &amp; Syarat Layanan</span>
            </div>
            <h1 className="text-display-lg text-[#1d1d1f] mb-2 font-serif">
              Standar Mutu &amp; Regulasi Konsumsi
            </h1>
            <p className="text-body-apple text-[#86868b] max-w-2xl m-0">
              Protokol ketat penanganan surplus makanan untuk memastikan seluruh hidangan yang diselamatkan layak, aman, dan higienis dikonsumsi masyarakat.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="btn-apple-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto shrink-0"
            >
              <Plus size={15} />
              <span>Tambah Standar Mutu</span>
            </button>
          )}
        </div>

        {/* 4 Core Pillars */}
        <div className="card-apple-utility bg-white p-6 sm:p-8 mb-8">
          <h2 className="text-tagline text-[#1d1d1f] mb-4">
            4 Pilar Jaminan Mutu AksesPangan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[14px] bg-[#f5f5f7] flex items-start gap-3.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
              >
                <ThermometerSun size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#1d1d1f] mb-1">Kontrol Suhu Penyimpanan</h4>
                <p className="text-caption-apple text-[#86868b] m-0">
                  Makanan panas dijaga di atas 60°C dan makanan dingin di bawah 5°C sebelum diambil oleh penerima.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#f5f5f7] flex items-start gap-3.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
              >
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#1d1d1f] mb-1">Batas Waktu Konsumsi (4 Jam)</h4>
                <p className="text-caption-apple text-[#86868b] m-0">
                  Makanan siap saji tidak boleh dibiarkan lebih dari 4 jam pada rentang suhu bahaya (5°C - 60°C).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#f5f5f7] flex items-start gap-3.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
              >
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#1d1d1f] mb-1">Batas Waktu Pengambilan</h4>
                <p className="text-caption-apple text-[#86868b] m-0">
                  Ambil makanan sesuai jadwal pickup deadline untuk memastikan kesegaran tetap prima.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#f5f5f7] flex items-start gap-3.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
              >
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#1d1d1f] mb-1">Verifikasi Fisik di Tempat</h4>
                <p className="text-caption-apple text-[#86868b] m-0">
                  Periksa kemasan tertutup rapat dan pastikan tidak ada perubahan warna atau aroma yang tidak wajar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Callout Box */}
        <div
          className="p-5 rounded-[14px] flex items-start gap-3.5 mb-8 border"
          style={{
            background: 'linear-gradient(135deg, rgba(255,178,0,0.07), rgba(255,57,19,0.07))',
            borderColor: 'rgba(255,100,30,0.25)',
          }}
        >
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#FF5A1F' }} />
          <div>
            <div className="text-body-strong text-[#1d1d1f] mb-0.5">Catatan Penting Konsumsi</div>
            <div className="text-caption-apple text-[#86868b] leading-relaxed">
              Jika setelah dibuka makanan mengeluarkan aroma masam, berlendir, atau kemasan rusak, segera buang dan laporkan melalui platform. Keselamatan Anda selalu menjadi prioritas utama.
            </div>
          </div>
        </div>

        {/* Terms Accordion (Dynamic from Database) */}
        <div className="card-apple-utility bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-tagline text-[#1d1d1f] flex items-center gap-2 m-0">
              <BookOpen size={20} style={{ color: '#FF5A1F' }} />
              Pasal Ketentuan &amp; Standar Mutu Platform
            </h2>
            {isAdmin && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#FF5A1F]" /> Mode Admin Aktif
              </span>
            )}
          </div>

          <div className="divide-y divide-[rgba(0,0,0,0.08)]">
            {standards.map((item, index) => {
              const isOpen = openSection === index;
              return (
                <div key={item.id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleSection(index)}
                      className={`flex-1 text-left flex items-center justify-between gap-4 font-semibold text-[16px] sm:text-[17px] transition-colors ${
                        isOpen ? '' : 'text-[#1d1d1f] hover:opacity-75'
                      }`}
                      style={isOpen ? { color: '#FF5A1F' } : {}}
                    >
                      <span>{item.title}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#86868b] flex-shrink-0"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors"
                          title="Ubah pasal"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item, e)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Hapus pasal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pt-3 text-body-apple text-[#86868b]"
                      >
                        <p className="m-0 leading-relaxed whitespace-pre-line">{item.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <h3 className="font-semibold text-lg text-neutral-900 m-0">
                {editingItem ? 'Ubah Standar Mutu' : 'Tambah Standar Mutu Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Judul Pasal / Standar Mutu
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: 6. Kebijakan Kemasan Ramah Lingkungan"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#FF5A1F] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Isi Ketentuan &amp; Regulasi
                </label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Rincian ketentuan standar mutu dan kewajiban pengguna..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:border-[#FF5A1F] text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-apple-primary text-sm py-2 px-5 flex items-center gap-2"
                >
                  <Save size={15} />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Terbitkan Pasal'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
