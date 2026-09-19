// ============================================================
// AksesPangan — Booking & Distribution Microservice Client
// ============================================================

import { requestApi } from './apiClient';
import type { CreateBookingRequest, UpdateBookingStatusRequest } from '@/types/api';
import type { Booking, BookingStatus, SurplusItem } from '@/types';
import * as localData from '@/lib/data';

export const bookingService = {
  async getByRecipient(recipientId: string): Promise<Booking[]> {
    const local = localData.getBookingsByRecipient(recipientId);
    try {
      const remote = await requestApi<Booking[]>(`/api/bookings?recipientId=${encodeURIComponent(recipientId)}`);
      const map = new Map<string, Booking>();
      remote.forEach((b) => map.set(b.id, b));
      local.forEach((b) => {
        if (!map.has(b.id)) {
          map.set(b.id, b);
        }
      });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
      );
      merged.forEach((b) => localData.saveBooking(b));
      return merged;
    } catch {
      return local;
    }
  },

  async getByProvider(providerId: string): Promise<Booking[]> {
    const local = localData.getBookingsByProvider(providerId);
    try {
      const remote = await requestApi<Booking[]>(`/api/bookings?providerId=${encodeURIComponent(providerId)}`);
      const map = new Map<string, Booking>();
      remote.forEach((b) => map.set(b.id, b));
      local.forEach((b) => {
        if (!map.has(b.id)) {
          map.set(b.id, b);
        }
      });
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
      );
      merged.forEach((b) => localData.saveBooking(b));
      return merged;
    } catch {
      return local;
    }
  },

  async create(data: CreateBookingRequest, fallbackItem?: SurplusItem): Promise<Booking> {
    try {
      const booking = await requestApi<Booking>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Save locally as well for offline and instant tab sync
      localData.saveBooking(booking);
      return booking;
    } catch (err: any) {
      if (err?.statusCode === 503 || err?.message?.includes('Offline')) {
        throw err;
      }
      const surplus = fallbackItem || localData.getSurplusById(data.surplusId);
      if (!surplus) throw new Error('Item surplus tidak ditemukan');

      return localData.createBooking({
        surplusId: data.surplusId,
        surplusName: surplus.name,
        surplusPhoto: surplus.photo,
        providerId: surplus.providerId,
        providerBusinessName: surplus.providerBusinessName,
        recipientId: data.recipientId,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        quantity: data.quantity,
        pickupDeadline: new Date(Date.now() + 2 * 3600000).toISOString(),
        pickupLocation: surplus.location,
        pickupAddress: surplus.address,
        fulfillmentMethod: data.fulfillmentMethod,
        deliveryFee: data.deliveryFee,
        deliveryDistanceKm: data.deliveryDistanceKm,
        deliveryAddress: data.deliveryAddress,
        deliveryCoords: data.deliveryCoords,
        courier: data.courier,
        courierStatus: data.courierStatus,
      });
    }
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    try {
      const body: UpdateBookingStatusRequest = { status };
      const booking = await requestApi<Booking>(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      localData.updateBookingStatus(bookingId, status);
      return booking;
    } catch {
      const res = localData.updateBookingStatus(bookingId, status);
      if (!res) throw new Error('Gagal memperbarui status booking');
      return res;
    }
  },
};
