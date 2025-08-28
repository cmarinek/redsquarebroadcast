import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Mock the entire supabase client module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockResolvedValue({ error: null }),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// A simple component to consume and display auth context values
const TestConsumer = () => {
  const { user, session, loading, subscription } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user-id">{user?.id ?? 'null'}</div>
      <div data-testid="session-token">{session?.access_token ?? 'null'}</div>
      <div data-testid="subscription-status">{subscription?.subscribed ? 'subscribed' : 'unsubscribed'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock onAuthStateChange to return an unsubscribe function
    (supabase.auth.onAuthStateChange as vi.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('provides null user and session initially when not logged in', async () => {
    // Mock getSession to return no active session
    (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Wait for the loading state to resolve
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('user-id')).toHaveTextContent('null');
    expect(screen.getByTestId('session-token')).toHaveTextContent('null');
  });

  it('provides user and session details when logged in', async () => {
    const mockUser: User = {
      id: 'test-user-id',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    const mockSession: Session = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    // Mock getSession to return an active session
    (supabase.auth.getSession as vi.Mock).mockResolvedValue({ data: { session: mockSession } });

    // Mock subscription check
    (supabase.functions.invoke as vi.Mock).mockResolvedValue({ data: { subscribed: true, tier: 'pro' } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
      expect(screen.getByTestId('session-token')).toHaveTextContent('test-access-token');
      expect(screen.getByTestId('subscription-status')).toHaveTextContent('subscribed');
    });
  });
});
