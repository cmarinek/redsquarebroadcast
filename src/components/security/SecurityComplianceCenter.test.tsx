import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecurityComplianceCenter } from './SecurityComplianceCenter';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';

// Mock the supabase client module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock data that we expect to be returned from the API
const mockApiData = {
  alerts: [
    {
      id: 'api-alert-1',
      type: 'api_test_type',
      severity: 'critical',
      title: 'API Security Alert',
      description: 'This alert came from the mocked API.',
      timestamp: new Date().toISOString(),
      status: 'open',
    },
  ],
  complianceChecks: [
    {
      id: 'api-compliance-1',
      name: 'API GDPR Check',
      description: 'This check came from the mocked API.',
      status: 'compliant',
      lastChecked: new Date().toISOString(),
      category: 'data_protection',
    },
  ],
};

describe('SecurityComplianceCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup the mock for get-security-data function
    (supabase.functions.invoke as vi.Mock).mockImplementation(async (functionName) => {
      if (functionName === 'get-security-data') {
        return { data: mockApiData, error: null };
      }
      if (functionName === 'run-security-scan') {
        // Add a small delay to better simulate a real API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: { message: 'Scan complete' }, error: null };
      }
      return { data: null, error: new Error('Unknown function') };
    });
  });

  it('should fetch and display real data from the API instead of the hardcoded mock data', async () => {
    render(<SecurityComplianceCenter />);

    // The component should show a loading state initially
    expect(screen.getByText('Loading security data...')).toBeInTheDocument();

    // Wait for the API data to be rendered
    await waitFor(() => {
      // Check for the title of the alert from our API mock
      expect(screen.getByText('API Security Alert')).toBeInTheDocument();
    });

    // IMPORTANT: Verify that the hardcoded mock data is NOT present
    expect(screen.queryByText('Multiple Failed Login Attempts')).not.toBeInTheDocument();

    // Click on the compliance tab to make its content visible
    await userEvent.click(screen.getByRole('tab', { name: /Compliance Checks/i }));

    // Now check for the compliance check from our API mock
    await waitFor(() => {
        expect(screen.getByText('API GDPR Check')).toBeInTheDocument();
    });

    // And verify the hardcoded compliance data is not present
    expect(screen.queryByText('Multiple Failed Login Attempts')).not.toBeInTheDocument();
    expect(screen.queryByText('GDPR Data Processing')).not.toBeInTheDocument();
  });

  it('should call the run-security-scan function when the scan button is clicked', async () => {
    render(
      <>
        <SecurityComplianceCenter />
        <Toaster />
      </>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('API Security Alert')).toBeInTheDocument();
    });

    const scanButton = screen.getByRole('button', { name: /Run Security Scan/i });
    await userEvent.click(scanButton);

    // Check that the correct Supabase function was invoked
    expect(supabase.functions.invoke).toHaveBeenCalledWith('run-security-scan');

    // Check for the loading state on the button by using findByRole
    await screen.findByRole('button', { name: /Scanning.../i });

    // Check for the success toast message
    await waitFor(() => {
        expect(screen.getByText('Security Scan Complete')).toBeInTheDocument();
    });

    // Finally, check that the button has reverted to its original state
    expect(screen.getByRole('button', { name: /Run Security Scan/i })).toBeInTheDocument();
  });

  it('should display an empty state message when no data is returned', async () => {
    // Mock the API to return empty arrays
    (supabase.functions.invoke as vi.Mock).mockResolvedValue({
      data: { alerts: [], complianceChecks: [] },
      error: null,
    });

    render(<SecurityComplianceCenter />);

    // Wait for the loading to finish and check for the empty state message
    await waitFor(() => {
      expect(screen.getByText('No security alerts at this time')).toBeInTheDocument();
    });

    // Switch to the compliance tab and check for its empty state
    await userEvent.click(screen.getByRole('tab', { name: /Compliance Checks/i }));
    await waitFor(() => {
        expect(screen.getByText('No compliance checks found.')).toBeInTheDocument();
    });
  });

  it('should display an error toast if fetching data fails', async () => {
    // Mock the API to return an error
    (supabase.functions.invoke as vi.Mock).mockRejectedValue(new Error('Network Error'));

    render(
      <>
        <SecurityComplianceCenter />
        <Toaster />
      </>
    );

    // Wait for the error toast to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load security data')).toBeInTheDocument();
    });
  });

});
