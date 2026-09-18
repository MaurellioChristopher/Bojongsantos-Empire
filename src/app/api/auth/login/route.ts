import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { LoginRequest, ApiResponse, LoginResponse } from '@/types/api';
import type { User } from '@/types';

export async function POST(request: Request): Promise<NextResponse<ApiResponse<LoginResponse>>> {
  try {
    const body: LoginRequest = await request.json();
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email harus diisi',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    let user: User | null = null;

    // 1. Try Supabase first if available
    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('users')
          .select('*')
          .ilike('email', body.email)
          .maybeSingle();

        if (data && !error) {
          user = {
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
        }
      } catch {
        // Fallback to store
      }
    }

    // 2. Fallback to server store if not found in Supabase
    if (!user) {
      const store = getServerStore();
      const localFound = store.users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
      if (localFound) user = localFound;
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pengguna dengan email ini tidak ditemukan',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (body.password && user.password !== body.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kata sandi tidak sesuai',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Return sanitized user profile and simulated JWT token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    const token = `jwt_token_${user.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Autentikasi berhasil',
      data: {
        user: safeUser as typeof user,
        token,
      },
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
