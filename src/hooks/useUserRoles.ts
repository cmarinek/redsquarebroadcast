import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export type UserRole = 'broadcaster' | 'screen_owner' | 'admin';

interface UserProfile {
  role: UserRole;
  display_name?: string;
  avatar_url?: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, display_name, avatar_url')
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Default to broadcaster role if profile doesn't exist
      setProfile({ role: 'broadcaster' });
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const isBroadcaster = (): boolean => hasRole('broadcaster');
  const isScreenOwner = (): boolean => hasRole('screen_owner');
  const isAdmin = (): boolean => hasRole('admin');

  return {
    profile,
    loading,
    hasRole,
    isBroadcaster,
    isScreenOwner,
    isAdmin,
    refetch: fetchUserProfile
  };
};