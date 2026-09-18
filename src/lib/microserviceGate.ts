// ============================================================
// AksesPangan — Microservice Gateway & Availability Validator
// ============================================================

import { NextResponse } from 'next/server';

export const MICROSERVICE_CONFIG = {
  auth: {
    name: 'Auth & Identity Service',
    containerName: 'auth-service-3001',
    port: 3001,
    dockerUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    localUrl: 'http://127.0.0.1:3001',
  },
  inventory: {
    name: 'Surplus Food Inventory Service',
    containerName: 'inventory-food-3002',
    port: 3002,
    dockerUrl: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002',
    localUrl: 'http://127.0.0.1:3002',
  },
  booking: {
    name: 'Booking & Distribution Service',
    containerName: 'booking-order-3003',
    port: 3003,
    dockerUrl: process.env.BOOKING_SERVICE_URL || 'http://booking-service:3003',
    localUrl: 'http://127.0.0.1:3003',
  },
  analytics: {
    name: 'Ecology & Carbon Analytics Service',
    containerName: 'analytics-esg-3004',
    port: 3004,
    dockerUrl: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3004',
    localUrl: 'http://127.0.0.1:3004',
  },
  governance: {
    name: 'Governance & Audit Service',
    containerName: 'governance-audit-3005',
    port: 3005,
    dockerUrl: process.env.GOVERNANCE_SERVICE_URL || 'http://governance-service:3005',
    localUrl: 'http://127.0.0.1:3005',
  },
} as const;

export type MicroserviceKey = keyof typeof MICROSERVICE_CONFIG;

export async function checkMicroserviceHealth(serviceKey: MicroserviceKey): Promise<boolean> {
  const cfg = MICROSERVICE_CONFIG[serviceKey];
  const urlsToTry = [cfg.dockerUrl, cfg.localUrl];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(600),
        cache: 'no-store',
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // try next
    }
  }
  return false;
}

export async function assertMicroserviceAvailable(
  serviceKey: MicroserviceKey
): Promise<{ ok: boolean; errorResponse?: NextResponse }> {
  const isDockerMode = !!process.env.AUTH_SERVICE_URL;

  // In Docker environment, actively enforce container availability
  if (isDockerMode) {
    const isAlive = await checkMicroserviceHealth(serviceKey);
    if (!isAlive) {
      const cfg = MICROSERVICE_CONFIG[serviceKey];
      return {
        ok: false,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: `🚨 [${cfg.name} Offline]: Kontainer '${cfg.containerName}' (Port ${cfg.port}) sedang DIMATIKAN di Docker Desktop. Nyalakan kembali kontainer untuk menggunakan fitur ini!`,
            timestamp: new Date().toISOString(),
          },
          { status: 503 }
        ),
      };
    }
  }

  return { ok: true };
}
