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
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#2D6A4F] mb-4 border border-[#DCE5DB] shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">
          Access Restricted for {isPenyedia ? 'Providers' : 'Recipients'}
        </h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Under AksesPangan access policies, {isPenyedia ? 'Provider Partner' : 'Beneficiary Recipient'} accounts do not have permission to view or manage Quality Standards and Consumption Regulations.
        </p>
        <a
          href={isPenyedia ? '#/penyedia' : '#/penerima'}
          className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-sm py-2.5 px-6 rounded-xl font-medium shadow-sm transition-all"
        >
          Back to {isPenyedia ? 'Provider Dashboard' : 'Surplus Catalog'}
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
    if (!confirm(`Delete article "${item.title}"?`)) return;
    try {
      deleteQualityStandard(item.id);
      success('Article Deleted', `Article "${item.title}" was successfully deleted.`);
      refreshStandards();
    } catch {
      error('Failed', 'An error occurred while deleting the article.');
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
        success('Article Updated', `Article "${formTitle}" was successfully updated.`);
      } else {
        addQualityStandard({
          title: formTitle,
          content: formContent,
          order: standards.length + 1,
        });
        success('Article Added', `Article "${formTitle}" was successfully published.`);
      }
      setIsModalOpen(false);
      refreshStandards();
    } catch {
      error('Failed', 'An error occurred while saving the article.');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#F7F9F6] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#DCE5DB]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] text-xs font-semibold uppercase tracking-wider mb-3">
              <Shield size={14} className="text-[#2D6A4F]" />
              <span>Food Safety Standards &amp; Terms of Service</span>
            </div>
            <h1 className="text-display-lg text-[#143628] mb-2 font-serif">
              Quality Standards &amp; Consumption Regulations
            </h1>
            <p className="text-body-apple text-[#597367] max-w-2xl m-0">
              Strict food surplus management protocols ensuring every rescued meal is wholesome, safe, and hygienic for community consumption.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>Add Quality Standard</span>
            </button>
          )}
        </div>

        {/* 4 Core Pillars */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 sm:p-8 mb-8 shadow-xs">
          <h2 className="text-tagline text-[#143628] mb-4">
            4 Pillars of AksesPangan Quality Assurance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <ThermometerSun size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#143628] mb-1">Storage Temperature Control</h4>
                <p className="text-caption-apple text-[#597367] m-0">
                  Hot food maintained above 60°C and cold food below 5°C before recipient pickup.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#143628] mb-1">Consumption Window (4 Hours)</h4>
                <p className="text-caption-apple text-[#597367] m-0">
                  Ready-to-eat food must not stay more than 4 hours in the temperature danger zone (5°C - 60°C).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#143628] mb-1">Pickup Deadline</h4>
                <p className="text-caption-apple text-[#597367] m-0">
                  Pick up food according to the scheduled deadline to ensure maximum freshness.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB] flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="text-body-strong text-[#143628] mb-1">On-site Physical Verification</h4>
                <p className="text-caption-apple text-[#597367] m-0">
                  Inspect sealed packaging and verify there is no unusual discoloration or odor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Callout Box */}
        <div className="p-5 rounded-[14px] flex items-start gap-3.5 mb-8 bg-[#FFF2EB] border border-[#FAD7C8]">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-[#2D6A4F]" />
          <div>
            <div className="text-body-strong text-[#143628] mb-0.5">Important Consumption Notice</div>
            <div className="text-caption-apple text-[#597367] leading-relaxed">
              If upon opening the food smells sour, feels slimy, or has compromised packaging, dispose of it immediately and report via the platform. Your safety is always our top priority.
            </div>
          </div>
        </div>

        {/* Terms Accordion (Dynamic from Database) */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DCE5DB] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-tagline text-[#143628] flex items-center gap-2 m-0 font-bold">
              <BookOpen size={20} className="text-[#2D6A4F]" />
              Platform Quality Standards &amp; Regulations
            </h2>
            {isAdmin && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] font-semibold inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#2D6A4F]" /> Admin Mode Active
              </span>
            )}
          </div>

          <div className="divide-y divide-[#DCE5DB]">
            {standards.map((item, index) => {
              const isOpen = openSection === index;
              return (
                <div key={item.id} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleSection(index)}
                      className={`flex-1 text-left flex items-center justify-between gap-4 font-semibold text-[16px] sm:text-[17px] transition-colors cursor-pointer ${
                        isOpen ? 'text-[#2D6A4F]' : 'text-[#143628] hover:opacity-75'
                      }`}
                    >
                      <span>{item.title}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#597367] flex-shrink-0"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          onClick={(e) => handleOpenEdit(item, e)}
                          className="p-1.5 rounded-md hover:bg-[#EDF2EC] text-[#597367] hover:text-[#143628] transition-colors"
                          title="Edit article"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item, e)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-[#A8988B] hover:text-rose-600 transition-colors"
                          title="Delete article"
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
                        className="overflow-hidden pt-3 text-body-apple text-[#597367]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C2017]/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#FFFFFF] rounded-2xl shadow-2xl p-6 border border-[#DCE5DB] text-[#143628]"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCE5DB]">
              <h3 className="font-semibold text-lg text-[#143628] m-0">
                {editingItem ? 'Edit Quality Standard' : 'Add New Quality Standard'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#597367] hover:text-[#143628] rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#143628] uppercase tracking-wider mb-1">
                  Article / Standard Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 6. Eco-Friendly Packaging Policy"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE5DB] bg-[#FAF7F2] text-[#143628] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#143628] uppercase tracking-wider mb-1">
                  Provisions &amp; Regulation Content
                </label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Detailed quality standards and user obligations..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE5DB] bg-[#FAF7F2] text-[#143628] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-[#597367] hover:text-[#143628]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-sm py-2 px-5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save size={15} />
                  <span>{editingItem ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
