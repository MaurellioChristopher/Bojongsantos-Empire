import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiResponse, UpdateBookingStatusRequest } from '@/types/api';
import type { Booking } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Booking>>> {
  const { id } = await params;
  const store = getServerStore();
  const booking = store.bookings.find((b) => b.id === id);

  if (!booking) {
    return NextResponse.json(
      {
        success: false,
        error: 'Booking tidak ditemukan',
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: booking,
    timestamp: new Date().toISOString(),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Booking>>> {
  const { id } = await params;
  const body: UpdateBookingStatusRequest = await request.json();
  const store = getServerStore();
  const booking = store.bookings.find((b) => b.id === id);

  if (!booking) {
    return NextResponse.json(
      {
        success: false,
        error: 'Booking tidak ditemukan',
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();
  booking.status = body.status;

  if (body.status === 'dikonfirmasi') booking.confirmedAt = now;
  else if (body.status === 'diambil') booking.pickedUpAt = now;
  else if (body.status === 'dibatalkan') booking.cancelledAt = now;
  else if (body.status === 'kedaluwarsa') booking.expiredAt = now;

  // Sync to Supabase
  const supabaseServer = getSupabaseServerClient();
  if (supabaseServer) {
    try {
      const updates: any = { status: body.status };
      if (body.status === 'dikonfirmasi') updates.confirmed_at = now;
      if (body.status === 'diambil') updates.completed_at = now;
      if (body.status === 'dibatalkan') updates.cancelled_at = now;

      await supabaseServer.from('bookings').update(updates).eq('id', id);

      if (body.status === 'dibatalkan') {
        await supabaseServer.from('surplus_items').update({ status: 'active' }).eq('id', booking.surplusId);
      }
    } catch {
      // Continue
    }
  }

  return NextResponse.json({
    success: true,
    message: `Status booking diubah menjadi ${body.status}`,
    data: booking,
    timestamp: new Date().toISOString(),
  });
}
