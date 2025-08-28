import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ABTestingTools } from './ABTestingTools';
import { Toaster } from '@/components/ui/toaster';

import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/contexts/AuthContext'; // To provide user context

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } }),
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

// Mock data for different roles
const mockAdvertiserCampaigns = {
  campaigns: [
    { id: 'adv-1', name: 'Advertiser Campaign 1', description: 'Adv Desc 1', status: 'draft', target_metric: 'ctr', start_date: '', end_date: '' },
    { id: 'adv-2', name: 'Advertiser Campaign 2', description: 'Adv Desc 2', status: 'running', target_metric: 'conversions', start_date: '', end_date: '' },
  ],
};

const mockBroadcasterCampaigns = {
  campaigns: [
    { id: 'brd-1', name: 'Broadcaster Campaign 1', description: 'Brd Desc 1', status: 'active', target_metric: 'engagement', start_date: '', end_date: '' },
  ],
};

const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe('ABTestingTools (Shared Component)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading state initially', () => {
    (supabase.functions.invoke as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithAuthProvider(<ABTestingTools role="advertiser" />);
    expect(screen.getByText('Loading A/B testing tools...')).toBeInTheDocument();
  });

  it('renders the advertiser card view when role is "advertiser"', async () => {
    (supabase.functions.invoke as vi.Mock).mockResolvedValue({
      data: mockAdvertiserCampaigns,
      error: null,
    });

    renderWithAuthProvider(<ABTestingTools role="advertiser" />);

    await waitFor(() => {
      // Check for advertiser campaign names, which are in Card titles (h4)
      expect(screen.getByText('Advertiser Campaign 1')).toBeInTheDocument();
      expect(screen.getByText('Advertiser Campaign 2')).toBeInTheDocument();
    });

    // Check that table headers (broadcaster view) are NOT present
    expect(screen.queryByRole('columnheader', { name: /Status/i })).not.toBeInTheDocument();
  });

  it('renders the broadcaster table view when role is "broadcaster"', async () => {
    (supabase.functions.invoke as vi.Mock).mockResolvedValue({
      data: mockBroadcasterCampaigns,
      error: null,
    });

    renderWithAuthProvider(<ABTestingTools role="broadcaster" />);

    await waitFor(() => {
      // Check for table headers specific to the broadcaster view
      expect(screen.getByRole('columnheader', { name: /Campaign/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /Status/i })).toBeInTheDocument();
      // Check for the campaign name in a table cell
      expect(screen.getByRole('cell', { name: /Broadcaster Campaign 1/i })).toBeInTheDocument();
    });

    // Check that advertiser card content is NOT present
    expect(screen.queryByText('Adv Desc 1')).not.toBeInTheDocument();
  });

  it('displays an empty state message when no campaigns are returned', async () => {
    (supabase.functions.invoke as vi.Mock).mockResolvedValue({
      data: { campaigns: [] },
      error: null,
    });

    renderWithAuthProvider(<ABTestingTools role="advertiser" />);

    await waitFor(() => {
      expect(screen.getByText('No A/B Tests Yet')).toBeInTheDocument();
    });
  });

  it('displays an error toast if fetching campaigns fails', async () => {
    (supabase.functions.invoke as vi.Mock).mockRejectedValue(new Error('API Error'));

    renderWithAuthProvider(
      <>
        <ABTestingTools role="advertiser" />
        <Toaster />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText('Could not load A/B test campaigns.')).toBeInTheDocument();
    });
  });

});
