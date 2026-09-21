// ============================================================
// AksesPangan — Constants & Configuration
// ============================================================

import type { Coordinates } from '@/types';

// App info
export const APP_NAME = 'AksesPangan';
export const APP_TAGLINE = 'From Surplus to Solution — Rescuing Food, Reducing Hunger, Cutting Emissions';
export const APP_DESCRIPTION = 'Real-time surplus food redistribution network connecting culinary businesses with communities.';

// Default coordinates (Bandung / Bojongsoang area)
export const DEFAULT_CENTER: Coordinates = {
  lat: -6.9692,
  lng: 107.6325,
};

// Map settings
export const MAP_CONFIG = {
  defaultZoom: 13,
  minZoom: 10,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

// CO₂e calculation factor
export const CO2E_FACTOR = 2.5; // 1 kg food waste ≈ 2.5 kg CO₂e
export const TREE_CO2_ABSORPTION = 22; // 1 tree absorbs ~22 kg CO₂/year

// Booking settings
export const PICKUP_WINDOW_HOURS = 2; // hours after confirmation to pick up
export const BOOKING_CHECK_INTERVAL = 30000; // check booking status every 30s

// Max distances for filter
export const DISTANCE_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: 'All Distances', value: 999 },
];

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  countUp: 2000,
  stagger: 100,
  pageTransition: 300,
};

// localStorage keys
export const STORAGE_KEYS = {
  users: 'aksespangan_users',
  surplusItems: 'aksespangan_surplus',
  bookings: 'aksespangan_bookings',
  notifications: 'aksespangan_notifications',
  currentUser: 'aksespangan_current_user',
  impactData: 'aksespangan_impact',
  isSeeded: 'aksespangan_seeded',
  chatMessages: 'aksespangan_chat_messages',
  complaints: 'aksespangan_complaints',
  qualityStandards: 'aksespangan_quality_standards',
  esgConfig: 'aksespangan_esg_config',
};

// Navigation items
export const NAV_ITEMS = {
  penyedia: [
    { label: 'Dashboard', href: '/penyedia', icon: 'LayoutDashboard' },
    { label: 'My Surplus', href: '/penyedia/surplus', icon: 'Package' },
    { label: 'Incoming Bookings', href: '/penyedia/booking', icon: 'ClipboardList' },
    { label: 'History', href: '/penyedia/history', icon: 'History' },
  ],
  penerima: [
    { label: 'Explore Food', href: '/penerima', icon: 'MapPin' },
    { label: 'My Orders', href: '/penerima/booking', icon: 'ShoppingBag' },
    { label: 'History', href: '/penerima/history', icon: 'History' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Users', href: '/admin/users', icon: 'Users' },
    { label: 'Transactions', href: '/admin/transactions', icon: 'Receipt' },
  ],
  shared: [
    { label: 'Impact', href: '/dashboard', icon: 'BarChart3' },
    { label: 'Terms', href: '/terms', icon: 'FileText' },
  ],
};

// Food safety high-risk categories
export const HIGH_RISK_FOODS = ['lauk']; // Initially limit high-risk foods
export const FOOD_SAFETY_WARNING = 'This item falls into a high-risk category. Ensure it is consumed promptly after pickup and inspect food condition before consumption.';

// Demo user credentials
export const DEMO_CREDENTIALS = {
  penyedia: { email: 'restoran@demo.com', password: 'demo123' },
  penerima: { email: 'penerima@demo.com', password: 'demo123' },
  admin: { email: 'admin@demo.com', password: 'admin123' },
};
