// Production-ready type definitions aligned with Supabase database schema

// Database enums and types
export type AppRole = 'admin' | 'moderator' | 'user';
export type UserRole = 'broadcaster' | 'screen_owner' | 'admin' | 'advertiser' | 'support';
export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type BuildStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'cancelled';
export type DeviceStatusType = 'idle' | 'playing' | 'error' | 'offline';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type IntervalType = 'month' | 'year';
export type DirectionType = 'ltr' | 'rtl';
export type ConnectionType = 'dongle' | 'smart_tv';
export type PlatformType = 'android' | 'ios' | 'tv' | 'desktop';

// Type casting utilities
export const castToBookingStatus = (status: string): BookingStatus => {
  return ['pending', 'active', 'completed', 'cancelled'].includes(status) 
    ? status as BookingStatus 
    : 'pending';
};

export const castToPaymentStatus = (status: string): PaymentStatus => {
  return ['pending', 'completed', 'failed', 'refunded'].includes(status)
    ? status as PaymentStatus
    : 'pending';
};

export const castToBuildStatus = (status: string): BuildStatus => {
  return ['pending', 'in_progress', 'success', 'failed', 'cancelled'].includes(status)
    ? status as BuildStatus
    : 'pending';
};

export const castToDeviceStatus = (status: string): DeviceStatusType => {
  return ['idle', 'playing', 'error', 'offline'].includes(status)
    ? status as DeviceStatusType
    : 'offline';
};

export const castToIntervalType = (interval: string): IntervalType => {
  return ['month', 'year'].includes(interval) ? interval as IntervalType : 'month';
};

export const castToDirectionType = (direction: string): DirectionType => {
  return ['ltr', 'rtl'].includes(direction) ? direction as DirectionType : 'ltr';
};

export const castToPlatformType = (platform: string): PlatformType => {
  return ['android', 'ios', 'tv', 'desktop'].includes(platform) 
    ? platform as PlatformType 
    : 'android';
};

// Core database table interfaces
export interface Screen {
  id: string;
  name?: string;
  size?: string;
  location: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country_id: string;
  owner_user_id: string;
  price_per_hour: number;
  currency: string;
  local_currency?: string;
  exchange_rate?: number;
  availability_start?: string;
  availability_end?: string;
  is_active?: boolean;
  qr_code_url?: string;
  group_id?: string;
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  screen_id: string;
  content_upload_id: string;
  start_time: string;
  duration_minutes: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  amount_cents?: number;
  currency: string;
  local_currency?: string;
  exchange_rate?: number;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentUpload {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_url?: string; // Optional computed field for display
  file_type: string;
  file_size: number;
  screen_id?: string;
  moderation_status?: ModerationStatus;
  moderation_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceStatus {
  id: string;
  screen_id: string;
  device_id?: string;
  status: DeviceStatusType;
  current_booking_id?: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  device_id: string;
  owner_user_id: string;
  screen_id?: string;
  screen_name?: string;
  status: string;
  provisioning_token: string;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface AppBuild {
  id: string;
  app_type: string;
  version: string;
  status: BuildStatus;
  triggered_by: string;
  commit_hash?: string;
  artifact_url?: string;
  logs_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppRelease {
  id: string;
  platform: PlatformType;
  version_name: string;
  version_code: number;
  file_path: string;
  file_size: number;
  file_extension: string;
  bundle_id?: string;
  minimum_os_version?: string;
  release_notes?: string;
  is_active: boolean;
  download_count: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval_type: IntervalType;
  features: string[];
  max_screens?: number;
  max_campaigns?: number;
  analytics_retention_days: number;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused';
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  plan?: SubscriptionPlan;
}

export interface Language {
  id: string;
  code: string;
  name: string;
  display_name: string;
  direction: DirectionType;
  is_active: boolean;
  created_at?: string;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  display_name: string;
  currency_code: string;
  phone_prefix?: string;
  tax_rate?: number;
  is_active?: boolean;
  region_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places?: number;
  exchange_rate?: number;
  is_active?: boolean;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  display_name?: string;
  timezone: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Profile {
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  role: string;
  stripe_account_id?: string;
  has_completed_advertiser_onboarding: boolean;
  has_completed_screen_owner_onboarding: boolean;
  has_completed_broadcaster_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  booking_id: string;
  amount_cents: number;
  currency: string;
  local_currency?: string;
  exchange_rate?: number;
  status: PaymentStatus;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  platform_fee_cents: number;
  owner_amount_cents: number;
  created_at: string;
  updated_at: string;
}

// Computed/derived interfaces for UI components
export interface ScreenData extends Screen {
  bookings_count?: number;
  total_earnings?: number;
  bookings?: Booking[];
}

export interface DeviceWithStatus extends Device {
  connection_type?: ConnectionType;
  signal_strength?: number;
  uptime?: number;
  current_content?: string;
  last_heartbeat?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}