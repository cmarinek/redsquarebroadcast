import { useState, useEffect, useCallback } from "react";
import { DatabaseService } from "@/services/DatabaseService";
import { NotificationService } from "@/services/NotificationService";
import { supabase } from "@/integrations/supabase/client";

export interface DeviceStatus {
  id: string;
  screen_id: string;
  screen_name?: string;
  status: 'online' | 'offline' | 'error';
  last_heartbeat?: string;
  last_seen: string;
  connection_type?: 'dongle' | 'smart_tv';
  signal_strength?: number;
  current_content?: string;
  uptime?: number;
  device_id: string;
  current_booking_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PlaybackMetric {
  bitrate_kbps: number;
  bandwidth_kbps: number;
  buffer_seconds: number;
  created_at: string;
}

export const useDeviceMonitoring = (screenId?: string) => {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [latestMetric, setLatestMetric] = useState<PlaybackMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeviceData = useCallback(async () => {
    try {
      const deviceData = await DatabaseService.getDeviceStatuses(screenId);
      setDevices(deviceData.map(device => ({
        ...device,
        status: device.status as 'online' | 'offline' | 'error'
      })));

      if (screenId) {
        const metric = await DatabaseService.getDeviceMetrics(screenId);
        setLatestMetric(metric);
      }
    } catch (error) {
      console.error('Error fetching device data:', error);
      NotificationService.error("Failed to fetch device monitoring data");
    }
  }, [screenId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeviceData();
    setRefreshing(false);
  }, [fetchDeviceData]);

  const restartDevice = useCallback(async (deviceScreenId: string) => {
    try {
      await DatabaseService.sendDeviceCommand(deviceScreenId, 'restart');
      NotificationService.deviceCommandSent('Restart');
    } catch (error) {
      NotificationService.deviceError('restart', error instanceof Error ? error.message : undefined);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchDeviceData();
      setLoading(false);
    };

    initializeData();

    // Set up real-time monitoring
    const channel = supabase
      .channel('device-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_status'
        },
        () => {
          fetchDeviceData();
        }
      )
      .subscribe();

    // Periodic updates
    const interval = setInterval(fetchDeviceData, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchDeviceData]);

  return {
    devices,
    latestMetric,
    loading,
    refreshing,
    refresh,
    restartDevice,
  };
};