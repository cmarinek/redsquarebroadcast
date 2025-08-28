import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Auth from './Auth';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mocking useNavigate from react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mocking the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
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

const renderComponent = () => {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Auth />
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
};

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sign-in form by default', () => {
    renderComponent();
    expect(screen.getByRole('tab', { name: /Sign In/i, selected: true })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('allows typing in the sign-in form fields', async () => {
    renderComponent();
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('calls supabase.auth.signInWithPassword on sign-in form submission', async () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const signInButton = screen.getByRole('button', { name: /Sign In/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(signInButton);

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('switches to the sign-up tab and allows typing', async () => {
    renderComponent();
    const signUpTab = screen.getByRole('tab', { name: /Sign Up/i });
    await userEvent.click(signUpTab);

    const signUpPanel = screen.getByRole('tabpanel');
    const nameInput = within(signUpPanel).getByLabelText(/Display Name/i);
    const emailInput = within(signUpPanel).getByLabelText(/Email/i);
    const passwordInput = within(signUpPanel).getByLabelText(/Password/i);

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'signup@example.com');
    await userEvent.type(passwordInput, 'newpassword');

    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('signup@example.com');
    expect(passwordInput).toHaveValue('newpassword');
  });

  it('calls supabase.auth.signUp on sign-up form submission', async () => {
    (supabase.auth.signUp as vi.Mock).mockResolvedValue({ error: null });

    renderComponent();
    const signUpTab = screen.getByRole('tab', { name: /Sign Up/i });
    await userEvent.click(signUpTab);

    const signUpPanel = screen.getByRole('tabpanel');
    const nameInput = within(signUpPanel).getByLabelText(/Display Name/i);
    const emailInput = within(signUpPanel).getByLabelText(/Email/i);
    const passwordInput = within(signUpPanel).getByLabelText(/Password/i);
    const createAccountButton = within(signUpPanel).getByRole('button', { name: /Create Account/i });

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'signup@example.com');
    await userEvent.type(passwordInput, 'newpassword');
    await userEvent.click(createAccountButton);

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'signup@example.com',
      password: 'newpassword',
      options: {
        emailRedirectTo: 'http://localhost:3000/',
        data: {
          display_name: 'Test User',
          role: 'broadcaster'
        }
      }
    });
  });
});
