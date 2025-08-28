
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = 'advertiser' | 'broadcaster' | 'screen_owner' | 'admin';

interface UserProfile {
  display_name?: string;
  avatar_url?: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch minimal profile info
      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (pErr) {
        console.warn("Error fetching user profile:", pErr);
      }
      setProfile(p ?? null);

      // Fetch roles from user_roles (multi-role)
      const { data: r, error: rErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id);
      if (rErr) {
        console.warn("Error fetching user roles:", rErr);
        setRoles([]);
      } else {
        const list = (r ?? []).map((row: any) => row.role as UserRole);
        setRoles(list);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => roles.includes(role);
  const isAdvertiser = (): boolean => hasRole('advertiser') || hasRole('broadcaster'); // Backward compatibility
  const isBroadcaster = (): boolean => hasRole('advertiser') || hasRole('broadcaster'); // Legacy compatibility
  const isScreenOwner = (): boolean => hasRole('screen_owner');
  const isAdmin = (): boolean => hasRole('admin');

  return {
    profile,
    roles,
    loading,
    hasRole,
    isAdvertiser,
    isBroadcaster, // Keep for backward compatibility
    isScreenOwner,
    isAdmin,
    refetch: fetchUserData,
  };
};
