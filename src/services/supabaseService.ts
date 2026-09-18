// ============================================================
// AksesPangan — Supabase Database Operations Adapter
// ============================================================

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { User, SurplusItem, Booking, AdminComplaint, QualityStandardItem, EsgConfig } from '@/types';

export const supabaseService = {
  isAvailable(): boolean {
    return isSupabaseConfigured();
  },

  // USERS
  async getUserByEmail(email: string): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        businessName: data.business_name,
        businessType: data.business_type,
        businessAddress: data.business_address,
        location: data.location,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  },

  async createUser(user: User): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('users')
        .insert({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          phone: user.phone || null,
          business_name: user.businessName || null,
          business_type: user.businessType || null,
          business_address: user.businessAddress || null,
          location: user.location || null,
          created_at: user.createdAt,
        })
        .select()
        .single();

      if (error || !data) return null;
      return user;
    } catch {
      return null;
    }
  },

  // SURPLUS ITEMS
  async getAllSurplus(): Promise<SurplusItem[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('surplus_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((item: any) => ({
        id: item.id,
        providerId: item.provider_id,
        providerName: item.provider_name,
        providerBusinessName: item.provider_business_name,
        name: item.name,
        description: item.description || '',
        photo: item.photo || '/images/surplus-nasi-padang.jpg',
        quantity: Number(item.quantity),
        portionCount: Number(item.portion_count),
        productionTime: item.production_time,
        expiryTime: item.expiry_time,
        status: item.status,
        price: Number(item.price),
        isFree: Boolean(item.is_free),
        foodCategory: item.food_category,
        location: item.location,
        address: item.address,
        createdAt: item.created_at,
      }));
    } catch {
      return null;
    }
  },

  async createSurplus(item: SurplusItem): Promise<SurplusItem | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('surplus_items')
        .insert({
          id: item.id,
          provider_id: item.providerId,
          provider_name: item.providerName,
          provider_business_name: item.providerBusinessName,
          name: item.name,
          description: item.description,
          photo: item.photo,
          quantity: item.quantity,
          portion_count: item.portionCount,
          production_time: item.productionTime,
          expiry_time: item.expiryTime,
          status: item.status,
          price: item.price,
          is_free: item.isFree,
          food_category: item.foodCategory,
          location: item.location,
          address: item.address,
          created_at: item.createdAt,
        })
        .select()
        .single();

      if (error || !data) return null;
      return item;
    } catch {
      return null;
    }
  },

  async updateSurplusStatus(id: string, status: SurplusItem['status']): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { error } = await client
        .from('surplus_items')
        .update({ status })
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  },

  // BOOKINGS
  async getAllBookings(): Promise<Booking[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;

      return data.map((b: any) => ({
        id: b.id,
        surplusId: b.surplus_id,
        surplusName: b.surplus_name,
        surplusPhoto: b.surplus_photo || '/images/surplus-nasi-padang.jpg',
        providerId: b.provider_id,
        providerBusinessName: b.provider_business_name,
        recipientId: b.recipient_id,
        recipientName: b.recipient_name,
        recipientPhone: b.recipient_phone || '',
        quantity: Number(b.quantity),
        pickupAddress: b.pickup_address,
        pickupDeadline: b.pickup_deadline,
        pickupLocation: b.pickup_location || { lat: -6.9530, lng: 107.6320 },
        status: b.status,
        bookedAt: b.created_at,
        confirmedAt: b.confirmed_at,
        pickedUpAt: b.completed_at,
        cancelledAt: b.cancelled_at,
      }));
    } catch {
      return null;
    }
  },

  async createBooking(booking: Booking): Promise<Booking | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('bookings')
        .insert({
          id: booking.id,
          surplus_id: booking.surplusId,
          surplus_name: booking.surplusName,
          provider_id: booking.providerId,
          provider_business_name: booking.providerBusinessName,
          recipient_id: booking.recipientId,
          recipient_name: booking.recipientName,
          recipient_phone: booking.recipientPhone,
          quantity: booking.quantity,
          pickup_address: booking.pickupAddress,
          pickup_deadline: booking.pickupDeadline,
          status: booking.status,
          created_at: booking.bookedAt,
        })
        .select()
        .single();

      if (error || !data) return null;
      return booking;
    } catch {
      return null;
    }
  },

  async updateBookingStatus(id: string, status: Booking['status']): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const updates: any = { status };
      if (status === 'dikonfirmasi') updates.confirmed_at = new Date().toISOString();
      if (status === 'diambil') updates.completed_at = new Date().toISOString();
      if (status === 'dibatalkan') updates.cancelled_at = new Date().toISOString();

      const { error } = await client.from('bookings').update(updates).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },
};
