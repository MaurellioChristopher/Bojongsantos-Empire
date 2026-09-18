import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { assertMicroserviceAvailable } from '@/lib/microserviceGate';
import type { ApiResponse, CreateSurplusRequest } from '@/types/api';
import type { SurplusItem } from '@/types';

export async function GET(request: Request): Promise<NextResponse<ApiResponse<SurplusItem[]>>> {
  const gate = await assertMicroserviceAvailable('inventory');
  if (!gate.ok && gate.errorResponse) {
    return gate.errorResponse as NextResponse<ApiResponse<SurplusItem[]>>;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const priceFilter = searchParams.get('priceFilter');
    const providerId = searchParams.get('providerId');

    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer) {
      try {
        let query = supabaseServer.from('surplus_items').select('*').order('created_at', { ascending: false });

        if (providerId) {
          query = query.eq('provider_id', providerId);
        } else {
          query = query.eq('status', 'active').gt('expiry_time', new Date().toISOString());
        }

        if (category && category !== 'all') {
          query = query.eq('food_category', category);
        }

        if (priceFilter === 'free') {
          query = query.eq('is_free', true);
        } else if (priceFilter === 'paid') {
          query = query.eq('is_free', false);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let items: SurplusItem[] = data.map((item: any) => ({
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
            itemType: item.item_type || (item.food_category === 'sayur' || item.food_category === 'buah' ? 'bahan_baku' : 'siap_santap'),
            location: item.location,
            address: item.address,
            createdAt: item.created_at,
          }));

          if (search) {
            const q = search.toLowerCase();
            items = items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
          }

          return NextResponse.json({
            success: true,
            data: items,
            timestamp: new Date().toISOString(),
          });
        }
      } catch {
        // Fallback to memory store
      }
    }

    // Fallback store
    const store = getServerStore();
    const now = new Date().toISOString();
    let items = store.surplusItems;

    if (providerId) {
      items = items.filter((i) => i.providerId === providerId);
    } else {
      items = items.filter((i) => i.status === 'active' && i.expiryTime > now);
    }

    if (category && category !== 'all') {
      items = items.filter((i) => i.foodCategory === category);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }

    if (priceFilter === 'free') {
      items = items.filter((i) => i.isFree);
    } else if (priceFilter === 'paid') {
      items = items.filter((i) => !i.isFree);
    }

    return NextResponse.json({
      success: true,
      data: items,
      timestamp: new Date().toISOString(),
    });
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

export async function POST(request: Request): Promise<NextResponse<ApiResponse<SurplusItem>>> {
  const gate = await assertMicroserviceAvailable('inventory');
  if (!gate.ok && gate.errorResponse) {
    return gate.errorResponse as NextResponse<ApiResponse<SurplusItem>>;
  }

  try {
    const body: CreateSurplusRequest = await request.json();

    if (!body.name || !body.quantity || !body.expiryTime || !body.providerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nama, kuantitas, waktu kedaluwarsa, dan identitas penyedia wajib diisi',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const newItem: SurplusItem = {
      id: `surplus-${Date.now()}`,
      providerId: body.providerId,
      providerName: body.providerName || 'Penyedia',
      providerBusinessName: body.providerBusinessName || 'Usaha Makanan',
      name: body.name,
      description: body.description || '',
      photo: body.photo || '/images/surplus-nasi-padang.jpg',
      quantity: Number(body.quantity),
      portionCount: Number(body.portionCount) || Math.round(Number(body.quantity) * 2),
      productionTime: body.productionTime || new Date().toISOString(),
      expiryTime: body.expiryTime,
      status: 'active',
      price: Number(body.price) || 0,
      isFree: body.isFree ?? (Number(body.price) === 0),
      foodCategory: body.foodCategory || 'lainnya',
      location: { lat: Number(body.lat) || -6.2088, lng: Number(body.lng) || 106.8456 },
      address: body.address || 'Jakarta',
      createdAt: new Date().toISOString(),
    };

    // 1. Sync with Supabase
    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer) {
      try {
        await supabaseServer.from('surplus_items').insert({
          id: newItem.id,
          provider_id: newItem.providerId,
          provider_name: newItem.providerName,
          provider_business_name: newItem.providerBusinessName,
          name: newItem.name,
          description: newItem.description,
          photo: newItem.photo,
          quantity: newItem.quantity,
          portion_count: newItem.portionCount,
          production_time: newItem.productionTime,
          expiry_time: newItem.expiryTime,
          status: newItem.status,
          price: newItem.price,
          is_free: newItem.isFree,
          food_category: newItem.foodCategory,
          location: newItem.location,
          address: newItem.address,
          created_at: newItem.createdAt,
        });
      } catch {
        // Continue with memory store
      }
    }

    const store = getServerStore();
    store.surplusItems.unshift(newItem);

    return NextResponse.json(
      {
        success: true,
        message: 'Surplus makanan berhasil dipublikasikan',
        data: newItem,
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
