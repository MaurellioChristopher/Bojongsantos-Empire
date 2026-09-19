import type { Coordinates, CourierDriver, CourierRating, Booking } from '@/types';
import { computeHaversineDistance } from './navigationService';

// Registered Professional Food Couriers in Bojongsoang & Greater Bandung
export const PROFESSIONAL_COURIERS: CourierDriver[] = [
  {
    id: 'driver-01',
    name: 'Budi Prasetyo',
    phone: '0812-3456-7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    vehicleType: 'motor',
    plateNumber: 'D 4521 BOJ',
    rating: 4.9,
    totalReviews: 148,
    completedDeliveries: 382,
    badge: 'Top Courier • Food Safety Certified',
    currentCoords: {
      lat: -6.9745,
      lng: 107.6312,
    },
  },
  {
    id: 'driver-02',
    name: 'Rizky Ramadhan',
    phone: '0857-9876-5432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    vehicleType: 'motor',
    plateNumber: 'D 3899 TKL',
    rating: 4.8,
    totalReviews: 94,
    completedDeliveries: 215,
    badge: 'Eco-Rider • Cepat & Higienis',
    currentCoords: {
      lat: -6.9782,
      lng: 107.6285,
    },
  },
  {
    id: 'driver-03',
    name: 'Agus Hendra',
    phone: '0821-1122-3344',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    vehicleType: 'sepeda_listrik',
    plateNumber: 'D 1102 BJS',
    rating: 5.0,
    totalReviews: 62,
    completedDeliveries: 130,
    badge: 'Zero-Emission Champion',
    currentCoords: {
      lat: -6.9698,
      lng: 107.6355,
    },
  },
];

/**
 * Assign nearest available professional courier based on food donor pickup location
 */
export function assignNearestCourier(originCoords: Coordinates): CourierDriver {
  let nearest = PROFESSIONAL_COURIERS[0];
  let minDistance = Infinity;

  for (const driver of PROFESSIONAL_COURIERS) {
    const dist = computeHaversineDistance(originCoords, driver.currentCoords);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = driver;
    }
  }

  return nearest;
}

/**
 * Save courier review & rating and update courier score in memory
 */
export function submitCourierReview(
  bookingId: string,
  review: CourierRating,
  courierId?: string
): { success: boolean; updatedCourier?: CourierDriver } {
  try {
    const driver = PROFESSIONAL_COURIERS.find((c) => c.id === courierId) || PROFESSIONAL_COURIERS[0];

    // Bayesian rating update calculation
    const totalScore = driver.rating * driver.totalReviews + review.rating;
    driver.totalReviews += 1;
    driver.rating = Number((totalScore / driver.totalReviews).toFixed(1));

    // Save to local storage for persistence across reloads
    try {
      const storageKey = `courier_reviews_${driver.id}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existing.push({ bookingId, ...review });
      localStorage.setItem(storageKey, JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage save rating warning:', err);
    }

    return {
      success: true,
      updatedCourier: { ...driver },
    };
  } catch (err) {
    console.error('Error submitting courier review:', err);
    return { success: false };
  }
}
