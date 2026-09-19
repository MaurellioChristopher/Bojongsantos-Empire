import { NextResponse } from 'next/server';
import { getServerStore } from '@/lib/serverStore';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types/api';
import type { ChatMessage, UserRole } from '@/types';

interface SendChatMessageRequest {
  id?: string;
  bookingId?: string;
  complaintId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string;
  message: string;
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<ChatMessage[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const complaintId = searchParams.get('complaintId');
    const conversationId = bookingId || complaintId;

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter bookingId atau complaintId diperlukan',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const messagesMap = new Map<string, ChatMessage>();

    // 1. Fetch from Supabase cloud database
    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('chat_messages')
          .select('*')
          .or(`booking_id.eq.${conversationId},complaint_id.eq.${conversationId}`)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          data.forEach((row: any) => {
            messagesMap.set(row.id, {
              id: row.id,
              bookingId: row.booking_id || row.complaint_id,
              complaintId: row.complaint_id,
              senderId: row.sender_id,
              senderName: row.sender_name,
              senderRole: row.sender_role as UserRole,
              message: row.message,
              createdAt: row.created_at,
              isRead: true,
            });
          });
        }
      } catch (err) {
        console.warn('Supabase chat fetch fallback:', err);
      }
    }

    // 2. Merge with Server memory store
    const store = getServerStore();
    if (store.chatMessages) {
      store.chatMessages
        .filter((m) => m.bookingId === conversationId || m.complaintId === conversationId)
        .forEach((m) => {
          if (!messagesMap.has(m.id)) {
            messagesMap.set(m.id, m);
          }
        });
    }

    const result = Array.from(messagesMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<ChatMessage>>> {
  try {
    const body: SendChatMessageRequest = await request.json();

    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pesan tidak boleh kosong',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const conversationId = body.bookingId || body.complaintId;
    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'bookingId atau complaintId diperlukan',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const newMsg: ChatMessage = {
      id: body.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookingId: body.bookingId,
      complaintId: body.complaintId,
      senderId: body.senderId,
      senderName: body.senderName,
      senderRole: body.senderRole,
      recipientId: body.recipientId,
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // 1. Sync to Supabase cloud database
    const supabaseServer = getSupabaseServerClient();
    if (supabaseServer) {
      try {
        await supabaseServer.from('chat_messages').insert({
          id: newMsg.id,
          complaint_id: conversationId,
          sender_id: newMsg.senderId,
          sender_name: newMsg.senderName,
          sender_role: newMsg.senderRole,
          message: newMsg.message,
          created_at: newMsg.createdAt,
        });
      } catch (err) {
        console.warn('Supabase chat insert warning:', err);
      }
    }

    // 2. Sync to Server memory store
    const store = getServerStore();
    if (!store.chatMessages) {
      store.chatMessages = [];
    }
    store.chatMessages.push(newMsg);

    return NextResponse.json(
      {
        success: true,
        data: newMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
