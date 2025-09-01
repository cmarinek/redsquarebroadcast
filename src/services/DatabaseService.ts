import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/useUserRoles";

export class DatabaseService {
  // User and Role Management
  static async getAllUsers() {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    if (!authUsers.users.length) return [];

    const userIds = authUsers.users.map(u => u.id);
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, created_at")
      .in("user_id", userIds);
    
    if (profilesError) throw profilesError;

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));
    
    return authUsers.users.map(user => ({
      user_id: user.id,
      display_name: profilesMap.get(user.id)?.display_name || user.email || 'Unknown User',
      avatar_url: profilesMap.get(user.id)?.avatar_url,
      created_at: profilesMap.get(user.id)?.created_at || user.created_at,
      email: user.email
    }));
  }

  static async getUserRoles(userIds: string[]) {
    if (userIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", userIds);
    
    if (error) throw error;
    return data || [];
  }

  static async toggleUserRole(userId: string, role: UserRole, isActive: boolean) {
    if (isActive) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      
      if (error) throw error;
      return { action: 'removed', role };
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      
      if (error) throw error;
      return { action: 'added', role };
    }
  }

  // Device Management
  static async getDeviceStatuses(screenId?: string) {
    let query = supabase
      .from('device_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (screenId) {
      query = query.eq('screen_id', screenId);
    }

    const { data, error } = await query.limit(10);
    if (error) throw error;
    return data || [];
  }

  static async getDeviceMetrics(screenId: string) {
    const { data, error } = await supabase
      .from('device_metrics')
      .select('bitrate_kbps, bandwidth_kbps, buffer_seconds, created_at')
      .eq('screen_id', screenId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data?.[0] || null;
  }

  static async sendDeviceCommand(screenId: string, command: string) {
    const { error } = await supabase.functions.invoke('device-commands', {
      body: { action: command, screen_id: screenId }
    });
    
    if (error) throw error;
    return { success: true };
  }

  // System Health
  static async getSystemHealth() {
    const { data, error } = await supabase
      .from('admin_system_health')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data || [];
  }

  static async getSecurityAlerts() {
    const { data, error } = await supabase
      .from('admin_security_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data || [];
  }
}