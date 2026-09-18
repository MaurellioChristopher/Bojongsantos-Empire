import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiResponse, CreateBookingRequest } from '@/types/api';
import type { Booking } from '@/types';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<Booking[]>>> {
  const { searchParams } = new URL(request.url);
  const recipientId = searchParams.get('recipientId');
  const providerId = searchParams.get('providerId');

  const supabaseServer = getSupabaseServerClient();
  if (supabaseServer) {
    try {
      let query = supabaseServer.from('bookings').select('*').order('created_at', { ascending: false });
      if (recipientId) query = query.eq('recipient_id', recipientId);
      if (providerId) query = query.eq('provider_id', providerId);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const bookings: Booking[] = data.map((b: any) => ({
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
          status: b.status,
          bookedAt: b.created_at,
          pickupDeadline: b.pickup_deadline,
          pickupAddress: b.pickup_address,
          pickupLocation: b.pickup_location || { lat: -6.9530, lng: 107.6320 },
          confirmedAt: b.confirmed_at,
          pickedUpAt: b.completed_at,
          cancelledAt: b.cancelled_at,
        }));

        return NextResponse.json({
          success: true,
          data: bookings,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // Fallback to memory store
    }
  }

  const store = getServerStore();
  let bookings = store.bookings;

  if (recipientId) {
    bookings = bookings.filter(
      (b) =>
        b.recipientId === recipientId ||
        (recipientId.includes('penerima') && (b.recipientId === 'penerima-1' || b.recipientId === 'penerima-demo'))
    );
  } else if (providerId) {
    const isDemoProvider =
      providerId === 'penyedia-1' ||
      providerId === 'penyedia-demo' ||
      providerId === 'penyedia-bdg-1' ||
      providerId.startsWith('penyedia-');

    if (isDemoProvider) {
      bookings = bookings.filter(
        (b) =>
          b.providerId === 'penyedia-1' ||
          b.providerId === 'penyedia-demo' ||
          b.providerId === 'penyedia-bdg-1' ||
          b.providerId === providerId ||
          b.providerId.startsWith('penyedia-bdg') ||
          b.providerId.startsWith('penyedia-jbr') ||
          b.providerBusinessName === 'Dapur Sunda Bojongsoang'
      );
    } else {
      bookings = bookings.filter((b) => b.providerId === providerId);
    }
  }

  return NextResponse.json({
    success: true,
    data: bookings,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Booking>>> {
  try {
    const body: CreateBookingRequest = await request.json();
    const store = getServerStore();

    const surplus = store.surplusItems.find((s) => s.id === body.surplusId);
    if (!surplus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item surplus makanan tidak ditemukan',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (surplus.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Item surplus ini sudah tidak aktif atau sudah dibooking',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const bookingQty = body.quantity || surplus.quantity;
    const deadline = new Date(Math.min(Date.now() + 2 * 3600000, new Date(surplus.expiryTime).getTime())).toISOString();
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      surplusId: surplus.id,
      surplusName: surplus.name,
      surplusPhoto: surplus.photo,
      providerId: surplus.providerId,
      providerBusinessName: surplus.providerBusinessName,
      recipientId: body.recipientId,
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone || '08123456789',
      quantity: bookingQty,
      status: 'menunggu',
      pickupPin: randomPin,
      bookedAt: new Date().toISOString(),
      pickupDeadline: deadline,
      pickupLocation: surplus.location,
      pickupAddress: surplus.address,
    };

    // 1. Sync with Supabase
    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer) {
      try {
        await supabaseServer.from('bookings').insert({
          id: newBooking.id,
          surplus_id: newBooking.surplusId,
          surplus_name: newBooking.surplusName,
          provider_id: newBooking.providerId,
          provider_business_name: newBooking.providerBusinessName,
          recipient_id: newBooking.recipientId,
          recipient_name: newBooking.recipientName,
          recipient_phone: newBooking.recipientPhone,
          quantity: newBooking.quantity,
          pickup_address: newBooking.pickupAddress,
          pickup_deadline: newBooking.pickupDeadline,
          status: newBooking.status,
          created_at: newBooking.bookedAt,
        });

        await supabaseServer
          .from('surplus_items')
          .update({ status: 'booked' })
          .eq('id', surplus.id);
      } catch {
        // Continue with memory store
      }
    }

    // Update surplus item status in memory
    surplus.status = 'booked';
    store.bookings.unshift(newBooking);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking berhasil dibuat. Silakan ambil sebelum batas waktu.',
        data: newBooking,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal Server Error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
