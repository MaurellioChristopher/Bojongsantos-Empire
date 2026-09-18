'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Heart,
  Package,
  TreePine,
  Award,
  ShieldCheck,
  Car,
  Droplets,
  Edit2,
  Save,
  X,
  Target,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { impactService } from '@/services/impactService';
import { getEsgConfig, updateEsgConfig } from '@/lib/data';
import type { ImpactData, ImpactTimeline, EsgConfig } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function ImpactDashboard() {
  const { user } = useAuth();
  const { success } = useNotification();
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [timeline, setTimeline] = useState<ImpactTimeline[]>([]);
  const [esgConfig, setEsgConfig] = useState<EsgConfig>(getEsgConfig());
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [targetKg, setTargetKg] = useState(10000);
  const [targetCO2, setTargetCO2] = useState(25000);
  const [targetPortions, setTargetPortions] = useState(20000);
  const [missionStatement, setMissionStatement] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [stats, tl] = await Promise.all([
          impactService.getStats(),
          impactService.getTimeline(),
        ]);
        setImpact(stats);
        setTimeline(tl);
      } catch {
        // Handled gracefully
      }
    }
    load();
    const cfg = getEsgConfig();
    setEsgConfig(cfg);
    setTargetKg(cfg.targetKg);
    setTargetCO2(cfg.targetCO2);
    setTargetPortions(cfg.targetPortions);
    setMissionStatement(cfg.missionStatement);
  }, []);

  // Block access for Penyedia & Penerima
  if (user?.role === 'penyedia' || user?.role === 'penerima') {
    const isPenyedia = user.role === 'penyedia';
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#2D6A4F] mb-4 border border-[#DCE5DB] shadow-sm">
          <Lock size={30} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">
          Akses Dibatasi untuk {isPenyedia ? 'Penyedia' : 'Penerima'}
        </h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Sesuai aturan hak akses platform AksesPangan, akun {isPenyedia ? 'Mitra Penyedia' : 'Penerima Manfaat'} tidak memiliki izin untuk melihat maupun mengelola fitur Laporan Dampak ESG.
        </p>
        <a
          href={isPenyedia ? '#/penyedia' : '#/penerima'}
          className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-sm py-2.5 px-6 rounded-xl font-medium shadow-sm transition-all"
        >
          Kembali ke {isPenyedia ? 'Dashboard Penyedia' : 'Katalog Surplus'}
        </a>
      </div>
    );
  }

  if (!impact) return null;

  const isAdmin = user?.role === 'admin';

  const handleSaveEsg = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateEsgConfig({
      targetKg: Number(targetKg),
      targetCO2: Number(targetCO2),
      targetPortions: Number(targetPortions),
      missionStatement: missionStatement.trim(),
    });
    setEsgConfig(updated);
    setIsEditing(false);
    success('Konfigurasi ESG Disimpan', 'Target dan komitmen dampak ESG telah diperbarui.');
  };

  const kgProgress = Math.min(Math.round((impact.totalKgSaved / esgConfig.targetKg) * 100), 100);
  const co2Progress = Math.min(Math.round((impact.totalCO2eSaved / esgConfig.targetCO2) * 100), 100);

  return (
    <div className="min-h-screen bg-[#F7F9F6] py-10 px-4 sm:px-8">
      <div className="apple-container">
        {/* Environment Style Header */}
        <div className="text-center max-w-[760px] mx-auto mb-12">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 bg-[#FAF2EB] text-[#2D6A4F] border border-[#F2DACB] shadow-2xs"
          >
            <Leaf size={14} className="text-[#2D6A4F]" /> Laporan Lingkungan &amp; Emisi Net-Zero
          </div>
          <h1 className="text-hero-display text-[#143628] mb-3">
            Dampak Terukur. Transparan.
          </h1>
          <p className="text-lead text-[#597367] font-normal mb-4">
            {esgConfig.missionStatement}
          </p>

          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-[#DCE5DB] bg-[#FFFFFF] hover:bg-[#EDF2EC] text-[#143628] transition-colors shadow-2xs cursor-pointer"
            >
              <Edit2 size={13} className="text-[#2D6A4F]" />
              <span>{isEditing ? 'Tutup Pengaturan' : 'Kelola Target ESG (Admin)'}</span>
            </button>
          )}
        </div>

        {/* Admin Edit ESG Panel */}
        {isAdmin && isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-apple-utility bg-[#FFFFFF] p-6 mb-8 border border-[#DCE5DB] shadow-xs"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCE5DB]/60">
              <h3 className="text-base font-semibold text-[#143628] m-0 flex items-center gap-2">
                <Target size={18} className="text-[#2D6A4F]" />
                <span>Pengaturan Target &amp; Komitmen ESG Nasional</span>
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FBEFEA] text-[#2D6A4F] font-bold border border-[#F2D7CD]">
                ADMIN ACCESS
              </span>
            </div>

            <form onSubmit={handleSaveEsg} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A4D43] uppercase tracking-wider mb-1">
                  Target Pangan Terselamatkan (kg)
                </label>
                <input
                  type="number"
                  min="100"
                  value={targetKg}
                  onChange={(e) => setTargetKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE5DB] bg-[#FAF7F2] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 text-sm text-[#143628]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D43] uppercase tracking-wider mb-1">
                  Target Reduksi Emisi CO₂e (kg)
                </label>
                <input
                  type="number"
                  min="100"
                  value={targetCO2}
                  onChange={(e) => setTargetCO2(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE5DB] bg-[#FAF7F2] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 text-sm text-[#143628]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D43] uppercase tracking-wider mb-1">
                  Target Distribusi Porsi
                </label>
                <input
                  type="number"
                  min="100"
                  value={targetPortions}
                  onChange={(e) => setTargetPortions(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE5DB] bg-[#FAF7F2] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 text-sm text-[#143628]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-[#5A4D43] uppercase tracking-wider mb-1">
                  Pernyataan Misi &amp; Komitmen Keberlanjutan
                </label>
                <textarea
                  rows={2}
                  value={missionStatement}
                  onChange={(e) => setMissionStatement(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE5DB] bg-[#FAF7F2] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/15 text-sm text-[#143628] resize-none"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-[#597367] hover:text-[#143628]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-apple-primary text-xs py-2 px-5 flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>Simpan Perubahan Target</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ESG Target Progress Bar */}
        <div className="card-apple-utility bg-[#FFFFFF] p-6 mb-8 border border-[#DCE5DB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#597367]">
                Pencapaian Target ESG AksesPangan
              </span>
              <h3 className="text-base font-semibold text-[#143628] m-0">
                {impact.totalKgSaved.toLocaleString('id-ID')} kg dari target {esgConfig.targetKg.toLocaleString('id-ID')} kg ({kgProgress}%)
              </h3>
            </div>
            <span className="text-xs text-[#597367] font-mono">
              Reduksi Emisi: {co2Progress}% dari target {esgConfig.targetCO2.toLocaleString('id-ID')} kg CO₂e
            </span>
          </div>

          <div className="w-full h-3 bg-[#FAF7F2] rounded-full overflow-hidden flex border border-[#DCE5DB]/60">
            <div
              className="h-full transition-all duration-1000 rounded-full"
              style={{
                width: `${kgProgress}%`,
                background: 'linear-gradient(90deg, #2D6A4F, #1E5E41)',
              }}
            />
          </div>
        </div>

        {/* 4 Core Metric Cards (Apple Store Utility Cards style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-apple-utility text-center p-6 bg-[#FFFFFF] border border-[#DCE5DB]">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-[#FBEFEA] text-[#2D6A4F] border border-[#F2D7CD]">
              <Package size={20} />
            </div>
            <div className="text-display-md font-semibold mb-0.5 text-[#143628]">
              {impact.totalKgSaved.toLocaleString('id-ID')} <span className="text-sm font-normal text-[#597367]">kg</span>
            </div>
            <div className="text-caption-apple text-[#597367]">Makanan Terselamatkan</div>
          </div>

          <div className="card-apple-utility text-center p-6 bg-[#FFFFFF] border border-[#DCE5DB]">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-[#FBEFEA] text-[#2D6A4F] border border-[#F2D7CD]">
              <Heart size={20} />
            </div>
            <div className="text-display-md font-semibold mb-0.5 text-[#143628]">
              {impact.totalPortions.toLocaleString('id-ID')} <span className="text-sm font-normal text-[#597367]">porsi</span>
            </div>
            <div className="text-caption-apple text-[#597367]">Porsi Terdistribusi</div>
          </div>

          <div className="card-apple-utility text-center p-6 bg-[#FFFFFF] border border-[#DCE5DB]">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-[#FBEFEA] text-[#2D6A4F] border border-[#F2D7CD]">
              <Leaf size={20} />
            </div>
            <div className="text-display-md font-semibold mb-0.5 text-[#143628]">
              {impact.totalCO2eSaved.toLocaleString('id-ID')} <span className="text-sm font-normal text-[#597367]">kg</span>
            </div>
            <div className="text-caption-apple text-[#597367]">Emisi CO₂e Dihindari</div>
          </div>

          <div className="card-apple-utility text-center p-6 bg-[#FFFFFF] border border-[#DCE5DB]">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-[#FBEFEA] text-[#2D6A4F] border border-[#F2D7CD]">
              <TreePine size={20} />
            </div>
            <div className="text-display-md font-semibold mb-0.5 text-[#143628]">
              {impact.treeEquivalent.toLocaleString('id-ID')} <span className="text-sm font-normal text-[#597367]">pohon</span>
            </div>
            <div className="text-caption-apple text-[#597367]">Setara Serapan Pohon</div>
          </div>
        </div>

        {/* Environmental Equivalencies (Apple Environment Tile) */}
        <div className="card-apple-utility bg-[#FFFFFF] p-8 mb-8 border border-[#DCE5DB]">
          <h3 className="text-tagline text-[#143628] mb-2">Konversi Dampak Ekologis Nyata</h3>
          <p className="text-caption-apple text-[#597367] mb-6">
            Berdasarkan metodologi Food and Agriculture Organization (FAO) dan IPCC emission factor.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB]/60">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFFFFF] text-[#2D6A4F] border border-[#DCE5DB] shadow-2xs flex-shrink-0">
                <TreePine size={20} />
              </div>
              <div>
                <div className="text-tagline font-semibold text-[#143628]">{impact.treeEquivalent} Pohon</div>
                <div className="text-caption-apple text-[#597367]">
                  Setara kapasitas penyerapan karbon oleh pohon dewasa selama satu tahun penuh.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB]/60">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFFFFF] text-[#2D6A4F] border border-[#DCE5DB] shadow-2xs flex-shrink-0">
                <Car size={20} />
              </div>
              <div>
                <div className="text-tagline font-semibold text-[#143628]">
                  {Math.round(impact.totalCO2eSaved * 4.7)} km
                </div>
                <div className="text-caption-apple text-[#597367]">
                  Setara jarak perjalanan mobil berbahan bakar fosil yang emisi knalpotnya ditiadakan.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-[14px] bg-[#FAF7F2] border border-[#DCE5DB]/60">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFFFFF] text-[#2D6A4F] border border-[#DCE5DB] shadow-2xs flex-shrink-0">
                <Droplets size={20} />
              </div>
              <div>
                <div className="text-tagline font-semibold text-[#143628]">
                  {(impact.totalKgSaved * 850).toLocaleString('id-ID')} Liter
                </div>
                <div className="text-caption-apple text-[#597367]">
                  Air bersih yang dihemat dari siklus produksi bahan baku pertanian pangan.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="card-apple-utility bg-[#FFFFFF] p-8 border border-[#DCE5DB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-tagline text-[#143628] mb-1">Tren Penyelamatan 7 Hari Terakhir</h3>
              <p className="text-caption-apple text-[#597367]">Kilogram makanan yang berhasil dialirkan setiap harinya</p>
            </div>
            <span className="badge-apple badge-apple-neutral text-xs mt-2 sm:mt-0 bg-[#FAF7F2] text-[#597367] border border-[#DCE5DB]">
              Sinkronisasi Otomatis
            </span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE5DB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#597367', fontSize: 12, fontFamily: 'var(--font-sf-pro)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#597367', fontSize: 12, fontFamily: 'var(--font-sf-pro)' }}
                />
                <Tooltip
                  cursor={{ fill: '#FAF7F2' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #DCE5DB',
                    boxShadow: '0 4px 12px rgba(44,34,29,0.06)',
                    fontFamily: 'var(--font-sf-pro)',
                    fontSize: '13px',
                    color: '#143628',
                  }}
                  formatter={(value: any) => [`${value} kg diselamatkan`, 'Makanan']}
                />
                <Bar dataKey="kgSaved" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

