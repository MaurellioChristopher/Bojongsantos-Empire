'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Edit, Trash2, Clock, X, ArrowLeft, PackageOpen, Utensils, ShoppingBasket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getSurplusByProvider } from '@/lib/data';
import { surplusService } from '@/services/surplusService';
import { formatCountdown, formatPrice } from '@/lib/utils';
import { FOOD_CATEGORY_LABELS, FOOD_CATEGORY_EMOJI, getSurplusItemType } from '@/types';
import type { SurplusItem, FoodCategory, SurplusItemType } from '@/types';

export function PenyediaSurplus() {
  const { user, login } = useAuth();
  const { success, error } = useNotification();
  const [items, setItems] = useState<SurplusItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<SurplusItem | null>(null);
  const [activeTab, setActiveTab] = useState<SurplusItemType>('siap_santap');
  const [defaultItemType, setDefaultItemType] = useState<SurplusItemType>('siap_santap');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [portionCount, setPortionCount] = useState('');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('nasi');
  const [itemType, setItemType] = useState<SurplusItemType>('siap_santap');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [expiryHours, setExpiryHours] = useState('4');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshItems = async () => {
    if (!user) return;
    try {
      const res = await surplusService.getByProvider(user.id);
      setItems(res);
    } catch {
      setItems(getSurplusByProvider(user.id));
    }
  };

  useEffect(() => {
    refreshItems();
  }, [user]);

  if (!user || user.role !== 'penyedia') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#F7F9F6]">
        <div className="w-16 h-16 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#143628] mb-4 border border-[#DCE5DB] shadow-sm">
          <Package size={32} />
        </div>
        <h2 className="text-display-md text-[#143628] mb-2">Akses Khusus Mitra Penyedia</h2>
        <p className="text-body-apple text-[#597367] max-w-md mb-6">
          Halaman ini khusus untuk Mitra Penyedia untuk menambah dan mengelola stok makanan surplus.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => login('penyedia@aksespangan.id', 'penyedia123')}
            className="bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5] text-sm py-2.5 px-5 rounded-xl font-medium shadow-sm transition-all"
          >
            Masuk Akun Demo Penyedia (1-Klik)
          </button>
          <a href="#/login" className="bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] text-sm py-2.5 px-5 rounded-xl font-medium border border-[#DCE5DB] transition-colors">
            Masuk dengan Email
          </a>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setName('');
    setDescription('');
    setQuantity('');
    setPortionCount('');
    setFoodCategory('nasi');
    setItemType(defaultItemType);
    setIsFree(true);
    setPrice('');
    setExpiryHours('4');
    setAddress(user?.businessAddress || '');
    setEditItem(null);
  };

  const openAddForm = (type: SurplusItemType = activeTab) => {
    setDefaultItemType(type);
    setItemType(type);
    resetForm();
    // Set category default based on type
    if (type === 'bahan_baku') setFoodCategory('sayur');
    else setFoodCategory('nasi');
    setShowForm(true);
  };

  const openEditForm = (item: SurplusItem) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description);
    setQuantity(item.quantity.toString());
    setPortionCount(item.portionCount.toString());
    setFoodCategory(item.foodCategory);
    setItemType(getSurplusItemType(item));
    setIsFree(item.isFree);
    setPrice(item.price ? item.price.toString() : '');
    setAddress(item.address);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + parseInt(expiryHours) * 60 * 60 * 1000);

    const itemData = {
      name,
      description,
      quantity: parseFloat(quantity) || 1,
      portionCount: parseInt(portionCount) || 2,
      foodCategory,
      itemType,
      isFree,
      price: isFree ? 0 : parseInt(price) || 0,
      expiryTime: expiryDate.toISOString(),
      providerId: user.id,
      providerName: user.name,
      providerBusinessName: user.businessName || user.name,
      location: user.location || { lat: -6.2088, lng: 106.8456 },
      address,
      status: 'active' as const,
      photo: '',
      productionTime: new Date().toISOString(),
      lat: user.location?.lat || -6.2088,
      lng: user.location?.lng || 106.8456,
    };

    try {
      if (editItem) {
        await surplusService.update(editItem.id, itemData);
        success('Berhasil Diperbarui', `${name} telah diperbarui`);
      } else {
        await surplusService.create(itemData);
        success('Surplus Ditambahkan', `${name} berhasil dipublikasikan ke peta`);
      }
      setShowForm(false);
      resetForm();
      refreshItems();
    } catch (err: any) {
      error('Gagal Menyimpan', err.message || 'Gagal menyimpan surplus makanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!confirm(`Yakin ingin menghapus ${itemName}?`)) return;
    try {
      await surplusService.delete(id);
      success('Surplus Dihapus', `${itemName} telah dihapus dari katalog`);
      refreshItems();
    } catch (err: any) {
      error('Gagal Menghapus', err.message || 'Gagal menghapus surplus');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <a href="#/penyedia" className="text-[#2D6A4F] hover:text-[#B8401A] text-xs mb-2 inline-flex items-center gap-1 font-semibold">
              <ArrowLeft size={14} /> Kembali ke Dashboard
            </a>
            <h1 className="text-display-lg text-[#143628]">Kelola Inventaris Surplus</h1>
            <p className="text-body-apple text-[#597367] m-0">
              Kelola stok <strong>Sisa Makanan</strong> dan <strong>Bahan Baku</strong> secara terpisah.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-[#EDF2EC] p-1 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('siap_santap')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'siap_santap'
                ? 'bg-[#143628] text-[#F3F8F5] shadow-sm'
                : 'text-[#597367] hover:text-[#143628]'
            }`}
          >
            <Utensils size={15} />
            Sisa Makanan
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'siap_santap' ? 'bg-white/20 text-[#F3F8F5]' : 'bg-[#DCE5DB] text-[#597367]'
            }`}>
              {items.filter(i => getSurplusItemType(i) === 'siap_santap').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('bahan_baku')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'bahan_baku'
                ? 'bg-[#A45E2A] text-[#FFF8F2] shadow-sm'
                : 'text-[#597367] hover:text-[#143628]'
            }`}
          >
            <ShoppingBasket size={15} />
            Bahan Baku
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              activeTab === 'bahan_baku' ? 'bg-white/20 text-[#FFF8F2]' : 'bg-[#DCE5DB] text-[#597367]'
            }`}>
              {items.filter(i => getSurplusItemType(i) === 'bahan_baku').length}
            </span>
          </button>
        </div>

        {/* Tab Panel Header with Add Button */}
        <div className="flex items-center justify-between mb-5">
          {activeTab === 'siap_santap' ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8F4EE] flex items-center justify-center">
                <Utensils size={16} className="text-[#2D6A4F]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#143628] leading-none">Sisa Makanan Matang</p>
                <p className="text-xs text-[#597367] mt-0.5">Makanan siap santap yang masih layak dikonsumsi</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FBF0E6] flex items-center justify-center">
                <ShoppingBasket size={16} className="text-[#A45E2A]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#2C1810] leading-none">Bahan Baku Mentah / Segar</p>
                <p className="text-xs text-[#7A5842] mt-0.5">Sayuran, buah, dan bahan mentah siap olah</p>
              </div>
            </div>
          )}
          <button
            onClick={() => openAddForm(activeTab)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-all ${
              activeTab === 'siap_santap'
                ? 'bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5]'
                : 'bg-[#A45E2A] hover:bg-[#8B4E22] text-[#FFF8F2]'
            }`}
          >
            <Plus size={16} />
            {activeTab === 'siap_santap' ? 'Tambah Sisa Makanan' : 'Tambah Bahan Baku'}
          </button>
        </div>

        {/* Modal Sheet for Add / Edit Surplus */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C2017]/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFFFF] rounded-[22px] max-w-xl w-full p-6 sm:p-8 border border-[#DCE5DB] shadow-2xl max-h-[90vh] overflow-y-auto text-[#143628]"
              >
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#DCE5DB]">
                  <div>
                    <h3 className="text-tagline text-[#143628] font-bold">
                      {editItem ? 'Edit Informasi Surplus' : 'Unggah Makanan Surplus Baru'}
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      itemType === 'siap_santap'
                        ? 'bg-[#E8F4EE] text-[#2D6A4F]'
                        : 'bg-[#FBF0E6] text-[#A45E2A]'
                    }`}>
                      {itemType === 'siap_santap' ? '🍽 Sisa Makanan' : '🧺 Bahan Baku'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-full bg-[#EDF2EC] flex items-center justify-center text-[#597367] hover:text-[#143628]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Tipe Item Toggle */}
                  <div>
                    <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Jenis Item</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setItemType('siap_santap')}
                        className={`flex-1 py-2 rounded-[11px] text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                          itemType === 'siap_santap' ? 'bg-[#143628] text-[#F3F8F5] border-[#143628]' : 'bg-[#FAF7F2] text-[#143628] border-[#DCE5DB]'
                        }`}
                      >
                        <Utensils size={12} /> Sisa Makanan
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemType('bahan_baku')}
                        className={`flex-1 py-2 rounded-[11px] text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                          itemType === 'bahan_baku' ? 'bg-[#A45E2A] text-[#FFF8F2] border-[#A45E2A]' : 'bg-[#FAF7F2] text-[#143628] border-[#DCE5DB]'
                        }`}
                      >
                        <ShoppingBasket size={12} /> Bahan Baku
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Nama {itemType === 'siap_santap' ? 'Makanan' : 'Bahan'}</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={itemType === 'siap_santap' ? 'Contoh: Nasi Kotak Ayam Bakar' : 'Contoh: Wortel Organik Segar'}
                      className="apple-input"
                    />
                  </div>

                  <div>
                    <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Kategori</label>
                    <select
                      value={foodCategory}
                      onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                      className="apple-input"
                    >
                      {itemType === 'siap_santap' ? (
                        <>
                          <option value="nasi">🍚 Nasi &amp; Karbohidrat</option>
                          <option value="lauk">🍗 Lauk Pauk</option>
                          <option value="roti">🍞 Roti &amp; Pastry</option>
                          <option value="kue">🍰 Kue &amp; Snack</option>
                          <option value="minuman">🥤 Minuman</option>
                          <option value="lainnya">📦 Lainnya</option>
                        </>
                      ) : (
                        <>
                          <option value="sayur">🥗 Sayur &amp; Salad</option>
                          <option value="buah">🍎 Buah-buahan</option>
                          <option value="lainnya">📦 Bahan Lainnya</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Berat (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Contoh: 5"
                        className="apple-input"
                      />
                    </div>
                    <div>
                      <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">
                        {itemType === 'siap_santap' ? 'Estimasi Porsi' : 'Estimasi Paket'}
                      </label>
                      <input
                        type="number"
                        required
                        value={portionCount}
                        onChange={(e) => setPortionCount(e.target.value)}
                        placeholder="Contoh: 10"
                        className="apple-input"
                      />
                    </div>
                  </div>

                  {/* Skema Harga */}
                  <div>
                    <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Skema Harga</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsFree(true)}
                        className={`flex-1 py-2 rounded-[11px] text-xs font-semibold border transition-all ${
                          isFree ? 'bg-[#143628] text-[#F3F8F5] border-[#143628]' : 'bg-[#FAF7F2] text-[#143628] border-[#DCE5DB]'
                        }`}
                      >
                        Gratis
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFree(false)}
                        className={`flex-1 py-2 rounded-[11px] text-xs font-semibold border transition-all ${
                          !isFree ? 'bg-[#143628] text-[#F3F8F5] border-[#143628]' : 'bg-[#FAF7F2] text-[#143628] border-[#DCE5DB]'
                        }`}
                      >
                        Berbayar
                      </button>
                    </div>
                  </div>

                  {/* Harga — only when paid */}
                  {!isFree && (
                    <div>
                      <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Harga per Porsi (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="5000"
                        className="apple-input"
                      />
                    </div>
                  )}

                  {/* Masa Aman — always shown */}
                  <div>
                    <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Masa Aman (Jam)</label>
                    <select
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(e.target.value)}
                      className="apple-input"
                    >
                      <option value="2">2 Jam</option>
                      <option value="4">4 Jam (Standar Suhu Ruang)</option>
                      <option value="6">6 Jam (Pendingin)</option>
                      <option value="12">12 Jam</option>
                      <option value="24">24 Jam (Bahan Segar)</option>
                      <option value="48">48 Jam (Bahan Tahan Lama)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Lokasi Pengambilan</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Alamat restoran / dapur Anda"
                      className="apple-input"
                    />
                  </div>

                  <div>
                    <label className="block text-caption-strong text-[#143628] mb-1.5 font-semibold">Deskripsi &amp; Catatan Alergen</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan kondisi, kemasan, atau catatan alergi jika ada..."
                      className="apple-input h-auto py-2.5"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#DCE5DB]">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] flex-1 text-sm py-2.5 rounded-xl border border-[#DCE5DB] transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 text-sm py-2.5 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 ${
                        itemType === 'siap_santap'
                          ? 'bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5]'
                          : 'bg-[#A45E2A] hover:bg-[#8B4E22] text-[#FFF8F2]'
                      }`}
                    >
                      {isSubmitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Publikasikan Surplus'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tab Content - List of Items filtered by type */}
        {(() => {
          const filtered = items.filter(i => getSurplusItemType(i) === activeTab);
          const isSiapSantap = activeTab === 'siap_santap';

          if (filtered.length === 0) {
            return (
              <div className={`rounded-2xl border p-12 text-center shadow-xs ${
                isSiapSantap ? 'bg-[#FFFFFF] border-[#DCE5DB]' : 'bg-[#FFFBF7] border-[#E8D5C4]'
              }`}>
                {isSiapSantap
                  ? <PackageOpen size={40} className="text-[#A8C8B0] mx-auto mb-3" />
                  : <ShoppingBasket size={40} className="text-[#C8A880] mx-auto mb-3" />
                }
                <h3 className={`text-tagline mb-1 ${isSiapSantap ? 'text-[#143628]' : 'text-[#2C1810]'}`}>
                  Belum Ada {isSiapSantap ? 'Sisa Makanan' : 'Bahan Baku'} yang Diunggah
                </h3>
                <p className={`text-caption-apple mb-6 ${isSiapSantap ? 'text-[#597367]' : 'text-[#7A5842]'}`}>
                  {isSiapSantap
                    ? 'Mulai selamatkan makanan matang berlebih dari usaha Anda hari ini.'
                    : 'Unggah bahan baku segar atau mentah yang belum terpakai dari dapur Anda.'}
                </p>
                <button
                  onClick={() => openAddForm(activeTab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all inline-flex items-center gap-2 ${
                    isSiapSantap
                      ? 'bg-[#143628] hover:bg-[#1C4736] text-[#F3F8F5]'
                      : 'bg-[#A45E2A] hover:bg-[#8B4E22] text-[#FFF8F2]'
                  }`}
                >
                  <Plus size={16} />
                  {isSiapSantap ? 'Tambah Sisa Makanan' : 'Tambah Bahan Baku'}
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-5 flex flex-col justify-between shadow-xs ${
                    isSiapSantap
                      ? 'bg-[#FFFFFF] border-[#DCE5DB]'
                      : 'bg-[#FFFBF7] border-[#E8D5C4]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-[8px] uppercase tracking-wider font-mono flex items-center gap-1 ${
                        isSiapSantap
                          ? 'bg-[#EDF2EC] border border-[#DCE5DB] text-[#2D6A4F]'
                          : 'bg-[#FBF0E6] border border-[#E8D5C4] text-[#A45E2A]'
                      }`}>
                        {FOOD_CATEGORY_EMOJI[item.foodCategory]}
                        {FOOD_CATEGORY_LABELS[item.foodCategory] || item.foodCategory}
                      </span>
                      <span className={`badge-apple ${
                        item.status === 'active' ? 'badge-apple-success' : 'badge-apple-neutral'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className={`text-body-strong mb-1 line-clamp-1 ${isSiapSantap ? 'text-[#143628]' : 'text-[#2C1810]'}`}>
                      {item.name}
                    </h3>
                    <div className={`text-caption-apple mb-2 ${isSiapSantap ? 'text-[#597367]' : 'text-[#7A5842]'}`}>
                      {item.quantity} kg • {item.portionCount} {isSiapSantap ? 'porsi' : 'paket'} • {item.isFree ? 'Gratis' : formatPrice(item.price)}
                    </div>
                    <p className={`text-caption-apple line-clamp-2 mb-4 ${isSiapSantap ? 'text-[#597367]' : 'text-[#7A5842]'}`}>
                      {item.description}
                    </p>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between ${
                    isSiapSantap ? 'border-[#DCE5DB]' : 'border-[#E8D5C4]'
                  }`}>
                    <span className={`text-fine-print flex items-center gap-1 ${isSiapSantap ? 'text-[#597367]' : 'text-[#7A5842]'}`}>
                      <Clock size={12} className={isSiapSantap ? 'text-[#2D6A4F]' : 'text-[#A45E2A]'} />
                      <span>Sisa: {formatCountdown(item.expiryTime)}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(item)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isSiapSantap ? 'text-[#143628] hover:bg-[#EDF2EC]' : 'text-[#2C1810] hover:bg-[#FBF0E6]'
                        }`}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
