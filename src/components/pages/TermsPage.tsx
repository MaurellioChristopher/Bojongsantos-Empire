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
  const { success, warning, error } = useNotification();
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
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FBF7F0]">
        <div className="w-16 h-16 rounded-full bg-[#FFFDF9] flex items-center justify-center text-[#D95327] mb-4 border border-[#EADECF] shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#2C221D] mb-2">
          Akses Dibatasi untuk {isPenyedia ? 'Penyedia' : 'Penerima'}
        </h2>
        <p className="text-body-apple text-[#7D6F64] max-w-md mb-6">
          Sesuai aturan hak akses platform AksesPangan, akun {isPenyedia ? 'Mitra Penyedia' : 'Penerima Manfaat'} tidak memiliki izin untuk melihat maupun mengelola informasi pada fitur Standar Mutu dan Regulasi Konsumsi.
        </p>
        <a
          href={isPenyedia ? '#/penyedia' : '#/penerima'}
          className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-sm py-2.5 px-6 rounded-xl font-medium shadow-sm transition-all"
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
    if (!confirm(`Hapus pasal "${item.title}"?`)) return;
    try {
      deleteQualityStandard(item.id);
      success('Pasal Dihapus', `Pasal "${item.title}" berhasil dihapus.`);
      refreshStandards();
    } catch {
      error('Gagal', 'Terjadi kesalahan saat menghapus pasal.');
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    try {
      if (editingItem) {
        updateQualityStandard(editingItem.id, {
          title: formTitle,
          content: formContent,
        });
        success('Pasal Diperbarui', `Pasal "${formTitle}" berhasil disimpan.`);
      } else {
        addQualityStandard({
          title: formTitle,
          content: formContent,
          order: standards.length + 1,
        });
        success('Pasal Ditambahkan', `Pasal "${formTitle}" berhasil diterbitkan.`);
      }
      setIsModalOpen(false);
      refreshStandards();
    } catch {
      error('Gagal', 'Terjadi kesalahan saat menyimpan pasal.');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#FBF7F0] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#EADECF]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF2EB] text-[#D95327] border border-[#F2DACB] text-xs font-semibold uppercase tracking-wider mb-3">
              <Shield size={14} className="text-[#D95327]" />
              <span>Standar Keamanan Pangan &amp; Syarat Layanan</span>
            </div>
            <h1 className="text-display-lg text-[#2C221D] mb-2 font-serif">
              Standar Mutu &amp; Regulasi Konsumsi
            </h1>
            <p className="text-body-apple text-[#7D6F64] max-w-2xl m-0">
              Protokol ketat penanganan surplus makanan untuk memastikan seluruh hidangan yang diselamatkan layak, aman, dan higienis dikonsumsi masyarakat.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>Tambah Standar Mutu</span>
            </button>
          )}
        </div>

        {/* 4 Core Pillars */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-6 sm:p-8 mb-8 shadow-xs">
          <h2 className="text-tagline text-[#2C221D] mb-4">
            4 Pilar Jaminan Mutu AksesPangan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#D95327] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <ThermometerSun size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#2C221D] mb-1">Kontrol Suhu Penyimpanan</h4>
                <p className="text-caption-apple text-[#7D6F64] m-0">
                  Makanan panas dijaga di atas 60°C dan makanan dingin di bawah 5°C sebelum diambil oleh penerima.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#D95327] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#2C221D] mb-1">Batas Waktu Konsumsi (4 Jam)</h4>
                <p className="text-caption-apple text-[#7D6F64] m-0">
                  Makanan siap saji tidak boleh dibiarkan lebih dari 4 jam pada rentang suhu bahaya (5°C - 60°C).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#D95327] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#2C221D] mb-1">Batas Waktu Pengambilan</h4>
                <p className="text-caption-apple text-[#7D6F64] m-0">
                  Ambil makanan sesuai jadwal pickup deadline untuk memastikan kesegaran tetap prima.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#EADECF] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#D95327] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#2C221D] mb-1">Verifikasi Fisik di Tempat</h4>
                <p className="text-caption-apple text-[#7D6F64] m-0">
                  Periksa kemasan tertutup rapat dan pastikan tidak ada perubahan warna atau aroma yang tidak wajar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Callout Box */}
        <div className="p-5 rounded-[14px] flex items-start gap-3.5 mb-8 bg-[#FFF2EB] border border-[#FAD7C8]">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-[#D95327]" />
          <div>
            <div className="text-body-strong text-[#2C221D] mb-0.5">Catatan Penting Konsumsi</div>
            <div className="text-caption-apple text-[#7D6F64] leading-relaxed">
              Jika setelah dibuka makanan mengeluarkan aroma masam, berlendir, atau kemasan rusak, segera buang dan laporkan melalui platform. Keselamatan Anda selalu menjadi prioritas utama.
            </div>
          </div>
        </div>

        {/* Terms Accordion (Dynamic from Database) */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-tagline text-[#2C221D] flex items-center gap-2 m-0 font-bold">
              <BookOpen size={20} className="text-[#D95327]" />
              Pasal Ketentuan &amp; Standar Mutu Platform
            </h2>
            {isAdmin && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FAF2EB] text-[#D95327] border border-[#F2DACB] font-semibold inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#D95327]" /> Mode Admin Aktif
              </span>
            )}
          </div>

          <div className="divide-y divide-[#EADECF]">
            {standards.map((item, index) => {
              const isOpen = openSection === index;
              return (
                <div key={item.id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleSection(index)}
                      className={`flex-1 text-left flex items-center justify-between gap-4 font-semibold text-[16px] sm:text-[17px] transition-colors cursor-pointer ${
                        isOpen ? 'text-[#D95327]' : 'text-[#2C221D] hover:opacity-75'
                      }`}
                    >
                      <span>{item.title}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#7D6F64] flex-shrink-0"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1.5 rounded-md hover:bg-[#F5EFEB] text-[#7D6F64] hover:text-[#2C221D] transition-colors"
                          title="Ubah pasal"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item, e)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-[#A8988B] hover:text-rose-600 transition-colors"
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
                        className="overflow-hidden pt-3 text-body-apple text-[#7D6F64]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18110D]/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#FFFDF9] rounded-2xl shadow-2xl p-6 border border-[#EADECF] text-[#2C221D]"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EADECF]">
              <h3 className="font-semibold text-lg text-[#2C221D] m-0">
                {editingItem ? 'Ubah Standar Mutu' : 'Tambah Standar Mutu Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#7D6F64] hover:text-[#2C221D] rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C221D] uppercase tracking-wider mb-1">
                  Judul Pasal / Standar Mutu
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: 6. Kebijakan Kemasan Ramah Lingkungan"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EADECF] bg-[#FAF7F2] text-[#2C221D] focus:outline-none focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C221D] uppercase tracking-wider mb-1">
                  Isi Ketentuan &amp; Regulasi
                </label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Rincian ketentuan standar mutu dan kewajiban pengguna..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADECF] bg-[#FAF7F2] text-[#2C221D] focus:outline-none focus:border-[#D95327] focus:ring-2 focus:ring-[#D95327]/15 text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#7D6F64] hover:text-[#2C221D]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-sm py-2 px-5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
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
