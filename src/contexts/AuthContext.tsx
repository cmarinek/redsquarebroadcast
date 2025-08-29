
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionData | null;
  checkingSubscription: boolean;
  refreshSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const ensureProfileRow = useCallback(async (u: User | null) => {
    if (!u) return;

    type AllowedRole = 'broadcaster' | 'screen_owner' | 'admin';
    const allowedRoles: AllowedRole[] = ['broadcaster', 'screen_owner', 'admin'];

    const md = u.user_metadata ?? {};
    const rawRole = typeof md.role === 'string' ? md.role : undefined;
    const desiredRole: AllowedRole = allowedRoles.includes(rawRole as AllowedRole)
      ? (rawRole as AllowedRole)
      : 'broadcaster';
    const displayName = typeof md.display_name === 'string' && md.display_name.trim() ? md.display_name.trim() : null;
    const avatarUrl = typeof md.avatar_url === 'string' && md.avatar_url.trim() ? md.avatar_url.trim() : null;

    const { data: existing, error: selectErr } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .eq('user_id', u.id)
      .maybeSingle();

    if (selectErr && (selectErr as { code: string }).code !== 'PGRST116') {
      console.warn('[ensureProfileRow] select profile failed:', selectErr);
    }

    if (!existing) {
      const { error: insertErr } = await supabase.from('profiles').insert({
        user_id: u.id,
        display_name: displayName ?? undefined,
        avatar_url: avatarUrl ?? undefined,
      });
      if (insertErr) {
        console.warn('[ensureProfileRow] insert failed:', insertErr);
      }
    } else {
      const patch: { display_name?: string; avatar_url?: string } = {};
      if (!existing.display_name && displayName) patch.display_name = displayName;
      if (!existing.avatar_url && avatarUrl) patch.avatar_url = avatarUrl;

      if (Object.keys(patch).length > 0) {
        const { error: updateErr } = await supabase.from('profiles').update(patch).eq('user_id', u.id);
        if (updateErr) {
          console.warn('[ensureProfileRow] update failed:', updateErr);
        }
      }
    }

    try {
      const { data: rolesData, error: rolesErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', u.id);
      if (rolesErr) {
        console.warn('[ensureProfileRow] roles select failed:', rolesErr);
        return;
      }
      const roles = (rolesData || []).map((r: { role: string }) => r.role);
      if (roles.length === 0) {
        const initialRole = desiredRole === 'admin' ? 'broadcaster' : desiredRole;
        const { error: insertRoleErr } = await supabase
          .from('user_roles')
          .insert({ user_id: u.id, role: initialRole });
        if (insertRoleErr) {
          console.warn('[ensureProfileRow] role insert failed:', insertRoleErr);
        } else {
          console.log('[ensureProfileRow] assigned initial role', initialRole);
        }
      }
    } catch (e) {
      console.warn('[ensureProfileRow] roles ensure failed:', e);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (!session) return;
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      const subData = data as Partial<SubscriptionData> | null;
      setSubscription({
        subscribed: !!subData?.subscribed,
        subscription_tier: subData?.subscription_tier ?? null,
        subscription_end: subData?.subscription_end ?? null,
      });
    } catch (e) {
      console.error('Error checking subscription:', e);
    } finally {
      setCheckingSubscription(false);
    }
  }, [session]);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        if (newSession?.user) {
          ensureProfileRow(newSession.user);
          refreshSubscription();
        } else {
          setSubscription(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        ensureProfileRow(initialSession.user);
        refreshSubscription();
      }
      setLoading(false);
    });

    return () => {
      authSub.unsubscribe();
    };
  }, [ensureProfileRow, refreshSubscription]);

  const signOut = async () => {
    type SupabaseAuthWithScope = SupabaseClient['auth'] & {
      signOut(options: { scope: 'global' | 'local' }): Promise<{ error: Error | null }>;
    };

    try {
      cleanupAuthState();
      try {
        await (supabase.auth as SupabaseAuthWithScope).signOut({ scope: 'global' });
      } catch {
        await supabase.auth.signOut();
      }
    } finally {
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    checkingSubscription,
    refreshSubscription,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
