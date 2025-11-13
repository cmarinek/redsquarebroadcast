import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileCompletionPrompt } from './ProfileCompletionPrompt';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProfileCompletionPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      loading: false,
    } as any);
  });

  it('should not render when user is not logged in', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      signOut: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      loading: false,
    } as any);

    const { container } = renderWithRouter(<ProfileCompletionPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should not render when dismissed within 7 days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    localStorage.setItem(
      `profile_prompt_dismissed_${mockUser.id}`,
      futureDate.toISOString()
    );

    const { container } = renderWithRouter(<ProfileCompletionPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render when profile is incomplete', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              full_name: null,
              avatar_url: null,
              bio: null,
              phone: null,
              has_completed_advertiser_onboarding: false,
              has_completed_screen_owner_onboarding: false,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    // Also mock user_roles count
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              full_name: null,
              avatar_url: null,
              bio: null,
              phone: null,
              has_completed_advertiser_onboarding: false,
              has_completed_screen_owner_onboarding: false,
            },
            error: null,
          }),
        }),
      }),
    }).mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
      }),
    });

    renderWithRouter(<ProfileCompletionPrompt />);

    await waitFor(() => {
      expect(screen.queryByText(/complete your profile/i)).toBeInTheDocument();
    });
  });

  it('should show progress percentage', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              full_name: 'John Doe',
              avatar_url: 'https://example.com/avatar.jpg',
              bio: null,
              phone: null,
              has_completed_advertiser_onboarding: true,
              has_completed_screen_owner_onboarding: false,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    renderWithRouter(<ProfileCompletionPrompt />);

    await waitFor(() => {
      // Should show 50% or similar based on filled fields
      expect(screen.queryByText(/%/)).toBeInTheDocument();
    });
  });

  it('should allow dismissal', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              full_name: null,
              avatar_url: null,
              bio: null,
              phone: null,
              has_completed_advertiser_onboarding: false,
              has_completed_screen_owner_onboarding: false,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    renderWithRouter(<ProfileCompletionPrompt />);

    await waitFor(() => {
      const dismissButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(dismissButton);
    });

    // Check that dismiss date is set in localStorage
    const dismissedUntil = localStorage.getItem(
      `profile_prompt_dismissed_${mockUser.id}`
    );
    expect(dismissedUntil).toBeTruthy();
  });

  it('should show missing field links', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              full_name: null,
              avatar_url: null,
              bio: 'My bio',
              phone: null,
              has_completed_advertiser_onboarding: false,
              has_completed_screen_owner_onboarding: false,
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    renderWithRouter(<ProfileCompletionPrompt />);

    await waitFor(() => {
      expect(screen.queryByText(/full name/i)).toBeInTheDocument();
      expect(screen.queryByText(/profile photo/i)).toBeInTheDocument();
    });
  });
});
