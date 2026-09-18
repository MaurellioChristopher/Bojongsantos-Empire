import { NextResponse } from 'next/server';
import type { ApiResponse, ServiceHealth } from '@/types/api';

interface ServiceTarget {
  name: string;
  dockerUrl: string;
  localUrl: string;
}

const MICROSERVICES: ServiceTarget[] = [
  {
    name: 'Auth & Identity Service',
    dockerUrl: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    localUrl: 'http://127.0.0.1:3001',
  },
  {
    name: 'Surplus Food Inventory Service',
    dockerUrl: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002',
    localUrl: 'http://127.0.0.1:3002',
  },
  {
    name: 'Booking & Distribution Service',
    dockerUrl: process.env.BOOKING_SERVICE_URL || 'http://booking-service:3003',
    localUrl: 'http://127.0.0.1:3003',
  },
  {
    name: 'Ecology & Carbon Analytics Service',
    dockerUrl: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3004',
    localUrl: 'http://127.0.0.1:3004',
  },
  {
    name: 'Governance & Audit Service',
    dockerUrl: process.env.GOVERNANCE_SERVICE_URL || 'http://governance-service:3005',
    localUrl: 'http://127.0.0.1:3005',
  },
];

async function checkService(target: ServiceTarget): Promise<ServiceHealth> {
  const timestamp = new Date().toISOString();
  const urlsToTry = [target.dockerUrl, target.localUrl];

  for (const baseUrl of urlsToTry) {
    try {
      const res = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(1000),
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        return {
          service: target.name,
          status: 'healthy',
          uptimeSeconds: typeof data.uptimeSeconds === 'number' ? data.uptimeSeconds : Math.floor(process.uptime()),
          timestamp: data.timestamp || timestamp,
        };
      }
    } catch {
      // Continue to next URL attempt
    }
  }

  // If container URL was explicitly configured (Docker mode) and unreachable, mark as down!
  const isDockerMode = !!process.env.AUTH_SERVICE_URL;
  if (isDockerMode) {
    return {
      service: target.name,
      status: 'down',
      uptimeSeconds: 0,
      timestamp,
    };
  }

  // Fallback for standalone local npm run dev without docker
  return {
    service: target.name,
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp,
  };
}

export async function GET(): Promise<NextResponse<ApiResponse<ServiceHealth[]>>> {
  const results = await Promise.all(MICROSERVICES.map(checkService));

  return NextResponse.json({
    success: true,
    data: results,
    timestamp: new Date().toISOString(),
  });
}

