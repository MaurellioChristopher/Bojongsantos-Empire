// ============================================================
// AksesPangan — Cross-Device Cloud Chat Microservice Client
// ============================================================

import { requestApi } from './apiClient';
import type { ChatMessage, UserRole } from '@/types';
import * as localData from '@/lib/data';

export const chatService = {
  /**
   * Fetch all messages for a specific booking (merging Cloud & Local store)
   */
  async getMessages(bookingId: string): Promise<ChatMessage[]> {
    const local = localData.getOrderChatMessages(bookingId);
    try {
      const remote = await requestApi<ChatMessage[]>(`/api/chat?bookingId=${encodeURIComponent(bookingId)}`);
      
      const map = new Map<string, ChatMessage>();
      remote.forEach((m) => map.set(m.id, m));
      local.forEach((m) => {
        if (!map.has(m.id)) {
          map.set(m.id, m);
        }
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Cache all remote messages into local storage for offline reading
      merged.forEach((m) => localData.saveChatMessage(m));

      return merged;
    } catch {
      return local;
    }
  },

  /**
   * Send a new message across devices via Cloud API & Supabase
   */
  async sendMessage(data: {
    bookingId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    recipientId?: string;
    message: string;
  }): Promise<ChatMessage> {
    // 1. Save locally first (optimistic UI)
    const localMsg = localData.sendOrderChatMessage(data);

    // 2. Transmit to Cloud API
    try {
      const cloudMsg = await requestApi<ChatMessage>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: data.bookingId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,
          recipientId: data.recipientId,
          message: data.message,
        }),
      });
      localData.saveChatMessage(cloudMsg);
      return cloudMsg;
    } catch {
      return localMsg;
    }
  },

  /**
   * Fetch all messages for a complaint
   */
  async getComplaintMessages(complaintId: string): Promise<ChatMessage[]> {
    try {
      return await requestApi<ChatMessage[]>(`/api/chat?complaintId=${encodeURIComponent(complaintId)}`);
    } catch {
      return [];
    }
  },

  /**
   * Send reply to complaint
   */
  async sendComplaintReply(data: {
    complaintId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
  }): Promise<ChatMessage> {
    const cloudMsg = await requestApi<ChatMessage>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return cloudMsg;
  },
};
