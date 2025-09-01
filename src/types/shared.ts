// Shared interfaces and types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
}

export interface Screen extends BaseEntity {
  screen_name: string;
  address: string;
  city: string;
  is_active: boolean;
}

export interface DeviceMetrics {
  bitrate_kbps: number;
  bandwidth_kbps: number;
  buffer_seconds: number;
  created_at: string;
}

export interface SystemAlert {
  id: string;
  screen_id: string;
  alert_type: 'connection' | 'performance' | 'maintenance' | 'error';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  created_at: string;
}

// Status enums
export type DeviceStatusType = 'online' | 'offline' | 'error' | 'idle' | 'playing';
export type ConnectionType = 'dongle' | 'smart_tv';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';