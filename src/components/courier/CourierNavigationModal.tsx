'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  MapPin,
  Store,
  Phone,
  MessageSquare,
  ShieldCheck,
  Star,
  Clock,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  fetchRoadRoute,
  calculateBearing,
  computeHaversineDistance,
} from '@/services/navigationService';
import type { Booking, DeliveryRouteInfo, Coordinates, CourierDriver } from '@/types';

// Leaflet custom icons factory
function createMotorbikePin(bearingDeg: number) {
  return L.divIcon({
    className: 'courier-motorbike-marker',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -50%);
      ">
        <!-- Pulsing Radar Ring -->
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(45, 106, 79, 0.25);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>

        <!-- Rotatable Bike Circle -->
        <div style="
          width: 38px;
          height: 38px;
          background: #143628;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          transform: rotate(${bearingDeg}deg);
          transition: transform 0.3s ease-out;
        ">
          <!-- Arrow Pointer Direction -->
          <div style="
            position: absolute;
            top: -5px;
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-bottom: 7px solid #22C55E;
          "></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18.5" cy="17.5" r="3.5"></circle>
            <circle cx="5.5" cy="17.5" r="3.5"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

function createPlacePin(type: 'store' | 'destination', title: string) {
  const isStore = type === 'store';
  const bgColor = isStore ? '#2D6A4F' : '#E63946';
  const label = isStore ? 'Resto / Donor' : 'Tujuan Penerima';

  return L.divIcon({
    className: 'place-waypoint-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${bgColor};
          color: white;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 999px;
          margin-bottom: 3px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.4);
          white-space: nowrap;
        ">
          ${label}
        </div>
        <div style="
          width: 32px;
          height: 32px;
          background: ${bgColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        ">
          ${
            isStore
              ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>'
              : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
          }
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
}

// Controller to auto center / fit map bounds on polyline
function MapAutoBounds({ polyline }: { polyline: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (polyline && polyline.length > 1) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [map, polyline]);
  return null;
}

interface CourierNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onDeliveryCompleted?: (bookingId: string) => void;
}

export function CourierNavigationModal({
  isOpen,
  onClose,
  booking,
  onDeliveryCompleted,
}: CourierNavigationModalProps) {
  const [routeInfo, setRouteInfo] = useState<DeliveryRouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  // Simulation State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState(38); // Virtual km/h
  const [bearing, setBearing] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Origin (Store) & Destination (Recipient)
  const storeCoords: Coordinates = useMemo(
    () => booking?.pickupLocation || { lat: -6.9735, lng: 107.632 },
    [booking]
  );
  const destCoords: Coordinates = useMemo(
    () => booking?.deliveryCoords || { lat: -6.9785, lng: 107.6385 },
    [booking]
  );

  // Fetch real OSRM road graph
  useEffect(() => {
    if (!isOpen || !booking) return;

    setIsLoadingRoute(true);
    setCurrentIdx(0);
    setIsPlaying(false);
    setHasArrived(false);

    fetchRoadRoute(storeCoords, destCoords)
      .then((res) => {
        setRouteInfo(res);
        setIsLoadingRoute(false);
        // Start auto-play simulation for realistic demo experience
        setIsPlaying(true);
      })
      .catch(() => {
        setIsLoadingRoute(false);
      });
  }, [isOpen, booking, storeCoords, destCoords]);

  // Simulation tick loop
  useEffect(() => {
    if (!isPlaying || !routeInfo || routeInfo.polyline.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        const next = prev + 1;
        if (next >= routeInfo.polyline.length) {
          setIsPlaying(false);
          setHasArrived(true);
          return routeInfo.polyline.length - 1;
        }

        // Calculate heading bearing between current and next point
        const ptA = { lat: routeInfo.polyline[prev][0], lng: routeInfo.polyline[prev][1] };
        const ptB = { lat: routeInfo.polyline[next][0], lng: routeInfo.polyline[next][1] };
        const newBearing = calculateBearing(ptA, ptB);
        setBearing(newBearing);

        // Update active turn instruction step
        const progressRatio = next / routeInfo.polyline.length;
        const totalSteps = routeInfo.steps.length;
        const mappedStepIdx = Math.min(
          totalSteps - 1,
          Math.floor(progressRatio * totalSteps)
        );
        setCurrentStepIdx(mappedStepIdx);

        // Geofence detection (less than 50 meters to destination)
        const distToEnd = computeHaversineDistance(ptB, destCoords);
        if (distToEnd <= 60 && !hasArrived) {
          setHasArrived(true);
        }

        return next;
      });
    }, 450);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, routeInfo, destCoords, hasArrived]);

  if (!isOpen || !booking) return null;

  const courier: CourierDriver = booking.courier || {
    id: 'driver-01',
    name: 'Budi Prasetyo',
    phone: '0812-3456-7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    vehicleType: 'motor',
    plateNumber: 'D 4521 BOJ',
    rating: 4.9,
    totalReviews: 148,
    completedDeliveries: 382,
    badge: 'Top Courier • Food Safety Certified',
    currentCoords: storeCoords,
  };

  const polylineCoords = routeInfo?.polyline || [];
  const currentCourierCoord =
    polylineCoords.length > 0 && currentIdx < polylineCoords.length
      ? polylineCoords[currentIdx]
      : [storeCoords.lat, storeCoords.lng];

  const currentStep = routeInfo?.steps[currentStepIdx] || {
    instruction: 'Lanjutkan perjalanan menuju alamat penerima',
    distanceMeters: 250,
  };

  // Remaining Distance & ETA calculation
  const remainingRatio = polylineCoords.length > 0 ? (polylineCoords.length - currentIdx) / polylineCoords.length : 1;
  const remainingDistanceKm = routeInfo ? Number(((routeInfo.totalDistanceMeters * remainingRatio) / 1000).toFixed(1)) : 0;
  const remainingEtaMinutes = routeInfo ? Math.max(1, Math.ceil(routeInfo.etaMinutes * remainingRatio)) : 5;

  const handleFinishDelivery = () => {
    if (onDeliveryCompleted) {
      onDeliveryCompleted(booking.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-[#0C2017]/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[92vh] bg-[#FFFFFF] rounded-[24px] border border-[#DCE5DB] shadow-2xl overflow-hidden flex flex-col">
        {/* ============================================================
            1. TOP TURN-BY-TURN HUD (APPLE / GOOGLE MAPS STYLE)
            ============================================================ */}
        <div className="bg-[#143628] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md z-20 border-b border-[#2D6A4F]/60">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#2D6A4F] flex items-center justify-center text-[#86EFAC] shadow-inner shrink-0">
              <Navigation size={22} className="rotate-45" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#86EFAC] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                <span>Navigasi Aktif • OSRM Road Graph</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                {currentStep.instruction}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-white">{remainingDistanceKm} km lagi</div>
              <div className="text-[11px] text-white/70">ETA: ~{remainingEtaMinutes} menit</div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Suara Panduan"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ============================================================
            2. LEAFLET INTERACTIVE ROAD MAP CONTAINER
            ============================================================ */}
        <div className="flex-1 relative bg-stone-100">
          {isLoadingRoute ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F9F6] z-30">
              <div className="w-10 h-10 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-sm font-bold text-[#143628]">Menghitung Rute Jalan Raya Nyata (OSRM)...</div>
              <div className="text-xs text-[#597367]">Mengoptimasi rute rendah emisi Bojongsoang</div>
            </div>
          ) : (
            <MapContainer
              center={[storeCoords.lat, storeCoords.lng]}
              zoom={15}
              scrollWheelZoom={true}
              className="w-full h-full"
              style={{ background: '#E5ECE4' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {/* Road Polyline Layer */}
              {polylineCoords.length > 1 && (
                <>
                  {/* Outer Glow Polyline */}
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{ color: '#86EFAC', weight: 8, opacity: 0.6 }}
                  />
                  {/* Inner Road Route Polyline */}
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{ color: '#143628', weight: 4, opacity: 0.95 }}
                  />
                </>
              )}

              {/* Store & Destination Markers */}
              <Marker
                position={[storeCoords.lat, storeCoords.lng]}
                icon={createPlacePin('store', booking.providerBusinessName)}
              />
              <Marker
                position={[destCoords.lat, destCoords.lng]}
                icon={createPlacePin('destination', booking.recipientName)}
              />

              {/* Dynamic Animated Motorbike Courier Marker */}
              <Marker
                position={[currentCourierCoord[0], currentCourierCoord[1]]}
                icon={createMotorbikePin(bearing)}
              />

              <MapAutoBounds polyline={polylineCoords} />
            </MapContainer>
          )}

          {/* Floating Speed & Telemetry Gauge */}
          <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-[#DCE5DB] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EBF7EE] text-[#2D6A4F] flex items-center justify-center font-bold">
              <Gauge size={16} />
            </div>
            <div>
              <div className="text-[10px] text-[#597367] font-semibold">Kecepatan Kurir</div>
              <div className="text-sm font-bold text-[#143628] leading-none">
                {isPlaying ? `${simSpeed} km/h` : '0 km/h (Berhenti)'}
              </div>
            </div>
          </div>

          {/* Geofence Arrival Banner Trigger */}
          <AnimatePresence>
            {hasArrived && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-3 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20 bg-[#2E7D32] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-bold"
              >
                <CheckCircle2 size={18} className="text-[#86EFAC]" />
                <span>Geofence Terpicu: Kurir telah tiba di titik alamat penerima (&le; 50m)!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================
            3. BOTTOM COURIER TELEMETRY & CONTROLS BAR
            ============================================================ */}
        <div className="bg-[#FFFFFF] p-4 sm:p-5 border-t border-[#DCE5DB] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-20">
          {/* Driver Information */}
          <div className="flex items-center gap-3.5">
            <img
              src={courier.avatar}
              alt={courier.name}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-[#DCE5DB] shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#143628]">{courier.name}</h4>
                <span className="text-[10px] bg-[#EBF7EE] text-[#2D6A4F] font-bold px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                  {courier.plateNumber}
                </span>
              </div>
              <div className="text-xs text-[#597367] flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center text-[#FBBF24]">
                  <Star size={12} className="fill-[#FBBF24]" />
                  <span className="font-bold text-[#143628] ml-1">{courier.rating}</span>
                </div>
                <span>• {courier.totalReviews} ulasan</span>
                <span className="text-[#16a34a] font-semibold">({courier.badge})</span>
              </div>
              <div className="text-[11px] text-[#597367] mt-1 flex items-center gap-1">
                <Store size={12} className="text-[#2D6A4F]" />
                <span className="font-medium truncate max-w-[240px]">
                  Dari {booking.providerBusinessName} • {booking.quantity} kg
                </span>
              </div>
            </div>
          </div>

          {/* Simulator & Handshake Action Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Simulation Controls for Jury Demo */}
            <div className="flex items-center bg-[#F7F9F6] p-1 rounded-xl border border-[#DCE5DB]">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg hover:bg-white text-[#143628] transition-all cursor-pointer"
                title={isPlaying ? 'Jeda Simulasi' : 'Jalankan Simulasi'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="text-[#2D6A4F]" />}
              </button>
              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setIsPlaying(true);
                  setHasArrived(false);
                }}
                className="p-2 rounded-lg hover:bg-white text-[#597367] transition-all cursor-pointer"
                title="Mulai Ulang Rute"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Call Button */}
            <a
              href={`tel:${courier.phone}`}
              className="p-2.5 bg-[#EDF2EC] hover:bg-[#DCE5DB] text-[#143628] rounded-xl transition-all cursor-pointer"
              title="Hubungi Kurir"
            >
              <Phone size={16} />
            </a>

            {/* Complete Handshake Button */}
            <button
              onClick={handleFinishDelivery}
              className="flex-1 sm:flex-initial bg-[#2D6A4F] hover:bg-[#1C4736] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={16} />
              <span>{hasArrived ? 'Verifikasi & Terima Pangan' : 'Selesaikan Pengantaran'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
