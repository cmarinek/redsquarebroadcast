import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock data for different roles
const mockAdvertiserData = {
  summary: {
    impressions: 100000,
    clicks: 5000,
    ctr: 5.0,
    conversions: 500,
  },
  timeSeries: [],
};

const mockBroadcasterData = {
  summary: {
    views: 250000,
    engagementRate: 15.5,
    topPerformingScreen: 'Main Street Display',
  },
  timeSeries: [],
};

describe('AnalyticsDashboard (Shared Component)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading state initially', () => {
    (supabase.functions.invoke as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<AnalyticsDashboard role="advertiser" userId="test-user" />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders advertiser-specific metrics when role is "advertiser"', async () => {
    (supabase.functions.invoke as vi.Mock).mockResolvedValue({
      data: mockAdvertiserData,
      error: null,
    });

    render(<AnalyticsDashboard role="advertiser" userId="test-user" />);

    await waitFor(() => {
      // Check for advertiser-specific card titles
      expect(screen.getByText('Total Impressions')).toBeInTheDocument();
      expect(screen.getByText('Click-Through Rate')).toBeInTheDocument();
      expect(screen.getByText('Conversions')).toBeInTheDocument();
    });

    // Check that broadcaster-specific cards are NOT rendered
    expect(screen.queryByText('Total Views')).not.toBeInTheDocument();
    expect(screen.queryByText('Engagement Rate')).not.toBeInTheDocument();
  });

  it('renders broadcaster-specific metrics when role is "broadcaster"', async () => {
    (supabase.functions.invoke as vi.Mock).mockResolvedValue({
      data: mockBroadcasterData,
      error: null,
    });

    render(<AnalyticsDashboard role="broadcaster" userId="test-user" />);

    await waitFor(() => {
      // Check for broadcaster-specific card titles
      expect(screen.getByText('Total Views')).toBeInTheDocument();
      expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
      expect(screen.getByText('Top Screen')).toBeInTheDocument();
    });

    // Check that advertiser-specific cards are NOT rendered
    expect(screen.queryByText('Total Impressions')).not.toBeInTheDocument();
    expect(screen.queryByText('Click-Through Rate')).not.toBeInTheDocument();
  });

  it('displays an error message if data fetching fails', async () => {
    (supabase.functions.invoke as vi.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <>
        <AnalyticsDashboard role="advertiser" userId="test-user" />
        <Toaster />
      </>
    );

    await waitFor(() => {
      // Check for the toast error message
      expect(screen.getByText('Could not load analytics data.')).toBeInTheDocument();
    });
  });
});
