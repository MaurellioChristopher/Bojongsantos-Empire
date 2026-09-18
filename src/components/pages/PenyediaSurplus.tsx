'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package, Edit, Trash2, Clock, MapPin, X, ArrowLeft, PackageOpen, Utensils } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getSurplusByProvider } from '@/lib/data';
import { surplusService } from '@/services/surplusService';
import { formatCountdown, formatPrice } from '@/lib/utils';
import { FOOD_CATEGORY_LABELS, FOOD_CATEGORY_EMOJI } from '@/types';
import type { SurplusItem, FoodCategory } from '@/types';

export function PenyediaSurplus() {
  const { user, login } = useAuth();
  const { success, error } = useNotification();
  const [items, setItems] = useState<SurplusItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<SurplusItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [portionCount, setPortionCount] = useState('');
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('nasi');
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
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FBF7F0]">
        <div className="w-16 h-16 rounded-full bg-[#FFFDF9] flex items-center justify-center text-[#2C221D] mb-4 border border-[#EADECF] shadow-sm">
          <Package size={32} />
        </div>
        <h2 className="text-display-md text-[#2C221D] mb-2">Akses Khusus Mitra Penyedia</h2>
        <p className="text-body-apple text-[#7D6F64] max-w-md mb-6">
          Halaman ini khusus untuk Mitra Penyedia untuk menambah dan mengelola stok makanan surplus.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => login('penyedia@aksespangan.id', 'penyedia123')}
            className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] text-sm py-2.5 px-5 rounded-xl font-medium shadow-sm transition-all"
          >
            Masuk Akun Demo Penyedia (1-Klik)
          </button>
          <a href="#/login" className="bg-[#F5EFEB] hover:bg-[#EADECF] text-[#2C221D] text-sm py-2.5 px-5 rounded-xl font-medium border border-[#EADECF] transition-colors">
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
    setIsFree(true);
    setPrice('');
    setExpiryHours('4');
    setAddress(user?.businessAddress || '');
    setEditItem(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: SurplusItem) => {
    setEditItem(item);
    setName(item.name);
    setDescription(item.description);
    setQuantity(item.quantity.toString());
    setPortionCount(item.portionCount.toString());
    setFoodCategory(item.foodCategory);
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
    <div className="min-h-screen bg-[#FBF7F0] py-8 px-4 sm:px-8">
      <div className="apple-container">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <a href="#/penyedia" className="text-[#D95327] hover:text-[#B8401A] text-xs mb-2 inline-flex items-center gap-1 font-semibold">
              <ArrowLeft size={14} /> Kembali ke Dashboard
            </a>
            <h1 className="text-display-lg text-[#2C221D]">Kelola Inventaris Surplus</h1>
            <p className="text-body-apple text-[#7D6F64] m-0">
              Daftar seluruh makanan berlebih yang Anda sediakan di platform.
            </p>
          </div>

          <button onClick={openAddForm} className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 self-start sm:self-auto shadow-sm transition-all">
            <Plus size={16} /> Tambah Makanan Baru
          </button>
        </div>

        {/* Modal Sheet for Add / Edit Surplus */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18110D]/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#FFFDF9] rounded-[22px] max-w-xl w-full p-6 sm:p-8 border border-[#EADECF] shadow-2xl max-h-[90vh] overflow-y-auto text-[#2C221D]"
              >
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#EADECF]">
                  <h3 className="text-tagline text-[#2C221D] font-bold">
                    {editItem ? 'Edit Informasi Surplus' : 'Unggah Makanan Surplus Baru'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#7D6F64] hover:text-[#2C221D]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Nama Makanan</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Nasi Kotak Ayam Bakar"
                      className="apple-input"
                    />
                  </div>

                  <div>
                    <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Kategori Makanan</label>
                    <select
                      value={foodCategory}
                      onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                      className="apple-input"
                    >
                      <option value="nasi">Nasi &amp; Lauk</option>
                      <option value="roti">Roti &amp; Pastry</option>
                      <option value="sayur">Sayur Mayur</option>
                      <option value="buah">Buah-Buahan</option>
                      <option value="minuman">Minuman</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Berat (kg)</label>
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
                      <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Estimasi Porsi</label>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Skema Harga</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsFree(true)}
                          className={`flex-1 py-2 rounded-[11px] text-xs font-semibold border transition-all ${
                            isFree ? 'bg-[#2C221D] text-[#FAF6F0] border-[#2C221D]' : 'bg-[#FAF7F2] text-[#2C221D] border-[#EADECF]'
                          }`}
                        >
                          Gratis (Donasi)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFree(false)}
                          className={`flex-1 py-2 rounded-[11px] text-xs font-semibold border transition-all ${
                            !isFree ? 'bg-[#2C221D] text-[#FAF6F0] border-[#2C221D]' : 'bg-[#FAF7F2] text-[#2C221D] border-[#EADECF]'
                          }`}
                        >
                          Berbayar
                        </button>
                      </div>
                    </div>

                    {!isFree && (
                      <div>
                        <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Harga per Porsi (Rp)</label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="5000"
                          className="apple-input"
                        />
                      </div>
                    )}

                    {isFree && (
                      <div>
                        <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Masa Aman (Jam)</label>
                        <select
                          value={expiryHours}
                          onChange={(e) => setExpiryHours(e.target.value)}
                          className="apple-input"
                        >
                          <option value="2">2 Jam</option>
                          <option value="4">4 Jam (Standar Suhu Ruang)</option>
                          <option value="6">6 Jam (Pendingin)</option>
                          <option value="12">12 Jam</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Lokasi Pengambilan</label>
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
                    <label className="block text-caption-strong text-[#2C221D] mb-1.5 font-semibold">Deskripsi & Catatan Alergen</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan kondisi makanan, kemasan, atau catatan alergi jika ada..."
                      className="apple-input h-auto py-2.5"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-[#EADECF]">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-[#F5EFEB] hover:bg-[#EADECF] text-[#2C221D] flex-1 text-sm py-2.5 rounded-xl border border-[#EADECF] transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] flex-1 text-sm py-2.5 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Publikasikan Surplus'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* List of Items */}
        {items.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-12 text-center shadow-xs">
            <PackageOpen size={40} className="text-[#A8988B] mx-auto mb-3" />
            <h3 className="text-tagline mb-1 text-[#2C221D]">Belum Ada Makanan yang Diunggah</h3>
            <p className="text-caption-apple text-[#7D6F64] mb-6">
              Mulai selamatkan makanan berlebih dari usaha Anda hari ini.
            </p>
            <button onClick={openAddForm} className="bg-[#2C221D] hover:bg-[#3F322B] text-[#FAF6F0] px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all inline-flex items-center gap-2">
              <Plus size={16} /> Tambah Surplus Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-[#FFFDF9] rounded-2xl border border-[#EADECF] p-6 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF7F2] border border-[#EADECF] rounded-[8px] uppercase tracking-wider text-[#7D6F64] font-mono">
                      {FOOD_CATEGORY_LABELS[item.foodCategory] || item.foodCategory}
                    </span>
                    <span className={`badge-apple ${
                      item.status === 'active' ? 'badge-apple-success' : 'badge-apple-neutral'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-body-strong text-[#2C221D] mb-1 line-clamp-1">{item.name}</h3>
                  <div className="text-caption-apple text-[#7D6F64] mb-2">{item.quantity} kg ({item.portionCount} porsi) • {item.isFree ? 'Gratis' : formatPrice(item.price)}</div>
                  <p className="text-caption-apple text-[#7D6F64] line-clamp-2 mb-4">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-[#EADECF] flex items-center justify-between">
                  <span className="text-fine-print text-[#7D6F64] flex items-center gap-1">
                    <Clock size={12} className="text-[#D95327]" />
                    <span>Sisa: {formatCountdown(item.expiryTime)}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-1.5 text-[#2C221D] hover:bg-[#F5EFEB] rounded-full transition-colors"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
