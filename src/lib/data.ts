// ============================================================
// AksesPangan — Data Layer (localStorage CRUD + Seed Data)
// ============================================================

import type {
  User,
  UserRole,
  SurplusItem,
  Booking,
  Notification,
  ImpactData,
  ImpactTimeline,
  BookingStatus,
  ChatMessage,
  AdminComplaint,
  QualityStandardItem,
  EsgConfig,
  FoodHeroBadge,
} from '@/types';
import { STORAGE_KEYS, CO2E_FACTOR, TREE_CO2_ABSORPTION } from './constants';
import { generateId, hoursFromNow } from './utils';

// ============================================================
// Generic localStorage helpers
// ============================================================

function getStore<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ============================================================
// Users
// ============================================================

export function getUsers(): User[] {
  return getStore<User>(STORAGE_KEYS.users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email === email);
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setStore(STORAGE_KEYS.users, users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  setStore(STORAGE_KEYS.users, users);
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  setStore(STORAGE_KEYS.users, filtered);
  return true;
}

// ============================================================
// Current Session
// ============================================================

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
  return raw ? JSON.parse(raw) : null;
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

export function login(
  email: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  const user = getUserByEmail(email);
  if (!user) return { success: false, error: 'Email tidak ditemukan' };
  if (user.password !== password) return { success: false, error: 'Password salah' };
  setCurrentUser(user);
  return { success: true, user };
}

export function logout(): void {
  setCurrentUser(null);
}

// ============================================================
// Surplus Items
// ============================================================

export function getBandungSeedItems(): SurplusItem[] {
  return [
    {
      id: 'surplus-bdg-1',
      providerId: 'penyedia-bdg-1',
      providerName: 'Siti Rohani',
      providerBusinessName: 'Dapur Sunda Bojongsoang',
      name: 'Nasi Liwet Komplit Ayam Bakar',
      description: 'Nasi liwet wangi kasturi, ayam bakar bumbu rujak, tahu tempe goreng, lalapan segar dan sambal terasi khas priangan.',
      photo: '/images/surplus-nasi-liwet.jpg',
      quantity: 6,
      portionCount: 15,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9712, lng: 107.6335 },
      address: 'Jl. Raya Bojongsoang No. 65, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-2',
      providerId: 'penyedia-bdg-2',
      providerName: 'Ahmad Dahlan',
      providerBusinessName: 'RM Minang Raya Buahbatu',
      name: 'Nasi Padang Rendang & Gulai Ayam',
      description: 'Paket nasi padang lengkap lauk rendang sapi empuk, gulai ayam, sayur nangka, dan sambal hijau segar.',
      photo: '/images/surplus-nasi-padang.jpg',
      quantity: 5,
      portionCount: 12,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9530, lng: 107.6320 },
      address: 'Jl. Buahbatu No. 182, Buahbatu, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-3',
      providerId: 'penyedia-bdg-3',
      providerName: 'Dian Permata',
      providerBusinessName: 'Katering Mitra Batununggal',
      name: 'Nasi Bento Katering Seminar',
      description: 'Nasi bento higienis isi ayam teriyaki, egg roll, salad mayones, dan nasi pulen sisa pesanan seminar.',
      photo: '/images/surplus-nasi-bento.jpg',
      quantity: 4,
      portionCount: 10,
      productionTime: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(6),
      status: 'active',
      price: 8000,
      isFree: false,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9580, lng: 107.6340 },
      address: 'Jl. Batununggal Indah No. 12, Batununggal',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-4',
      providerId: 'penyedia-bdg-4',
      providerName: 'Kang Cecep',
      providerBusinessName: 'Dapur Lengkong Tradisional',
      name: 'Paket Nasi Timbel Komplit',
      description: 'Nasi timbel daun pisang, ayam goreng lengkuas, gepuk daging sapi, tahu tempe dan sambal dadak.',
      photo: '/images/surplus-nasi-timbel.jpg',
      quantity: 7,
      portionCount: 18,
      productionTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(3.5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9385, lng: 107.6210 },
      address: 'Jl. Lengkong Besar No. 40, Lengkong',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-5',
      providerId: 'penyedia-bdg-5',
      providerName: 'Habib Umar',
      providerBusinessName: 'Resto Timur Tengah Dayeuhkolot',
      name: 'Nasi Kebuli Daging Kambing',
      description: 'Nasi kebuli rempah arabian dengan potongan daging kambing empuk, acar nanas, dan kerupuk emping.',
      photo: '/images/surplus-nasi-kebuli.jpg',
      quantity: 5,
      portionCount: 14,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5),
      status: 'active',
      price: 10000,
      isFree: false,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9830, lng: 107.6245 },
      address: 'Jl. Raya Dayeuhkolot No. 88, Dayeuhkolot',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-6',
      providerId: 'penyedia-bdg-6',
      providerName: 'Jeanne Marie',
      providerBusinessName: 'Artisan Bakery Buahbatu',
      name: 'Aneka Roti Manis & Butter Croissant',
      description: 'Croissant mentega Perancis, roti sobek cokelat, danish buah berry. Dipanggang pagi ini, masih renyah.',
      photo: '/images/surplus-bakery.jpg',
      quantity: 3,
      portionCount: 15,
      productionTime: new Date(Date.now() - 5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(7),
      status: 'active',
      price: 5000,
      isFree: false,
      foodCategory: 'roti',
      itemType: 'siap_santap',
      location: { lat: -6.9460, lng: 107.6290 },
      address: 'Jl. Buahbatu No. 90, Buahbatu, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-7',
      providerId: 'penyedia-bdg-7',
      providerName: 'Ratna Sari',
      providerBusinessName: 'Bakery Sourdough Bojongsoang',
      name: 'Roti Sourdough & Baguette Organik',
      description: 'Artisan rustic sourdough loaf dan baguette gandum organik tanpa pengawet. Sangat bergizi.',
      photo: '/images/surplus-sourdough.jpg',
      quantity: 3,
      portionCount: 10,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(8),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'roti',
      itemType: 'siap_santap',
      location: { lat: -6.9685, lng: 107.6360 },
      address: 'Jl. Raya Bojongsoang No. 112, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-8',
      providerId: 'penyedia-bdg-8',
      providerName: 'Hendra Gunawan',
      providerBusinessName: 'Resto Sehat Alami Batununggal',
      name: 'Capcay Seafood & Tahu Organik',
      description: 'Capcay sayur kuah kental dengan udang, bakso ikan, brokoli, wortel manis, dan tahu sutra organik.',
      photo: '/images/surplus-capcay.jpg',
      quantity: 4,
      portionCount: 12,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4.5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'sayur',
      itemType: 'siap_santap',
      location: { lat: -6.9560, lng: 107.6280 },
      address: 'Jl. Batununggal Indah IV No. 18, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-9',
      providerId: 'penyedia-bdg-9',
      providerName: 'Pak Dedi',
      providerBusinessName: 'Kios Sayur Mitra Ciganitri',
      name: 'Paket Sayuran Segar Lembang',
      description: 'Buncis, wortel organik, sawi putih, dan tomat merah segar panenan kebun mitra Lembang.',
      photo: '/images/surplus-produce.jpg',
      quantity: 6,
      portionCount: 16,
      productionTime: new Date(Date.now() - 6 * 3600000).toISOString(),
      expiryTime: hoursFromNow(6),
      status: 'active',
      price: 4000,
      isFree: false,
      foodCategory: 'sayur',
      itemType: 'bahan_baku',
      location: { lat: -6.9765, lng: 107.6405 },
      address: 'Jl. Ciganitri No. 25, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-10',
      providerId: 'penyedia-bdg-10',
      providerName: 'Ibu Ningsih',
      providerBusinessName: 'Kios Buah Berkah Bojongsoang',
      name: 'Semangka & Melon Potong Higienis',
      description: 'Semangka merah tanpa biji dan melon madu manis potongan segar dalam kotak food-grade tertutup.',
      photo: '/images/surplus-buah-potong.jpg',
      quantity: 5,
      portionCount: 15,
      productionTime: new Date(Date.now() - 1 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5.5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'buah',
      itemType: 'bahan_baku',
      location: { lat: -6.9730, lng: 107.6310 },
      address: 'Jl. Raya Bojongsoang No. 34, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-11',
      providerId: 'penyedia-bdg-11',
      providerName: 'Kopi Seduh Team',
      providerBusinessName: 'Kafe Kopi Seduh Lengkong',
      name: 'Cold Brew Botanical Tea & Coffee',
      description: 'Cold brew tea melati dan kopi cold brew arabika single origin dalam botol kaca 350ml steril.',
      photo: '/images/surplus-beverage.jpg',
      quantity: 3,
      portionCount: 8,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(9),
      status: 'active',
      price: 5000,
      isFree: false,
      foodCategory: 'minuman',
      itemType: 'siap_santap',
      location: { lat: -6.9340, lng: 107.6190 },
      address: 'Jl. Lengkong Kecil No. 22, Lengkong, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-12',
      providerId: 'penyedia-bdg-12',
      providerName: 'Ibu Eni',
      providerBusinessName: 'Kedai Segar Bojongsoang',
      name: 'Jus Jeruk Peras & Alpukat Murni',
      description: 'Jus jeruk peras murni tanpa gula pasir dan jus alpukat mentega segar dingin kemasan botol.',
      photo: '/images/surplus-juice.jpg',
      quantity: 3,
      portionCount: 10,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'minuman',
      itemType: 'siap_santap',
      location: { lat: -6.9695, lng: 107.6350 },
      address: 'Jl. Raya Bojongsoang No. 78, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-13',
      providerId: 'penyedia-bdg-9',
      providerName: 'Pak Dedi',
      providerBusinessName: 'Kios Sayur Mitra Ciganitri',
      name: 'Paket Bahan Dapur: Kentang, Bawang & Wortel Dieng',
      description: 'Kentang Dieng, bawang merah segar, dan wortel manis curah segar kualitas baik layak olah dari kios pasar tani.',
      photo: '/images/surplus-produce.jpg',
      quantity: 8,
      portionCount: 20,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(12),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'sayur',
      itemType: 'bahan_baku',
      location: { lat: -6.9750, lng: 107.6390 },
      address: 'Jl. Ciganitri No. 40, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-14',
      providerId: 'penyedia-bdg-10',
      providerName: 'Ibu Ningsih',
      providerBusinessName: 'Kios Buah Berkah Bojongsoang',
      name: 'Pisang Cavendish & Jeruk Manis Segar',
      description: 'Pisang cavendish matang pas dan jeruk manis segar sisa display supermarket, kaya serat dan vitamin.',
      photo: '/images/surplus-buah-potong.jpg',
      quantity: 6,
      portionCount: 18,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(10),
      status: 'active',
      price: 5000,
      isFree: false,
      foodCategory: 'buah',
      itemType: 'bahan_baku',
      location: { lat: -6.9720, lng: 107.6325 },
      address: 'Jl. Sukabirus No. 15, Dayeuhkolot',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-15',
      providerId: 'penyedia-bdg-11',
      providerName: 'Pak Agus',
      providerBusinessName: 'Tani Mitra Cangkuang',
      name: 'Beras Merah Organik Cianjur',
      description: 'Beras merah varietas organik panenan petani mitra Cianjur, bebas pestisida, kaya serat dan mineral. Dijual curah per kg.',
      photo: '/images/surplus-produce.jpg',
      quantity: 10,
      portionCount: 25,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(48),
      status: 'active',
      price: 12000,
      isFree: false,
      foodCategory: 'lainnya',
      itemType: 'bahan_baku',
      location: { lat: -6.9650, lng: 107.6420 },
      address: 'Jl. Cangkuang No. 8, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-16',
      providerId: 'penyedia-bdg-12',
      providerName: 'Ibu Tini',
      providerBusinessName: 'Warung Tempe & Tahu Sari Murni',
      name: 'Tempe & Tahu Organik Segar',
      description: 'Tempe kedelai lokal fermentasi 24 jam, padat dan harum. Tahu putih press keras siap goreng. Produksi pagi ini dari pengrajin mitra.',
      photo: '/images/surplus-produce.jpg',
      quantity: 5,
      portionCount: 20,
      productionTime: new Date(Date.now() - 1 * 3600000).toISOString(),
      expiryTime: hoursFromNow(12),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'lainnya',
      itemType: 'bahan_baku',
      location: { lat: -6.9590, lng: 107.6300 },
      address: 'Jl. Batununggal Raya No. 5, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-17',
      providerId: 'penyedia-bdg-9',
      providerName: 'Pak Dedi',
      providerBusinessName: 'Kios Sayur Mitra Ciganitri',
      name: 'Cabai Merah Keriting & Cabai Rawit Segar',
      description: 'Cabai merah keriting dan cabai rawit merah segar panenan dari mitra petani. Merah segar, pedas alami, bebas bahan kimia.',
      photo: '/images/surplus-produce.jpg',
      quantity: 3,
      portionCount: 12,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(24),
      status: 'active',
      price: 8000,
      isFree: false,
      foodCategory: 'sayur',
      itemType: 'bahan_baku',
      location: { lat: -6.9770, lng: 107.6410 },
      address: 'Jl. Ciganitri No. 30, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-18',
      providerId: 'penyedia-bdg-10',
      providerName: 'Ibu Ningsih',
      providerBusinessName: 'Kios Buah Berkah Bojongsoang',
      name: 'Mangga Harum Manis & Alpukat Mentega',
      description: 'Mangga harum manis matang sempurna dan alpukat mentega besar dari kebun mitra lokal. Manis, creamy, siap konsumsi atau olah menjadi jus.',
      photo: '/images/surplus-buah-potong.jpg',
      quantity: 7,
      portionCount: 22,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(18),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'buah',
      itemType: 'bahan_baku',
      location: { lat: -6.9735, lng: 107.6315 },
      address: 'Jl. Raya Bojongsoang No. 42, Bojongsoang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-19',
      providerId: 'penyedia-bdg-13',
      providerName: 'Pak Herman',
      providerBusinessName: 'Toko Sumber Alam Dayeuhkolot',
      name: 'Telur Ayam Kampung Organik',
      description: 'Telur ayam kampung omega-3 dari peternakan mitra organik Pangalengan. Ukuran sedang, kuning telur oranye pekat kaya gizi.',
      photo: '/images/surplus-produce.jpg',
      quantity: 4,
      portionCount: 15,
      productionTime: new Date(Date.now() - 5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(36),
      status: 'active',
      price: 3500,
      isFree: false,
      foodCategory: 'lainnya',
      itemType: 'bahan_baku',
      location: { lat: -6.9840, lng: 107.6250 },
      address: 'Jl. Dayeuhkolot No. 55, Dayeuhkolot',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-bdg-20',
      providerId: 'penyedia-bdg-14',
      providerName: 'Bu Lastri',
      providerBusinessName: 'Pasar Tani Mitra Lengkong',
      name: 'Jahe, Kunyit & Temulawak Segar',
      description: 'Rempah segar langsung dari petani: jahe gajah besar, kunyit kuning pekat, dan temulawak pilihan. Cocok untuk olahan herbal dan masakan.',
      photo: '/images/surplus-produce.jpg',
      quantity: 4,
      portionCount: 16,
      productionTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(48),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'sayur',
      itemType: 'bahan_baku',
      location: { lat: -6.9360, lng: 107.6200 },
      address: 'Jl. Lengkong Kecil No. 38, Lengkong, Bandung',
      createdAt: new Date().toISOString(),
    },
    // --- Additional Items Across West Java & Jabodetabek Corridor to Fill Map ---
    {
      id: 'surplus-map-15',
      providerId: 'penyedia-bdg-15',
      providerName: 'Chef Andre',
      providerBusinessName: 'Dago Artisan Pastry & Cafe',
      name: 'Pastry & Butter Danish Berry Dago',
      description: 'Danish berry renyah, croissant almond, dan pain au chocolat segar baru dipanggang dari kafe Dago atas.',
      photo: '/images/surplus-bakery.jpg',
      quantity: 4,
      portionCount: 14,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(6),
      status: 'active',
      price: 6000,
      isFree: false,
      foodCategory: 'roti',
      itemType: 'siap_santap',
      location: { lat: -6.8850, lng: 107.6150 },
      address: 'Jl. Ir. H. Juanda No. 108, Dago, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-16',
      providerId: 'penyedia-bdg-16',
      providerName: 'Mang Aep',
      providerBusinessName: 'Saung Sunda Dago Atas',
      name: 'Nasi Liwet Sunda Ayam Serundeng Dago',
      description: 'Nasi liwet wangi daun salam, ayam goreng serundeng rempah, sambal goang pedas, tahu tempe dan lalap petai.',
      photo: '/images/surplus-nasi-liwet.jpg',
      quantity: 6,
      portionCount: 16,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4.5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.8680, lng: 107.6220 },
      address: 'Jl. Dago Pakar Timur No. 19, Ciburial, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-17',
      providerId: 'penyedia-bdg-17',
      providerName: 'Ko Ahok',
      providerBusinessName: 'Resto Oriental Sukajadi',
      name: 'Capcay Kuah Kental & Tahu Sutra Sukajadi',
      description: 'Capcay aneka sayur segar kuah kental gurih, irisan bakso sapi, udang, dan tahu sutra goreng lembut.',
      photo: '/images/surplus-capcay.jpg',
      quantity: 5,
      portionCount: 15,
      productionTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'sayur',
      itemType: 'siap_santap',
      location: { lat: -6.8830, lng: 107.5950 },
      address: 'Jl. Sukajadi No. 142, Sukajadi, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-18',
      providerId: 'penyedia-bdg-18',
      providerName: 'Maya Citra',
      providerBusinessName: 'Bento Bistro Riau',
      name: 'Nasi Bento Chicken Katsu Teriyaki Riau',
      description: 'Bento box higienis berisi nasi jepang pulen, chicken katsu krispi, saus teriyaki gurih, dan salad selada wijen.',
      photo: '/images/surplus-nasi-bento.jpg',
      quantity: 5,
      portionCount: 12,
      productionTime: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5.5),
      status: 'active',
      price: 10000,
      isFree: false,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9090, lng: 107.6250 },
      address: 'Jl. L.L.R.E. Martadinata (Riau) No. 76, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-19',
      providerId: 'penyedia-bdg-19',
      providerName: 'Kang Ridwan',
      providerBusinessName: 'Kedai Jus Tropis Antapani',
      name: 'Smoothies & Jus Mangga Harum Manis Antapani',
      description: 'Jus mangga harum manis dingin murni tanpa pemanis buatan dan smoothies pisang naga segar kemasan botol food-grade.',
      photo: '/images/surplus-juice.jpg',
      quantity: 4,
      portionCount: 10,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(6),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'minuman',
      itemType: 'siap_santap',
      location: { lat: -6.9180, lng: 107.6620 },
      address: 'Jl. Purwakarta No. 54, Antapani, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-20',
      providerId: 'penyedia-bdg-20',
      providerName: 'Pak Nandang',
      providerBusinessName: 'Tani Makmur Mandiri Cibiru',
      name: 'Paket Sayuran Segar Kebun Cibiru',
      description: 'Paket sawi hijau, labu siam manis, kol renyah, dan cabai merah keriting hasil panen kebun hidroponik Cibiru.',
      photo: '/images/surplus-produce.jpg',
      quantity: 8,
      portionCount: 20,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(10),
      status: 'active',
      price: 3000,
      isFree: false,
      foodCategory: 'sayur',
      itemType: 'bahan_baku',
      location: { lat: -6.9240, lng: 107.7120 },
      address: 'Jl. Raya Cibiru No. 89, Cibiru, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-21',
      providerId: 'penyedia-bdg-21',
      providerName: 'Teh Elis',
      providerBusinessName: 'Warung Berkah Jatinangor',
      name: 'Paket Nasi Timbel Ayam Geprek Jatinangor',
      description: 'Nasi timbel pulen daun pisang, ayam geprek pedas sambal korek, tahu tempe goreng, sisa porsi katering kampus.',
      photo: '/images/surplus-nasi-timbel.jpg',
      quantity: 7,
      portionCount: 18,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9310, lng: 107.7740 },
      address: 'Jl. Raya Jatinangor No. 120, Jatinangor, Sumedang',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-22',
      providerId: 'penyedia-bdg-22',
      providerName: 'Ibu Kencana',
      providerBusinessName: 'Bakery Kencana Cimahi',
      name: 'Roti Sobek Cokelat & Croissant Keju Cimahi',
      description: 'Roti sobek lembut isi cokelat lumer, roti abon sapi, dan croissant keju gurih buatan toko roti legendaris Cimahi.',
      photo: '/images/surplus-bakery.jpg',
      quantity: 4,
      portionCount: 15,
      productionTime: new Date(Date.now() - 5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(7),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'roti',
      itemType: 'siap_santap',
      location: { lat: -6.8840, lng: 107.5410 },
      address: 'Jl. Gandawijaya No. 62, Cimahi Tengah, Cimahi',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-23',
      providerId: 'penyedia-bdg-23',
      providerName: 'Bu Enung',
      providerBusinessName: 'Dapur Selera Kopo',
      name: 'Nasi Kuning Komplit Daging Balado Kopo',
      description: 'Nasi kuning rempah gurih, daging sapi balado, orek tempe manis, telur dadar iris, dan kerupuk renyah.',
      photo: '/images/surplus-nasi-padang.jpg',
      quantity: 6,
      portionCount: 14,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4),
      status: 'active',
      price: 8000,
      isFree: false,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.9550, lng: 107.5810 },
      address: 'Jl. Kopo Cirangrang No. 88, Babakan Ciparay, Bandung',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-24',
      providerId: 'penyedia-bdg-24',
      providerName: 'Pak Tatang',
      providerBusinessName: 'Agrowisata Buah Lembang',
      name: 'Strawberry Segar & Melon Madu Potong Lembang',
      description: 'Strawberry segar petik kebun Lembang manis asam segar serta potongan buah melon madu dalam kemasan box higienis.',
      photo: '/images/surplus-buah-potong.jpg',
      quantity: 5,
      portionCount: 16,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(8),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'buah',
      itemType: 'bahan_baku',
      location: { lat: -6.8150, lng: 107.6170 },
      address: 'Jl. Raya Lembang No. 158, Lembang, Bandung Barat',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-25',
      providerId: 'penyedia-jbr-1',
      providerName: 'H. Ruslan',
      providerBusinessName: 'Resto Tradisional Purwakarta',
      name: 'Nasi Liwet Rempah & Ayam Bakar Purwakarta',
      description: 'Nasi liwet khas pasundan dengan ayam bakar bumbu kecap pedas gurih, sambal terasi matang, dan tempe bacem.',
      photo: '/images/surplus-nasi-liwet.jpg',
      quantity: 6,
      portionCount: 15,
      productionTime: new Date(Date.now() - 3.5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5),
      status: 'active',
      price: 9000,
      isFree: false,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.5560, lng: 107.4430 },
      address: 'Jl. Veteran No. 72, Purwakarta Kota',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-26',
      providerId: 'penyedia-jbr-2',
      providerName: 'Bu Sinta',
      providerBusinessName: 'Katering Mandiri Galuh Mas',
      name: 'Nasi Box Bento Teriyaki Galuh Mas Karawang',
      description: 'Nasi bento higienis lengkap ayam bumbu teriyaki manis gurih, capcay sayur, dan kerupuk udang porsi katering pabrik.',
      photo: '/images/surplus-nasi-bento.jpg',
      quantity: 8,
      portionCount: 20,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4.5),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.3260, lng: 107.2880 },
      address: 'Jl. Galuh Mas Raya Blok B No. 12, Karawang Barat',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-27',
      providerId: 'penyedia-jbr-3',
      providerName: 'Pak Wijaya',
      providerBusinessName: 'Pastry Corner Summarecon Bekasi',
      name: 'Roti Gandum Utuh & Croissant Mentega Bekasi',
      description: 'Roti sourdough gandum utuh organik dan aneka croissant butter Perancis dari bakery modern Summarecon.',
      photo: '/images/surplus-sourdough.jpg',
      quantity: 4,
      portionCount: 14,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(7),
      status: 'active',
      price: 5000,
      isFree: false,
      foodCategory: 'roti',
      itemType: 'siap_santap',
      location: { lat: -6.2250, lng: 106.9980 },
      address: 'Jl. Bulevar Ahmad Yani No. 15, Summarecon Bekasi',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-28',
      providerId: 'penyedia-jbr-4',
      providerName: 'Uda Sutan',
      providerBusinessName: 'RM Padang Sahabat Margonda',
      name: 'Nasi Padang Rendang Daging & Gulai Margonda Depok',
      description: 'Paket nasi padang lauk rendang empuk, gulai nangka santan kuning, sambal balado merah, dan daun singkong rebus.',
      photo: '/images/surplus-nasi-padang.jpg',
      quantity: 5,
      portionCount: 12,
      productionTime: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      itemType: 'siap_santap',
      location: { lat: -6.3720, lng: 106.8320 },
      address: 'Jl. Margonda Raya No. 230, Beji, Depok',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-29',
      providerId: 'penyedia-jbr-5',
      providerName: 'Ibu Arini',
      providerBusinessName: 'Bogor Heritage Bakery & Cafe',
      name: 'Aneka Roti Bakery & Buah Potong Baranangsiang Bogor',
      description: 'Roti unyil isi keju cokelat, roti sisir mentega lembut, dan paket buah potong segar sisa etalase sore ini.',
      photo: '/images/surplus-bakery.jpg',
      quantity: 5,
      portionCount: 16,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(6),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'roti',
      itemType: 'siap_santap',
      location: { lat: -6.6010, lng: 106.8060 },
      address: 'Jl. Pajajaran No. 42, Baranangsiang, Bogor',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'surplus-map-30',
      providerId: 'penyedia-jbr-6',
      providerName: 'Barista Kevin',
      providerBusinessName: 'Botanical Brew Cafe BSD',
      name: 'Cold Brew Arabika & Jus Buah Segar BSD Serpong',
      description: 'Cold brew arabika single origin dalam botol 300ml serta jus jeruk sunkist dingin kemasan steril siap konsumsi.',
      photo: '/images/surplus-beverage.jpg',
      quantity: 4,
      portionCount: 12,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(8),
      status: 'active',
      price: 5000,
      isFree: false,
      foodCategory: 'minuman',
      itemType: 'siap_santap',
      location: { lat: -6.3020, lng: 106.6520 },
      address: 'Jl. BSD Boulevard Utama No. 8, BSD City, Tangerang Selatan',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getSurplusItems(): SurplusItem[] {
  let items = getStore<SurplusItem>(STORAGE_KEYS.surplusItems);
  const now = new Date().toISOString();
  const hasActiveBdg = items.some((i) => i.id.startsWith('surplus-bdg') && i.status === 'active' && i.expiryTime > now);
  const needsPhotoUpdate = items.some((i) => 
    (i.id === 'surplus-bdg-1' && i.photo !== '/images/surplus-nasi-liwet.jpg') ||
    (i.id === 'surplus-bdg-2' && i.photo !== '/images/surplus-nasi-padang.jpg') ||
    (i.id === 'surplus-bdg-3' && i.photo !== '/images/surplus-nasi-bento.jpg') ||
    (i.id === 'surplus-bdg-4' && i.photo !== '/images/surplus-nasi-timbel.jpg') ||
    (i.id === 'surplus-bdg-5' && i.photo !== '/images/surplus-nasi-kebuli.jpg') ||
    (i.id === 'surplus-bdg-8' && i.photo !== '/images/surplus-capcay.jpg') ||
    (i.id === 'surplus-bdg-10' && i.photo !== '/images/surplus-buah-potong.jpg')
  );
  // Check if new items (surplus-map-30) are present
  const hasExpandedMapItems = items.some((i) => i.id === 'surplus-map-30');
  if (!items.some((i) => i.id.startsWith('surplus-bdg')) || !hasActiveBdg || needsPhotoUpdate || !hasExpandedMapItems) {
    const bdgItems = getBandungSeedItems();
    items = [...bdgItems, ...items.filter((i) => !i.id.startsWith('surplus-bdg') && !i.id.startsWith('surplus-map'))];
    setStore(STORAGE_KEYS.surplusItems, items);
  }
  return items;
}

export function getActiveSurplus(): SurplusItem[] {
  const now = new Date().toISOString();
  return getSurplusItems().filter(
    (s) => s.status === 'active' && s.expiryTime > now
  );
}

export function getSurplusByProvider(providerId: string): SurplusItem[] {
  return getSurplusItems().filter((s) => s.providerId === providerId);
}

export function getSurplusById(id: string): SurplusItem | undefined {
  return getSurplusItems().find((s) => s.id === id);
}

export function createSurplus(
  item: Omit<SurplusItem, 'id' | 'createdAt' | 'status'>
): SurplusItem {
  const items = getSurplusItems();
  const newItem: SurplusItem = {
    ...item,
    id: generateId(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  setStore(STORAGE_KEYS.surplusItems, items);
  return newItem;
}

export function updateSurplus(
  id: string,
  updates: Partial<SurplusItem>
): SurplusItem | null {
  const items = getSurplusItems();
  const idx = items.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  setStore(STORAGE_KEYS.surplusItems, items);
  return items[idx];
}

export function deleteSurplus(id: string): boolean {
  const items = getSurplusItems();
  const filtered = items.filter((s) => s.id !== id);
  if (filtered.length === items.length) return false;
  setStore(STORAGE_KEYS.surplusItems, filtered);
  return true;
}

// ============================================================
// Bookings
// ============================================================

export function getBookings(): Booking[] {
  return getStore<Booking>(STORAGE_KEYS.bookings);
}

export function getBookingById(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}

export function getBookingsByRecipient(recipientId: string): Booking[] {
  return getBookings().filter((b) => b.recipientId === recipientId);
}

export function getBookingsByProvider(providerId: string): Booking[] {
  return getBookings().filter((b) => b.providerId === providerId);
}

export function getBookingBySurplus(surplusId: string): Booking | undefined {
  return getBookings().find(
    (b) => b.surplusId === surplusId && !['dibatalkan', 'kedaluwarsa'].includes(b.status)
  );
}

export function createBooking(
  booking: Omit<Booking, 'id' | 'bookedAt' | 'status'>
): Booking {
  const bookings = getBookings();
  const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
  const newBooking: Booking = {
    ...booking,
    id: generateId(),
    status: 'menunggu',
    pickupPin: booking.pickupPin || randomPin,
    bookedAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  setStore(STORAGE_KEYS.bookings, bookings);

  // Update surplus status
  updateSurplus(booking.surplusId, { status: 'booked' });

  return newBooking;
}

export function verifyPickupPin(
  bookingId: string,
  pin: string
): { success: boolean; error?: string; booking?: Booking } {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return { success: false, error: 'Pesanan tidak ditemukan' };
  }

  // Allow matching PIN, or demo PIN 1234 as universal bypass for testing
  const expectedPin = booking.pickupPin || '1234';
  if (pin.trim() !== expectedPin.trim() && pin.trim() !== '1234') {
    return { success: false, error: `PIN Verifikasi tidak cocok (PIN pesanan: ${expectedPin})` };
  }

  const updated = updateBookingStatus(bookingId, 'diambil');
  return { success: true, booking: updated || undefined };
}

export function getUserBadges(userId: string, role: UserRole): FoodHeroBadge[] {
  const bookings = getBookings();
  const userBookings = role === 'penerima'
    ? bookings.filter((b) => b.recipientId === userId && b.status === 'diambil')
    : bookings.filter((b) => b.providerId === userId && b.status === 'diambil');

  const totalKg = userBookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
  const totalCount = userBookings.length;
  const co2Saved = Math.round(totalKg * 2.5 * 10) / 10;

  return [
    {
      id: 'badge-first-step',
      title: 'Penyelamat Pemula',
      description: 'Menyelesaikan transaksi penyelamatan pangan pertama',
      icon: '🌱',
      category: 'rescue',
      isUnlocked: totalCount >= 1,
      unlockedAt: totalCount >= 1 ? 'Aktif' : undefined,
      progress: Math.min(100, Math.round((totalCount / 1) * 100)),
      currentCount: totalCount,
      targetCount: 1,
      unit: 'transaksi',
    },
    {
      id: 'badge-food-guardian',
      title: 'Pejuang Anti-Mubazir',
      description: 'Menyelamatkan minimal 5 kg pangan berkualitas',
      icon: '🥦',
      category: 'rescue',
      isUnlocked: totalKg >= 5,
      unlockedAt: totalKg >= 5 ? 'Aktif' : undefined,
      progress: Math.min(100, Math.round((totalKg / 5) * 100)),
      currentCount: Math.round(totalKg * 10) / 10,
      targetCount: 5,
      unit: 'kg',
    },
    {
      id: 'badge-climate-hero',
      title: 'Penjaga Iklim Bumi',
      description: 'Mencegah potensi emisi 10 kg CO₂ gas rumah kaca',
      icon: '🌍',
      category: 'carbon',
      isUnlocked: co2Saved >= 10,
      unlockedAt: co2Saved >= 10 ? 'Aktif' : undefined,
      progress: Math.min(100, Math.round((co2Saved / 10) * 100)),
      currentCount: co2Saved,
      targetCount: 10,
      unit: 'kg CO₂',
    },
    {
      id: 'badge-consistency-champ',
      title: 'Pahlawan Pangan Teladan',
      description: 'Konsisten menyelesaikan 5 aksi penyelamatan pangan',
      icon: '👑',
      category: 'consistency',
      isUnlocked: totalCount >= 5,
      unlockedAt: totalCount >= 5 ? 'Aktif' : undefined,
      progress: Math.min(100, Math.round((totalCount / 5) * 100)),
      currentCount: totalCount,
      targetCount: 5,
      unit: 'transaksi',
    },
    {
      id: 'badge-community-star',
      title: 'Duta Pangan Lestari',
      description: 'Menyelamatkan 15 kg surplus pangan bernilai sosial',
      icon: '⭐',
      category: 'community',
      isUnlocked: totalKg >= 15,
      unlockedAt: totalKg >= 15 ? 'Aktif' : undefined,
      progress: Math.min(100, Math.round((totalKg / 15) * 100)),
      currentCount: Math.round(totalKg * 10) / 10,
      targetCount: 15,
      unit: 'kg',
    },
  ];
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus
): Booking | null {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  bookings[idx].status = status;

  // Set timestamps based on status
  const now = new Date().toISOString();
  switch (status) {
    case 'dikonfirmasi':
      bookings[idx].confirmedAt = now;
      bookings[idx].pickupDeadline = hoursFromNow(2);
      break;
    case 'diambil':
      bookings[idx].pickedUpAt = now;
      // Update surplus to completed
      updateSurplus(bookings[idx].surplusId, { status: 'completed' });
      break;
    case 'dibatalkan':
      bookings[idx].cancelledAt = now;
      // Re-activate surplus
      updateSurplus(bookings[idx].surplusId, { status: 'active' });
      break;
    case 'kedaluwarsa':
      bookings[idx].expiredAt = now;
      // Re-activate surplus
      updateSurplus(bookings[idx].surplusId, { status: 'active' });
      break;
  }

  setStore(STORAGE_KEYS.bookings, bookings);
  return bookings[idx];
}

// ============================================================
// Notifications
// ============================================================

export function getNotifications(userId: string): Notification[] {
  return getStore<Notification>(STORAGE_KEYS.notifications).filter(
    (n) => n.userId === userId
  );
}

export function addNotification(
  notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Notification {
  const notifications = getStore<Notification>(STORAGE_KEYS.notifications);
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotification);
  setStore(STORAGE_KEYS.notifications, notifications);
  return newNotification;
}

export function markNotificationRead(id: string): void {
  const notifications = getStore<Notification>(STORAGE_KEYS.notifications);
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notifications[idx].read = true;
    setStore(STORAGE_KEYS.notifications, notifications);
  }
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter((n) => !n.read).length;
}

// ============================================================
// Impact Data Calculation
// ============================================================

export function calculateImpact(): ImpactData {
  const bookings = getBookings().filter((b) => b.status === 'diambil');
  const totalKgSaved = bookings.reduce((sum, b) => sum + b.quantity, 0);
  const totalCO2eSaved = totalKgSaved * CO2E_FACTOR;

  const providerIds = new Set(getUsers().filter(u => u.role === 'penyedia').map(u => u.id));
  const recipientIds = new Set(getUsers().filter(u => u.role === 'penerima').map(u => u.id));

  return {
    totalKgSaved,
    totalPortions: Math.round(totalKgSaved * 3), // ~3 portions per kg
    totalCO2eSaved,
    totalTransactions: bookings.length,
    totalProviders: providerIds.size,
    totalRecipients: recipientIds.size,
    treeEquivalent: Math.round((totalCO2eSaved / TREE_CO2_ABSORPTION) * 10) / 10,
  };
}

export function getImpactTimeline(): ImpactTimeline[] {
  const bookings = getBookings().filter((b) => b.status === 'diambil');
  const timeline: Record<string, ImpactTimeline> = {};

  bookings.forEach((b) => {
    const date = b.pickedUpAt
      ? new Date(b.pickedUpAt).toISOString().split('T')[0]
      : new Date(b.bookedAt).toISOString().split('T')[0];

    if (!timeline[date]) {
      timeline[date] = { date, kgSaved: 0, transactions: 0, co2eSaved: 0 };
    }
    timeline[date].kgSaved += b.quantity;
    timeline[date].transactions += 1;
    timeline[date].co2eSaved += b.quantity * CO2E_FACTOR;
  });

  return Object.values(timeline).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// ============================================================
// Expiry Checker (run periodically)
// ============================================================

export function checkAndExpireItems(): void {
  const now = new Date().toISOString();

  // Expire surplus items past their expiry time
  const items = getSurplusItems();
  let itemsChanged = false;
  items.forEach((item) => {
    if (item.status === 'active' && item.expiryTime <= now) {
      item.status = 'expired';
      itemsChanged = true;
    }
  });
  if (itemsChanged) setStore(STORAGE_KEYS.surplusItems, items);

  // Expire bookings past their pickup deadline
  const bookings = getBookings();
  let bookingsChanged = false;
  bookings.forEach((booking) => {
    if (
      booking.status === 'dikonfirmasi' &&
      booking.pickupDeadline &&
      booking.pickupDeadline <= now
    ) {
      booking.status = 'kedaluwarsa';
      booking.expiredAt = now;
      bookingsChanged = true;
      // Re-activate the surplus item
      const item = items.find((i) => i.id === booking.surplusId);
      if (item && item.expiryTime > now) {
        item.status = 'active';
        itemsChanged = true;
      }
    }
  });
  if (bookingsChanged) setStore(STORAGE_KEYS.bookings, bookings);
  if (itemsChanged) setStore(STORAGE_KEYS.surplusItems, items);
}

// ============================================================
// Seed Data
// ============================================================

export function seedData(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(STORAGE_KEYS.isSeeded)) return;

  // --- Seed Users ---
  const users: User[] = [
    {
      id: 'penyedia-1',
      name: 'Ahmad Fauzi',
      email: 'restoran@demo.com',
      password: 'demo123',
      role: 'penyedia',
      phone: '081234567890',
      businessName: 'Restoran Minang Jaya',
      businessType: 'restoran',
      businessAddress: 'Jl. Sudirman No. 45, Jakarta Pusat',
      location: { lat: -6.2088, lng: 106.8456 },
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'penyedia-2',
      name: 'Siti Rahayu',
      email: 'bakery@demo.com',
      password: 'demo123',
      role: 'penyedia',
      phone: '081298765432',
      businessName: 'Bakery Makmur',
      businessType: 'kafe',
      businessAddress: 'Jl. Thamrin No. 12, Jakarta Pusat',
      location: { lat: -6.1950, lng: 106.8230 },
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'penyedia-3',
      name: 'Budi Santoso',
      email: 'hotel@demo.com',
      password: 'demo123',
      role: 'penyedia',
      phone: '081311223344',
      businessName: 'Hotel Nusantara',
      businessType: 'hotel',
      businessAddress: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
      location: { lat: -6.2350, lng: 106.8270 },
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'penyedia-4',
      name: 'Dewi Lestari',
      email: 'katering@demo.com',
      password: 'demo123',
      role: 'penyedia',
      phone: '081455667788',
      businessName: 'Katering Nusantara',
      businessType: 'katering',
      businessAddress: 'Jl. Kemang Raya No. 33, Jakarta Selatan',
      location: { lat: -6.2600, lng: 106.8130 },
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'penyedia-5',
      name: 'Eko Prasetyo',
      email: 'supermarket@demo.com',
      password: 'demo123',
      role: 'penyedia',
      phone: '081599887766',
      businessName: 'Supermarket Fresh',
      businessType: 'supermarket',
      businessAddress: 'Jl. Rasuna Said No. 5, Jakarta Selatan',
      location: { lat: -6.2210, lng: 106.8510 },
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'penerima-1',
      name: 'Rina Wulandari',
      email: 'penerima@demo.com',
      password: 'demo123',
      role: 'penerima',
      phone: '082112345678',
      location: { lat: -6.2100, lng: 106.8400 },
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
    {
      id: 'penerima-2',
      name: 'Yoga Pratama',
      email: 'yoga@demo.com',
      password: 'demo123',
      role: 'penerima',
      phone: '082198765432',
      location: { lat: -6.2200, lng: 106.8500 },
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    },
    {
      id: 'admin-1',
      name: 'Admin AksesPangan',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      phone: '080000000001',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
  ];

  // --- Seed Surplus Items ---
  const surplusItems: SurplusItem[] = [
    {
      id: 'surplus-1',
      providerId: 'penyedia-1',
      providerName: 'Ahmad Fauzi',
      providerBusinessName: 'Restoran Minang Jaya',
      name: 'Nasi Padang Sisa Catering',
      description: 'Nasi padang lengkap dengan rendang, gulai ayam, dan sayur nangka. Masih hangat dan segar dari catering acara kantor.',
      photo: '',
      quantity: 5,
      portionCount: 15,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(4),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      location: { lat: -6.2088, lng: 106.8456 },
      address: 'Jl. Sudirman No. 45, Jakarta Pusat',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'surplus-2',
      providerId: 'penyedia-2',
      providerName: 'Siti Rahayu',
      providerBusinessName: 'Bakery Makmur',
      name: 'Roti & Pastry Sisa Hari Ini',
      description: 'Aneka roti tawar, roti manis, croissant, dan danish pastry. Produksi hari ini, masih sangat layak konsumsi.',
      photo: '',
      quantity: 3,
      portionCount: 12,
      productionTime: new Date(Date.now() - 8 * 3600000).toISOString(),
      expiryTime: hoursFromNow(6),
      status: 'active',
      price: 5000,
      isFree: false,
      foodCategory: 'roti',
      location: { lat: -6.1950, lng: 106.8230 },
      address: 'Jl. Thamrin No. 12, Jakarta Pusat',
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'surplus-3',
      providerId: 'penyedia-3',
      providerName: 'Budi Santoso',
      providerBusinessName: 'Hotel Nusantara',
      name: 'Sayur & Lauk Prasmanan',
      description: 'Sisa prasmanan makan siang hotel: capcay, ayam teriyaki, tumis kangkung, tahu goreng. Masih dalam kondisi baik.',
      photo: '',
      quantity: 8,
      portionCount: 24,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(3),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'sayur',
      location: { lat: -6.2350, lng: 106.8270 },
      address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
      createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    },
    {
      id: 'surplus-4',
      providerId: 'penyedia-1',
      providerName: 'Ahmad Fauzi',
      providerBusinessName: 'Restoran Minang Jaya',
      name: 'Kue Tradisional Camilan',
      description: 'Klepon, onde-onde, lemper, dan kue lapis. Dibuat pagi ini untuk acara yang batal.',
      photo: '',
      quantity: 2,
      portionCount: 20,
      productionTime: new Date(Date.now() - 5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5),
      status: 'active',
      price: 3000,
      isFree: false,
      foodCategory: 'kue',
      location: { lat: -6.2088, lng: 106.8456 },
      address: 'Jl. Sudirman No. 45, Jakarta Pusat',
      createdAt: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    },
    {
      id: 'surplus-5',
      providerId: 'penyedia-5',
      providerName: 'Eko Prasetyo',
      providerBusinessName: 'Supermarket Fresh',
      name: 'Buah Potong Segar',
      description: 'Campuran buah potong: semangka, melon, pepaya, dan nanas. Potongan segar dengan packaging higienis.',
      photo: '',
      quantity: 4,
      portionCount: 10,
      productionTime: new Date(Date.now() - 2 * 3600000).toISOString(),
      expiryTime: hoursFromNow(8),
      status: 'active',
      price: 10000,
      isFree: false,
      foodCategory: 'buah',
      location: { lat: -6.2210, lng: 106.8510 },
      address: 'Jl. Rasuna Said No. 5, Jakarta Selatan',
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'surplus-6',
      providerId: 'penyedia-3',
      providerName: 'Budi Santoso',
      providerBusinessName: 'Hotel Nusantara',
      name: 'Ayam Goreng & Nasi Box',
      description: 'Nasi box ayam goreng kremes lengkap dengan lalapan dan sambal. Sisa event meeting room.',
      photo: '',
      quantity: 6,
      portionCount: 18,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(2),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'lauk',
      location: { lat: -6.2350, lng: 106.8270 },
      address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan',
      createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    },
    {
      id: 'surplus-7',
      providerId: 'penyedia-4',
      providerName: 'Dewi Lestari',
      providerBusinessName: 'Katering Nusantara',
      name: 'Soto Betawi Porsi Besar',
      description: 'Soto betawi dengan kuah santan kental, daging sapi, dan pelengkap. Porsi besar untuk 10+ orang.',
      photo: '',
      quantity: 3,
      portionCount: 10,
      productionTime: new Date(Date.now() - 4 * 3600000).toISOString(),
      expiryTime: hoursFromNow(3),
      status: 'active',
      price: 8000,
      isFree: false,
      foodCategory: 'lauk',
      location: { lat: -6.2600, lng: 106.8130 },
      address: 'Jl. Kemang Raya No. 33, Jakarta Selatan',
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'surplus-8',
      providerId: 'penyedia-2',
      providerName: 'Siti Rahayu',
      providerBusinessName: 'Bakery Makmur',
      name: 'Jus Buah Segar',
      description: 'Jus jeruk, mangga, dan alpukat yang baru dibuat. Dalam botol 500ml, masih dingin.',
      photo: '',
      quantity: 2,
      portionCount: 8,
      productionTime: new Date(Date.now() - 1 * 3600000).toISOString(),
      expiryTime: hoursFromNow(5),
      status: 'active',
      price: 5000,
      isFree: false,
      foodCategory: 'minuman',
      location: { lat: -6.1950, lng: 106.8230 },
      address: 'Jl. Thamrin No. 12, Jakarta Pusat',
      createdAt: new Date(Date.now() - 0.5 * 3600000).toISOString(),
    },
    {
      id: 'surplus-9',
      providerId: 'penyedia-4',
      providerName: 'Dewi Lestari',
      providerBusinessName: 'Katering Nusantara',
      name: 'Nasi Tumpeng Sisa Acara',
      description: 'Nasi tumpeng komplit dengan ayam goreng, perkedel, urap, telur pindang, dan sambal goreng. Sisa acara ulang tahun.',
      photo: '',
      quantity: 10,
      portionCount: 30,
      productionTime: new Date(Date.now() - 5 * 3600000).toISOString(),
      expiryTime: hoursFromNow(2),
      status: 'active',
      price: 0,
      isFree: true,
      foodCategory: 'nasi',
      location: { lat: -6.2600, lng: 106.8130 },
      address: 'Jl. Kemang Raya No. 33, Jakarta Selatan',
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'surplus-10',
      providerId: 'penyedia-5',
      providerName: 'Eko Prasetyo',
      providerBusinessName: 'Supermarket Fresh',
      name: 'Salad Bowl Segar',
      description: 'Mixed green salad dengan dressing terpisah: caesar, thousand island, balsamic. Packaging individual.',
      photo: '',
      quantity: 1.5,
      portionCount: 6,
      productionTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      expiryTime: hoursFromNow(6),
      status: 'active',
      price: 12000,
      isFree: false,
      foodCategory: 'sayur',
      location: { lat: -6.2210, lng: 106.8510 },
      address: 'Jl. Rasuna Said No. 5, Jakarta Selatan',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
  ];

  // --- Seed completed bookings for impact data ---
  const bookings: Booking[] = [
    {
      id: 'booking-hist-1',
      surplusId: 'surplus-hist-1',
      surplusName: 'Nasi Goreng Sisa Event',
      surplusPhoto: '',
      providerId: 'penyedia-1',
      providerBusinessName: 'Restoran Minang Jaya',
      recipientId: 'penerima-1',
      recipientName: 'Rina Wulandari',
      recipientPhone: '082112345678',
      quantity: 4,
      status: 'diambil',
      bookedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      confirmedAt: new Date(Date.now() - 7 * 86400000 + 1800000).toISOString(),
      pickedUpAt: new Date(Date.now() - 7 * 86400000 + 3600000).toISOString(),
      pickupDeadline: new Date(Date.now() - 7 * 86400000 + 7200000).toISOString(),
      pickupLocation: { lat: -6.2088, lng: 106.8456 },
      pickupAddress: 'Jl. Sudirman No. 45',
    },
    {
      id: 'booking-hist-2',
      surplusId: 'surplus-hist-2',
      surplusName: 'Roti Tawar & Selai',
      surplusPhoto: '',
      providerId: 'penyedia-2',
      providerBusinessName: 'Bakery Makmur',
      recipientId: 'penerima-2',
      recipientName: 'Yoga Pratama',
      recipientPhone: '082198765432',
      quantity: 2,
      status: 'diambil',
      bookedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      confirmedAt: new Date(Date.now() - 5 * 86400000 + 900000).toISOString(),
      pickedUpAt: new Date(Date.now() - 5 * 86400000 + 2700000).toISOString(),
      pickupDeadline: new Date(Date.now() - 5 * 86400000 + 7200000).toISOString(),
      pickupLocation: { lat: -6.1950, lng: 106.8230 },
      pickupAddress: 'Jl. Thamrin No. 12',
    },
    {
      id: 'booking-hist-3',
      surplusId: 'surplus-hist-3',
      surplusName: 'Sayur Lodeh & Tempe',
      surplusPhoto: '',
      providerId: 'penyedia-3',
      providerBusinessName: 'Hotel Nusantara',
      recipientId: 'penerima-1',
      recipientName: 'Rina Wulandari',
      recipientPhone: '082112345678',
      quantity: 6,
      status: 'diambil',
      bookedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      confirmedAt: new Date(Date.now() - 3 * 86400000 + 1200000).toISOString(),
      pickedUpAt: new Date(Date.now() - 3 * 86400000 + 3000000).toISOString(),
      pickupDeadline: new Date(Date.now() - 3 * 86400000 + 7200000).toISOString(),
      pickupLocation: { lat: -6.2350, lng: 106.8270 },
      pickupAddress: 'Jl. Gatot Subroto No. 88',
    },
    {
      id: 'booking-hist-4',
      surplusId: 'surplus-hist-4',
      surplusName: 'Nasi Kuning Komplit',
      surplusPhoto: '',
      providerId: 'penyedia-4',
      providerBusinessName: 'Katering Nusantara',
      recipientId: 'penerima-2',
      recipientName: 'Yoga Pratama',
      recipientPhone: '082198765432',
      quantity: 8,
      status: 'diambil',
      bookedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      confirmedAt: new Date(Date.now() - 2 * 86400000 + 600000).toISOString(),
      pickedUpAt: new Date(Date.now() - 2 * 86400000 + 1800000).toISOString(),
      pickupDeadline: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString(),
      pickupLocation: { lat: -6.2600, lng: 106.8130 },
      pickupAddress: 'Jl. Kemang Raya No. 33',
    },
    {
      id: 'booking-hist-5',
      surplusId: 'surplus-hist-5',
      surplusName: 'Buah Segar Campur',
      surplusPhoto: '',
      providerId: 'penyedia-5',
      providerBusinessName: 'Supermarket Fresh',
      recipientId: 'penerima-1',
      recipientName: 'Rina Wulandari',
      recipientPhone: '082112345678',
      quantity: 3,
      status: 'diambil',
      bookedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      confirmedAt: new Date(Date.now() - 1 * 86400000 + 900000).toISOString(),
      pickedUpAt: new Date(Date.now() - 1 * 86400000 + 2400000).toISOString(),
      pickupDeadline: new Date(Date.now() - 1 * 86400000 + 7200000).toISOString(),
      pickupLocation: { lat: -6.2210, lng: 106.8510 },
      pickupAddress: 'Jl. Rasuna Said No. 5',
    },
  ];

  const defaultStandards: QualityStandardItem[] = [
    {
      id: 'std-1',
      title: '1. Peran AksesPangan sebagai Platform Penghubung',
      content: 'AksesPangan adalah platform teknologi yang mempertemukan penyedia surplus pangan (restoran, hotel, kafe, katering, supermarket) dengan penerima manfaat. Kami tidak memproduksi atau mengolah makanan secara langsung. Tanggung jawab atas mutu dan keaslian informasi makanan awal berada pada pihak penyedia terverifikasi.',
      order: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-2',
      title: '2. Kebijakan Keamanan Makanan 4 Jam',
      content: 'Seluruh makanan siap santap yang diunggah wajib mematuhi protokol batas aman penyimpanan suhu ruang maksimum 4 jam sejak selesai dimasak atau dikeluarkan dari pemanas. Penerima diwajibkan segera mengonsumsi atau menyimpan makanan dalam lemari pendingin (< 4°C) sesaat setelah diambil.',
      order: 2,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-3',
      title: '3. Tanggung Jawab Penerima & Verifikasi Mandiri',
      content: 'Penerima memiliki kewajiban untuk memeriksa secara fisik kondisi makanan (aroma, tekstur, suhu kemasan) sebelum menandatangani atau mengonfirmasi pengambilan di lokasi. Jika terdapat keraguan mutu pangan, penerima berhak membatalkan pengambilan di tempat.',
      order: 3,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-4',
      title: '4. Standar Kemasan & Higienitas Penyedia',
      content: 'Penyedia makanan surplus wajib menggunakan wadah makanan food-grade sekali pakai atau kemasan tertutup rapat yang higienis. Makanan tidak boleh terkontaminasi bahan alergen silang tanpa pencantuman label peringatan yang jelas.',
      order: 4,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-5',
      title: '5. Ketentuan Pembatalan & Kedaluwarsa Booking',
      content: 'Setiap pesanan booking surplus memiliki batas waktu tunggu (pickup deadline) maksimum 2 jam. Jika tidak diambil hingga batas waktu terlewati, pesanan akan dibatalkan secara otomatis oleh sistem agar makanan dapat dialihkan kepada penerima lain yang membutuhkan.',
      order: 5,
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultEsg: EsgConfig = {
    id: 'esg-config-main',
    targetKg: 10000,
    targetCO2: 25000,
    targetPortions: 20000,
    missionStatement: 'Membangun ekosistem sirkular pangan tanpa limbah untuk masa depan Indonesia yang berdaya tahan dan berkeadilan iklim.',
    verificationProtocol: 'Protokol Verifikasi Standar ESG AksesPangan 2026',
    updatedAt: new Date().toISOString(),
  };

  const defaultComplaints: AdminComplaint[] = [
    {
      id: 'complaint-1',
      userId: 'penyedia-1',
      userName: 'Restoran Padang Sederhana',
      userRole: 'penyedia',
      userEmail: 'padang@aksespangan.id',
      subject: 'Kendala Verifikasi Lokasi Toko',
      message: 'Mohon bantuan tim admin untuk pembaruan titik koordinat penjemputan mitra di cabang baru.',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [
        {
          id: 'reply-1',
          senderId: 'admin-1',
          senderName: 'Admin AksesPangan',
          senderRole: 'admin',
          complaintId: 'complaint-1',
          message: 'Halo Mitra Restoran Padang Sederhana, koordinat telah kami verifikasi dan sinkronkan ke peta.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          isRead: true,
        },
      ],
    },
  ];

  setStore(STORAGE_KEYS.users, users);
  setStore(STORAGE_KEYS.surplusItems, surplusItems);
  setStore(STORAGE_KEYS.bookings, bookings);
  setStore(STORAGE_KEYS.notifications, []);
  setStore(STORAGE_KEYS.qualityStandards, defaultStandards);
  setStore(STORAGE_KEYS.esgConfig, [defaultEsg]);
  setStore(STORAGE_KEYS.complaints, defaultComplaints);
  setStore(STORAGE_KEYS.chatMessages, []);
  localStorage.setItem(STORAGE_KEYS.isSeeded, 'true');
}

// ============================================================
// STANDAR MUTU (QUALITY STANDARDS) CRUD
// ============================================================

export function getQualityStandards(): QualityStandardItem[] {
  const list = getStore<QualityStandardItem>(STORAGE_KEYS.qualityStandards);
  if (list.length > 0) return list.sort((a, b) => a.order - b.order);

  // Fallback defaults
  const defaults: QualityStandardItem[] = [
    {
      id: 'std-1',
      title: '1. Peran AksesPangan sebagai Platform Penghubung',
      content: 'AksesPangan adalah platform teknologi yang mempertemukan penyedia surplus pangan (restoran, hotel, kafe, katering, supermarket) dengan penerima manfaat. Kami tidak memproduksi atau mengolah makanan secara langsung. Tanggung jawab atas mutu dan keaslian informasi makanan awal berada pada pihak penyedia terverifikasi.',
      order: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-2',
      title: '2. Kebijakan Keamanan Makanan 4 Jam',
      content: 'Seluruh makanan siap santap yang diunggah wajib mematuhi protokol batas aman penyimpanan suhu ruang maksimum 4 jam sejak selesai dimasak atau dikeluarkan dari pemanas. Penerima diwajibkan segera mengonsumsi atau menyimpan makanan dalam lemari pendingin (< 4°C) sesaat setelah diambil.',
      order: 2,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-3',
      title: '3. Tanggung Jawab Penerima & Verifikasi Mandiri',
      content: 'Penerima memiliki kewajiban untuk memeriksa secara fisik kondisi makanan (aroma, tekstur, suhu kemasan) sebelum menandatangani atau mengonfirmasi pengambilan di lokasi. Jika terdapat keraguan mutu pangan, penerima berhak membatalkan pengambilan di tempat.',
      order: 3,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-4',
      title: '4. Standar Kemasan & Higienitas Penyedia',
      content: 'Penyedia makanan surplus wajib menggunakan wadah makanan food-grade sekali pakai atau kemasan tertutup rapat yang higienis. Makanan tidak boleh terkontaminasi bahan alergen silang tanpa pencantuman label peringatan yang jelas.',
      order: 4,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'std-5',
      title: '5. Ketentuan Pembatalan & Kedaluwarsa Booking',
      content: 'Setiap pesanan booking surplus memiliki batas waktu tunggu (pickup deadline) maksimum 2 jam. Jika tidak diambil hingga batas waktu terlewati, pesanan akan dibatalkan secara otomatis oleh sistem agar makanan dapat dialihkan kepada penerima lain yang membutuhkan.',
      order: 5,
      updatedAt: new Date().toISOString(),
    },
  ];
  setStore(STORAGE_KEYS.qualityStandards, defaults);
  return defaults;
}

export function addQualityStandard(item: Omit<QualityStandardItem, 'id' | 'updatedAt'>): QualityStandardItem {
  const current = getQualityStandards();
  const newItem: QualityStandardItem = {
    ...item,
    id: generateId(),
    updatedAt: new Date().toISOString(),
  };
  current.push(newItem);
  setStore(STORAGE_KEYS.qualityStandards, current);
  return newItem;
}

export function updateQualityStandard(id: string, updates: Partial<QualityStandardItem>): QualityStandardItem | null {
  const current = getQualityStandards();
  const idx = current.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  current[idx] = {
    ...current[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setStore(STORAGE_KEYS.qualityStandards, current);
  return current[idx];
}

export function deleteQualityStandard(id: string): boolean {
  const current = getQualityStandards();
  const filtered = current.filter((s) => s.id !== id);
  if (filtered.length === current.length) return false;
  setStore(STORAGE_KEYS.qualityStandards, filtered);
  return true;
}

// ============================================================
// ESG CONFIG CRUD
// ============================================================

export function getEsgConfig(): EsgConfig {
  const list = getStore<EsgConfig>(STORAGE_KEYS.esgConfig);
  if (list && list.length > 0) return list[0];
  const defaultConfig: EsgConfig = {
    id: 'esg-config-main',
    targetKg: 10000,
    targetCO2: 25000,
    targetPortions: 20000,
    missionStatement: 'Membangun ekosistem sirkular pangan tanpa limbah untuk masa depan Indonesia yang berdaya tahan dan berkeadilan iklim.',
    verificationProtocol: 'Protokol Verifikasi Standar ESG AksesPangan 2026',
    updatedAt: new Date().toISOString(),
  };
  setStore(STORAGE_KEYS.esgConfig, [defaultConfig]);
  return defaultConfig;
}

export function updateEsgConfig(updates: Partial<EsgConfig>): EsgConfig {
  const current = getEsgConfig();
  const updated: EsgConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  setStore(STORAGE_KEYS.esgConfig, [updated]);
  return updated;
}

// ============================================================
// CHAT & COMPLAINTS SYSTEM
// ============================================================

export function getOrderChatMessages(bookingId: string): ChatMessage[] {
  const messages = getStore<ChatMessage>(STORAGE_KEYS.chatMessages);
  return messages.filter((m) => m.bookingId === bookingId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function sendOrderChatMessage(data: {
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string;
  message: string;
}): ChatMessage {
  const messages = getStore<ChatMessage>(STORAGE_KEYS.chatMessages);
  const newMsg: ChatMessage = {
    id: generateId(),
    bookingId: data.bookingId,
    senderId: data.senderId,
    senderName: data.senderName,
    senderRole: data.senderRole,
    recipientId: data.recipientId,
    message: data.message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  messages.push(newMsg);
  setStore(STORAGE_KEYS.chatMessages, messages);
  return newMsg;
}

export function getAdminComplaints(): AdminComplaint[] {
  const complaints = getStore<AdminComplaint>(STORAGE_KEYS.complaints);
  return complaints.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getComplaintsByUser(userId: string): AdminComplaint[] {
  return getAdminComplaints().filter((c) => c.userId === userId);
}

export function sendAdminComplaint(data: {
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  subject: string;
  message: string;
}): AdminComplaint {
  const complaints = getStore<AdminComplaint>(STORAGE_KEYS.complaints);
  const newComplaint: AdminComplaint = {
    id: generateId(),
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole,
    userEmail: data.userEmail,
    subject: data.subject,
    message: data.message,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: [],
  };
  complaints.push(newComplaint);
  setStore(STORAGE_KEYS.complaints, complaints);
  return newComplaint;
}

export function replyAdminComplaint(
  complaintId: string,
  senderId: string,
  senderName: string,
  senderRole: UserRole,
  message: string
): ChatMessage | null {
  const complaints = getStore<AdminComplaint>(STORAGE_KEYS.complaints);
  const idx = complaints.findIndex((c) => c.id === complaintId);
  if (idx === -1) return null;

  const replyMsg: ChatMessage = {
    id: generateId(),
    complaintId,
    senderId,
    senderName,
    senderRole,
    message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  complaints[idx].replies.push(replyMsg);
  complaints[idx].updatedAt = new Date().toISOString();
  if (senderRole === 'admin' && complaints[idx].status === 'open') {
    complaints[idx].status = 'in_progress';
  }

  setStore(STORAGE_KEYS.complaints, complaints);
  return replyMsg;
}

export function updateComplaintStatus(complaintId: string, status: 'open' | 'in_progress' | 'resolved'): boolean {
  const complaints = getStore<AdminComplaint>(STORAGE_KEYS.complaints);
  const idx = complaints.findIndex((c) => c.id === complaintId);
  if (idx === -1) return false;
  complaints[idx].status = status;
  complaints[idx].updatedAt = new Date().toISOString();
  setStore(STORAGE_KEYS.complaints, complaints);
  return true;
}

