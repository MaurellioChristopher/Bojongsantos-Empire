// ============================================================
// AksesPangan — Utility Functions
// ============================================================

import type { Coordinates, BookingStatus } from '@/types';

/**
 * Generate a unique ID (UUID-like)
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format price in Indonesian Rupiah
 */
export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date for Indonesian locale
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time for Indonesian locale
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time together
 */
export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)}, ${formatTime(isoString)}`;
}

/**
 * Get relative time string (e.g., "2 jam lalu")
 */
export function getRelativeTime(isoString: string): string {
  const now = new Date().getTime();
  const then = new Date(isoString).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return formatDate(isoString);
}

/**
 * Calculate remaining time until expiry
 * @returns object with hours, minutes, seconds and total ms remaining
 */
export function getTimeRemaining(expiryTime: string): {
  total: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean; // less than 1 hour
} {
  const total = new Date(expiryTime).getTime() - Date.now();
  const isExpired = total <= 0;

  if (isExpired) {
    return { total: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: true };
  }

  return {
    total,
    hours: Math.floor(total / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
    isExpired: false,
    isUrgent: total < 3600000,
  };
}

/**
 * Format countdown display string
 */
export function formatCountdown(expiryTime: string): string {
  const { hours, minutes, seconds, isExpired } = getTimeRemaining(expiryTime);
  if (isExpired) return 'Kedaluwarsa';
  if (hours > 0) return `${hours}j ${minutes}m ${seconds}d`;
  if (minutes > 0) return `${minutes}m ${seconds}d`;
  return `${seconds}d`;
}

/**
 * Estimate CO₂e saved from food rescued
 * Average: 1 kg food waste ≈ 2.5 kg CO₂e
 */
export function estimateCO2e(kgFood: number): number {
  return kgFood * 2.5;
}

/**
 * Convert CO₂e to tree equivalent
 * 1 mature tree absorbs ~22 kg CO₂/year
 */
export function co2eToTrees(co2eKg: number): number {
  return co2eKg / 22;
}

/**
 * Get booking status color class
 */
export function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case 'menunggu':
      return 'bg-amber-50 text-amber-800 border border-amber-200/60';
    case 'dikonfirmasi':
      return 'bg-emerald-50 text-emerald-800 border border-emerald-200/60';
    case 'diambil':
      return 'bg-blue-50 text-blue-800 border border-blue-200/60';
    case 'dibatalkan':
      return 'bg-red-50 text-red-800 border border-red-200/60';
    case 'kedaluwarsa':
      return 'bg-gray-100 text-gray-600 border border-gray-200/60';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (Indonesian format)
 */
export function isValidPhone(phone: string): boolean {
  return /^(\+62|62|0)[0-9]{9,13}$/.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Create ISO string for a time N hours from now
 */
export function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 3600000).toISOString();
}

/**
 * Create ISO string for a time N minutes from now
 */
export function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60000).toISOString();
}

/**
 * Animate counting up from 0 to a target number
 */
export function animateValue(
  start: number,
  end: number,
  duration: number,
  callback: (value: number) => void
): void {
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = start + (end - start) * easedProgress;

    callback(Math.round(currentValue * 10) / 10);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get food category icon URL (emoji fallback)
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    nasi: '🍚',
    lauk: '🍗',
    sayur: '🥗',
    roti: '🍞',
    kue: '🍰',
    buah: '🍎',
    minuman: '🥤',
    lainnya: '📦',
  };
  return icons[category] || '📦';
}

/**
 * Smart food photo resolver that returns the exact matching authentic photo for each dish
 */
export function getSurplusPhoto(item?: { name?: string; foodCategory?: string; photo?: string } | null): string {
  if (!item) return '/images/surplus-nasi-liwet.jpg';
  const name = (item.name || '').toLowerCase();

  if (name.includes('liwet')) return '/images/surplus-nasi-liwet.jpg';
  if (name.includes('padang') || name.includes('rendang')) return '/images/surplus-nasi-padang.jpg';
  if (name.includes('bento') || name.includes('teriyaki')) return '/images/surplus-nasi-bento.jpg';
  if (name.includes('timbel')) return '/images/surplus-nasi-timbel.jpg';
  if (name.includes('kebuli') || name.includes('kambing')) return '/images/surplus-nasi-kebuli.jpg';
  if (name.includes('capcay')) return '/images/surplus-capcay.jpg';
  if (name.includes('semangka') || name.includes('melon') || item.foodCategory === 'buah') return '/images/surplus-buah-potong.jpg';
  if (name.includes('sourdough') || name.includes('baguette')) return '/images/surplus-sourdough.jpg';
  if (item.foodCategory === 'roti' || name.includes('croissant') || name.includes('roti')) return '/images/surplus-bakery.jpg';
  if (name.includes('jus') || name.includes('alpukat') || name.includes('jeruk')) return '/images/surplus-juice.jpg';
  if (name.includes('cold brew') || item.foodCategory === 'minuman') return '/images/surplus-beverage.jpg';
  if (item.foodCategory === 'sayur') return '/images/surplus-produce.jpg';

  if (item.photo && !item.photo.includes('placeholder') && item.photo !== '/images/surplus-gourmet.jpg') {
    return item.photo;
  }
  return '/images/surplus-nasi-liwet.jpg';
}

