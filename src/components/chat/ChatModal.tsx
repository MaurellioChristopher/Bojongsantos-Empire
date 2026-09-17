'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Shield, Clock, CheckCheck, User, Store, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import {
  getOrderChatMessages,
  sendOrderChatMessage,
  replyAdminComplaint,
  sendAdminComplaint,
} from '@/lib/data';
import type { Booking, ChatMessage, AdminComplaint } from '@/types';

interface OrderChatProps {
  type: 'order';
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

interface ComplaintChatProps {
  type: 'complaint';
  complaint?: AdminComplaint;
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted?: () => void;
}

export type ChatModalProps = OrderChatProps | ComplaintChatProps;

export function ChatModal(props: ChatModalProps) {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  // For new complaint form
  const [subject, setSubject] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!props.isOpen) return;

    if (props.type === 'order') {
      const msgs = getOrderChatMessages(props.booking.id);
      setMessages(msgs);
    } else if (props.type === 'complaint' && props.complaint) {
      setMessages(props.complaint.replies || []);
    }
  }, [props.isOpen, props]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!props.isOpen || !user) return null;

  const handleSendOrderMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || props.type !== 'order') return;

    const isPenyedia = user.role === 'penyedia';
    const recipientId = isPenyedia ? props.booking.recipientId : props.booking.providerId;

    const sent = sendOrderChatMessage({
      bookingId: props.booking.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      recipientId,
      message: newMessage.trim(),
    });

    setMessages((prev) => [...prev, sent]);
    setNewMessage('');
  };

  const handleSendComplaintReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || props.type !== 'complaint' || !props.complaint) return;

    const reply = replyAdminComplaint(
      props.complaint.id,
      user.id,
      user.name,
      user.role,
      newMessage.trim()
    );

    if (reply) {
      setMessages((prev) => [...prev, reply]);
      setNewMessage('');
    }
  };

  const handleCreateNewComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !complaintText.trim()) {
      error('Form Belum Lengkap', 'Mohon isi judul dan rincian keluhan Anda.');
      return;
    }

    sendAdminComplaint({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      subject: subject.trim(),
      message: complaintText.trim(),
    });

    success('Keluhan Terkirim', 'Tim Admin AksesPangan akan segera menindaklanjuti kendala Anda.');
    if (props.type === 'complaint' && props.onComplaintSubmitted) {
      props.onComplaintSubmitted();
    }
    props.onClose();
  };

  const isOrderMode = props.type === 'order';
  const isExistingComplaint = props.type === 'complaint' && !!props.complaint;
  const isNewComplaint = props.type === 'complaint' && !props.complaint;

  // Title & Header Information
  let title = '';
  let subtitle = '';

  if (isOrderMode) {
    const isPenyedia = user.role === 'penyedia';
    title = isPenyedia ? `Chat dengan ${props.booking.recipientName}` : `Chat dengan ${props.booking.providerBusinessName}`;
    subtitle = `Pesanan: ${props.booking.surplusName} (${props.booking.quantity} kg) — ${props.booking.pickupAddress}`;
  } else if (isExistingComplaint) {
    title = `Tiket: ${props.complaint?.subject}`;
    subtitle = `Dari: ${props.complaint?.userName} (${props.complaint?.userRole.toUpperCase()}) — Status: ${props.complaint?.status.toUpperCase()}`;
  } else {
    title = 'Sampaikan Keluhan ke Admin';
    subtitle = 'Layanan bantuan & resolusi kendala operasional ekosistem AksesPangan';
  }

  const quickReplies = isOrderMode
    ? user.role === 'penyedia'
      ? [
          'Pesanan sudah kami konfirmasi, makanan siap diambil.',
          'Halo, bisa konfirmasi estimasi jam penjemputan?',
          'Silakan langsung menuju ke kasir / bagian penyerahan makanan.',
        ]
      : [
          'Halo, saya sudah memesan ini. Apakah siap disiapkan?',
          'Saya sedang dalam perjalanan menuju lokasi.',
          'Perkiraan sampai sekitar 15 menit lagi.',
          'Terima kasih banyak, makanan telah saya terima dengan baik!',
        ]
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-black/10 max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#18181b] text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
              >
                {isOrderMode ? <Store size={18} /> : <Shield size={18} />}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-white truncate m-0">{title}</h3>
                <p className="text-[11px] text-white/70 truncate m-0">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={props.onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: New Complaint Form OR Chat Thread */}
          {isNewComplaint ? (
            <form onSubmit={handleCreateNewComplaint} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle size={16} className="text-[#FF5A1F] flex-shrink-0 mt-0.5" />
                <span>
                  Admin AksesPangan memantau keluhan pengguna 24/7 untuk memastikan keadilan, keselamatan mutu pangan, dan kelancaran transaksi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Subjek / Pokok Kendala
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Contoh: Kendala pengambilan pesanan / Lokasi penyedia tutup"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#FF5A1F] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Rincian Keluhan
                </label>
                <textarea
                  required
                  rows={4}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Jelaskan kendala secara rinci, cantumkan nama penyedia/penerima atau nomor pesanan terkait jika ada..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:border-[#FF5A1F] text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={props.onClose}
                  className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-black"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-apple-primary text-sm py-2.5 px-6 flex items-center gap-2"
                >
                  <span>Kirim Keluhan</span>
                  <Send size={14} />
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#fafafa] min-h-[300px] max-h-[420px]">
                {/* Initial Info Card for Complaints */}
                {isExistingComplaint && (
                  <div className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs mb-4">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                      <span className="font-semibold text-neutral-800">{props.complaint?.userName}</span>
                      <span>{new Date(props.complaint?.createdAt || '').toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-xs text-neutral-700 font-medium m-0">{props.complaint?.message}</p>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-neutral-400">
                    <MessageSquare size={36} className="mb-2 text-neutral-300" />
                    <p className="text-xs">Belum ada percakapan.</p>
                    <p className="text-[11px] text-neutral-400 max-w-xs mt-1">
                      {isOrderMode
                        ? 'Gunakan obrolan ini untuk koordinasi penjemputan dan verifikasi kondisi makanan.'
                        : 'Balasan dari admin akan tampil di sini.'}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-semibold text-neutral-500">
                            {isMe ? 'Anda' : msg.senderName}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full uppercase bg-neutral-200 text-neutral-600 font-mono">
                            {msg.senderRole}
                          </span>
                        </div>
                        <div
                          className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isMe
                              ? 'text-white rounded-tr-xs'
                              : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-xs'
                          }`}
                          style={
                            isMe
                              ? { background: 'linear-gradient(135deg, #FFB200, #FF5A1F 60%, #FF3913)' }
                              : {}
                          }
                        >
                          <p className="m-0 break-words">{msg.message}</p>
                        </div>
                        <span className="text-[9px] text-neutral-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies for Orders */}
              {isOrderMode && quickReplies.length > 0 && (
                <div className="px-4 py-2 bg-white border-t border-neutral-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewMessage(reply);
                      }}
                      className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer border border-neutral-200"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input Form */}
              <form
                onSubmit={isOrderMode ? handleSendOrderMessage : handleSendComplaintReply}
                className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    isOrderMode
                      ? 'Ketik pesan koordinasi...'
                      : 'Ketik balasan untuk keluhan ini...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-full border border-neutral-300 focus:outline-none focus:border-[#FF5A1F] text-xs sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FFB200, #FF5A1F, #FF3913)' }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
