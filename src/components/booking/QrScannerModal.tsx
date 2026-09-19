'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import jsQR from 'jsqr';

interface QrScanPayload {
  bookingId: string;
  pin: string;
  surplusId?: string;
  recipientId?: string;
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when a valid QR payload matching expectedBookingId is decoded */
  onScan: (payload: QrScanPayload) => void;
  expectedBookingId: string;
}

type ScanState = 'requesting' | 'scanning' | 'found' | 'error_camera' | 'error_mismatch';

export function QrScannerModal({ isOpen, onClose, onScan, expectedBookingId }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [scanState, setScanState] = useState<ScanState>('requesting');
  const [errorMsg, setErrorMsg] = useState('');

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      try {
        const payload: QrScanPayload = JSON.parse(code.data);
        if (payload.bookingId && payload.pin) {
          if (payload.bookingId !== expectedBookingId) {
            setScanState('error_mismatch');
            setErrorMsg('QR Code ini bukan untuk pesanan yang sedang diverifikasi.');
            stopCamera();
            return;
          }
          setScanState('found');
          stopCamera();
          // Small delay so user sees success state before modal closes
          setTimeout(() => onScan(payload), 600);
          return;
        }
      } catch {
        // Not a valid JSON payload — keep scanning
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [expectedBookingId, onScan, stopCamera]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanState('requesting');
      setErrorMsg('');
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      setScanState('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setScanState('scanning');
        rafRef.current = requestAnimationFrame(scanFrame);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Permission') || msg.includes('denied') || msg.includes('NotAllowed')) {
          setErrorMsg('Akses kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu coba lagi.');
        } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
          setErrorMsg('Kamera tidak ditemukan di perangkat ini.');
        } else {
          setErrorMsg('Gagal mengakses kamera. Pastikan browser Anda mendukung akses kamera.');
        }
        setScanState('error_camera');
      }
    };

    startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0C2017]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0C2017] rounded-2xl border border-[#2D6A4F]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2D6A4F]/30">
          <div className="flex items-center gap-2.5 text-[#F3F8F5]">
            <Camera size={18} className="text-[#2D6A4F]" />
            <span className="text-sm font-semibold tracking-tight">Pindai QR Code Tiket</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F3F8F5] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative aspect-square w-full bg-black overflow-hidden">
          {/* Live video feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Hidden canvas used for frame analysis */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning overlay — only shown while actively scanning */}
          {scanState === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Dark corners vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_38%,_rgba(0,0,0,0.6)_100%)]" />
              {/* Targeting frame */}
              <div className="relative w-52 h-52">
                {/* Corner brackets */}
                <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#2D6A4F] rounded-tl-md" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#2D6A4F] rounded-tr-md" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#2D6A4F] rounded-bl-md" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#2D6A4F] rounded-br-md" />
                {/* Animated scan line */}
                <div className="absolute left-2 right-2 top-0 animate-scan-line h-0.5 bg-gradient-to-r from-transparent via-[#2D6A4F] to-transparent rounded-full shadow-[0_0_8px_#2D6A4F]" />
              </div>
            </div>
          )}

          {/* States overlaid on top */}
          {scanState === 'requesting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C2017]/90 gap-3">
              <Loader2 size={36} className="text-[#2D6A4F] animate-spin" />
              <p className="text-[#F3F8F5]/80 text-sm text-center px-6">Meminta akses kamera…</p>
            </div>
          )}

          {scanState === 'found' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C2017]/90 gap-3">
              <CheckCircle2 size={48} className="text-[#2D6A4F]" />
              <p className="text-[#F3F8F5] font-semibold text-sm">QR Code Terdeteksi!</p>
            </div>
          )}

          {(scanState === 'error_camera' || scanState === 'error_mismatch') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C2017]/90 gap-3 p-6">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-red-300 text-sm text-center leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-4 border-t border-[#2D6A4F]/30">
          {scanState === 'scanning' && (
            <p className="text-[#F3F8F5]/60 text-xs text-center">
              Arahkan kamera ke QR Code pada tiket penerima
            </p>
          )}
          {(scanState === 'error_camera' || scanState === 'error_mismatch') && (
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1E5038] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup & Masukkan PIN Manual
            </button>
          )}
          {scanState === 'requesting' && (
            <p className="text-[#F3F8F5]/50 text-xs text-center">Menunggu izin akses kamera…</p>
          )}
        </div>
      </div>
    </div>
  );
}
