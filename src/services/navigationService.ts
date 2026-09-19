import type { Coordinates, DeliveryRouteInfo, NavigationStep } from '@/types';

// Earth radius in meters
const EARTH_RADIUS = 6371000;

/**
 * Compute great-circle distance between two points using the Haversine formula (in meters)
 */
export function computeHaversineDistance(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLng = Math.sin(dLng / 2);

  const h =
    sinHalfDLat * sinHalfDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfDLng * sinHalfDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(EARTH_RADIUS * c);
}

/**
 * Calculate geographical bearing angle (0° to 360°) from start to end
 */
export function calculateBearing(start: Coordinates, end: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const phi1 = toRad(start.lat);
  const phi2 = toRad(end.lat);
  const deltaLambda = toRad(end.lng - start.lng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(y, x);
  return (toDeg(theta) + 360) % 360;
}

/**
 * Dynamic Courier Shipping Tariff Calculator (Piecewise Linear Metric)
 * Base Fare (first 2 km): Rp 6.000
 * Extra km: Rp 2.500 / km
 * Food-grade Thermal Bag handling: Rp 1.000
 */
export function calculateDeliveryFee(distanceKm: number): {
  baseFee: number;
  distanceFee: number;
  ecoHandlingFee: number;
  totalFee: number;
  distanceKm: number;
} {
  const roundedKm = Math.max(0.5, Number(distanceKm.toFixed(1)));
  const baseFee = 6000;
  const ecoHandlingFee = 1000;
  const extraKm = Math.max(0, roundedKm - 2.0);
  const distanceFee = Math.ceil(extraKm) * 2500;
  const totalFee = baseFee + distanceFee + ecoHandlingFee;

  return {
    baseFee,
    distanceFee,
    ecoHandlingFee,
    totalFee,
    distanceKm: roundedKm,
  };
}

/**
 * Helper to translate OSRM turn maneuvers into human-friendly Indonesian navigation commands
 */
function parseManeuverInstruction(step: any): string {
  const type = step?.maneuver?.type || '';
  const modifier = step?.maneuver?.modifier || '';
  const street = step?.name ? `ke ${step.name}` : '';

  if (type === 'depart') return `Mulai perjalanan ${street}`;
  if (type === 'arrive') return `Tiba di tujuan ${street}`;
  if (type === 'roundabout') return `Masuk bundaran dan ambil jalan keluar ${street}`;

  switch (modifier) {
    case 'left':
    case 'sharp left':
    case 'slight left':
      return `Belok kiri ${street}`;
    case 'right':
    case 'sharp right':
    case 'slight right':
      return `Belok kanan ${street}`;
    case 'straight':
      return `Lurus terus di ${step?.name || 'jalan utama'}`;
    case 'uturn':
      return `Putar balik ${street}`;
    default:
      return step?.name ? `Terus ikuti ${step.name}` : 'Lanjutkan perjalanan';
  }
}

/**
 * Fallback route generator when offline or OSRM request throttles
 */
function createFallbackRoute(origin: Coordinates, destination: Coordinates): DeliveryRouteInfo {
  const totalMeters = computeHaversineDistance(origin, destination);
  const distanceKm = totalMeters / 1000;
  // Assumes average urban motorbike speed 30 km/h
  const totalDurationSeconds = Math.max(120, Math.round((distanceKm / 30) * 3600));

  // Synthesize realistic polyline with 12 intermediate street coordinates
  const polyline: [number, number][] = [];
  const stepsCount = 12;

  for (let i = 0; i <= stepsCount; i++) {
    const ratio = i / stepsCount;
    // Add subtle curvature to simulate road paths instead of straight line
    const lateralJitter = Math.sin(ratio * Math.PI) * 0.0015;
    const lat = origin.lat + (destination.lat - origin.lat) * ratio + lateralJitter * 0.4;
    const lng = origin.lng + (destination.lng - origin.lng) * ratio + lateralJitter;
    polyline.push([lat, lng]);
  }

  const steps: NavigationStep[] = [
    {
      instruction: 'Mulai bergerak dari lokasi penjemputan',
      distanceMeters: Math.round(totalMeters * 0.25),
      durationSeconds: Math.round(totalDurationSeconds * 0.25),
      modifier: 'straight',
      name: 'Jl. Bojongsoang Raya',
    },
    {
      instruction: 'Belok kanan menuju koridor pengantaran utama',
      distanceMeters: Math.round(totalMeters * 0.45),
      durationSeconds: Math.round(totalDurationSeconds * 0.45),
      modifier: 'right',
      name: 'Jl. Sukabirus',
    },
    {
      instruction: 'Belok kiri mendekati titik alamat penerima',
      distanceMeters: Math.round(totalMeters * 0.3),
      durationSeconds: Math.round(totalDurationSeconds * 0.3),
      modifier: 'left',
      name: 'Jl. Radio Telekomunikasi',
    },
    {
      instruction: 'Tiba di lokasi tujuan penerima pangan surplus',
      distanceMeters: 0,
      durationSeconds: 0,
      modifier: 'arrive',
      name: 'Titik Penerima',
    },
  ];

  return {
    polyline,
    steps,
    totalDistanceMeters: totalMeters,
    totalDurationSeconds,
    etaMinutes: Math.max(3, Math.ceil(totalDurationSeconds / 60)),
  };
}

/**
 * Fetch true road route from Open Source Routing Machine (OSRM)
 */
export async function fetchRoadRoute(
  origin: Coordinates,
  destination: Coordinates
): Promise<DeliveryRouteInfo> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return createFallbackRoute(origin, destination);
    }

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      return createFallbackRoute(origin, destination);
    }

    const route = data.routes[0];
    const geoJsonCoords: [number, number][] = route.geometry.coordinates;

    // Convert [lng, lat] from GeoJSON to [lat, lng] for Leaflet
    const polyline: [number, number][] = geoJsonCoords.map(([lng, lat]) => [lat, lng]);

    // Extract navigation steps
    const rawLegSteps = route.legs?.[0]?.steps || [];
    const steps: NavigationStep[] = rawLegSteps.map((s: any) => ({
      instruction: parseManeuverInstruction(s),
      distanceMeters: Math.round(s.distance || 0),
      durationSeconds: Math.round(s.duration || 0),
      modifier: s.maneuver?.modifier,
      name: s.name,
    }));

    if (steps.length === 0) {
      steps.push({
        instruction: 'Ikuti jalur rute pengantaran tercepat',
        distanceMeters: Math.round(route.distance),
        durationSeconds: Math.round(route.duration),
        modifier: 'straight',
      });
    }

    const totalDistanceMeters = Math.round(route.distance);
    const totalDurationSeconds = Math.round(route.duration);
    const etaMinutes = Math.max(2, Math.ceil(totalDurationSeconds / 60));

    return {
      polyline,
      steps,
      totalDistanceMeters,
      totalDurationSeconds,
      etaMinutes,
    };
  } catch (err) {
    console.warn('OSRM routing fetch failed or timed out, using fallback route generator:', err);
    return createFallbackRoute(origin, destination);
  }
}
