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

  const ensureProfileRow = async (u: User | null) => {
    if (!u) return;
    try {
      await supabase.from('profiles').upsert(
        { user_id: u.id, role: 'broadcaster' },
        { onConflict: 'user_id' }
      );
    } catch (e) {
      console.warn('ensureProfileRow failed:', e);
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