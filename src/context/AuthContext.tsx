
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: {
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  } | null;
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
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  } | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  const refreshSubscription = async () => {
    if (!session) return;
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error as any;
      setSubscription({
        subscribed: !!(data as any)?.subscribed,
        subscription_tier: (data as any)?.subscription_tier ?? null,
        subscription_end: (data as any)?.subscription_end ?? null,
      });
    } catch (e) {
      console.error('Error checking subscription:', e);
    } finally {
      setCheckingSubscription(false);
    }
  };

  // Enhanced: create or patch the profile from user_metadata without overwriting user-changed values
  const ensureProfileRow = async (u: User | null) => {
    if (!u) return;

    const md = (u as any).user_metadata ?? {};
    const rawRole = typeof md.role === 'string' ? md.role : undefined;
    const allowedRoles = ['broadcaster', 'screen_owner', 'admin'] as const;
    const desiredRole = allowedRoles.includes(rawRole as any)
      ? (rawRole as (typeof allowedRoles)[number])
      : 'broadcaster';
    const displayName = typeof md.display_name === 'string' && md.display_name.trim() ? md.display_name.trim() : null;
    const avatarUrl = typeof md.avatar_url === 'string' && md.avatar_url.trim() ? md.avatar_url.trim() : null;

    console.log('[ensureProfileRow] metadata:', { desiredRole, displayName, avatarUrl, raw: md });

    // Read existing profile to avoid overwriting user-changed values
    const { data: existing, error: selectErr } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .eq('user_id', u.id)
      .maybeSingle();

    if (selectErr && (selectErr as any).code !== 'PGRST116') {
      console.warn('[ensureProfileRow] select profile failed:', selectErr);
    }

    if (!existing) {
      console.log('[ensureProfileRow] inserting new profile row');
      const { error: insertErr } = await supabase.from('profiles').insert({
        user_id: u.id,
        display_name: displayName ?? undefined,
        avatar_url: avatarUrl ?? undefined,
      } as any);
      if (insertErr) {
        console.warn('[ensureProfileRow] insert failed:', insertErr);
      }
    } else {
      // Prepare minimal patch only for missing fields
      const patch: Record<string, any> = {};
      if (!existing.display_name && displayName) patch.display_name = displayName;
      if (!existing.avatar_url && avatarUrl) patch.avatar_url = avatarUrl;

      if (Object.keys(patch).length > 0) {
        console.log('[ensureProfileRow] updating profile with patch:', patch);
        const { error: updateErr } = await supabase.from('profiles').update(patch).eq('user_id', u.id);
        if (updateErr) {
          console.warn('[ensureProfileRow] update failed:', updateErr);
        }
      } else {
        console.log('[ensureProfileRow] no profile update needed');
      }
    }

    // Ensure at least one non-admin role exists in user_roles for this user
    try {
      const { data: rolesData, error: rolesErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', u.id);
      if (rolesErr) {
        console.warn('[ensureProfileRow] roles select failed:', rolesErr);
        return;
      }
      const roles = (rolesData || []).map((r: any) => r.role as string);
      if (roles.length === 0) {
        const initialRole = desiredRole === 'admin' ? 'broadcaster' : desiredRole; // don't auto-assign admin
        const { error: insertRoleErr } = await supabase
          .from('user_roles')
          .insert({ user_id: u.id, role: initialRole as any });
        if (insertRoleErr) {
          console.warn('[ensureProfileRow] role insert failed:', insertRoleErr);
        } else {
          console.log('[ensureProfileRow] assigned initial role', initialRole);
        }
      }
    } catch (e) {
      console.warn('[ensureProfileRow] roles ensure failed:', e);
    }
  };
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        if (newSession?.user) {
          setTimeout(() => {
            ensureProfileRow(newSession.user!);
            refreshSubscription();
          }, 0);
        } else {
          setSubscription(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);

      if (initialSession?.user) {
        ensureProfileRow(initialSession.user);
        refreshSubscription();
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      cleanupAuthState();
      try {
        // Attempt global sign out; ignore if unsupported
        await (supabase.auth as any).signOut({ scope: 'global' });
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
