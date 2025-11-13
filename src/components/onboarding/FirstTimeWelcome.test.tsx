import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FirstTimeWelcome } from './FirstTimeWelcome';

describe('FirstTimeWelcome', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    expect(screen.getByText(/getting started/i)).toBeInTheDocument();
    expect(screen.getByText(/1 of 5/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<FirstTimeWelcome isOpen={false} onComplete={mockOnComplete} />);

    expect(screen.queryByText(/getting started/i)).not.toBeInTheDocument();
  });

  it('should show first step content', () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    expect(screen.getByText(/welcome to redsquare!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/the marketplace for digital screen advertising/i)
    ).toBeInTheDocument();
  });

  it('should navigate to next step', async () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/2 of 5/i)).toBeInTheDocument();
      expect(screen.getByText(/how it works/i)).toBeInTheDocument();
    });
  });

  it('should navigate to previous step', async () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/2 of 5/i)).toBeInTheDocument();
    });

    // Go back to step 1
    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText(/1 of 5/i)).toBeInTheDocument();
    });
  });

  it('should disable previous button on first step', () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should show progress bar', () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should allow skipping the tour', () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    const skipButton = screen.getByRole('button', { name: /skip tour/i });
    fireEvent.click(skipButton);

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should call onComplete when reaching the last step', async () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    // Navigate through all steps
    for (let i = 0; i < 4; i++) {
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`${i + 2} of 5`, 'i'))).toBeInTheDocument();
      });
    }

    // On last step, button should say "Get Started"
    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(getStartedButton);

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should show all 5 steps', async () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    const stepTitles = [
      /welcome to redsquare!/i,
      /how it works/i,
      /key features/i,
      /safety & quality/i,
      /ready to get started\?/i,
    ];

    for (let i = 0; i < stepTitles.length; i++) {
      await waitFor(() => {
        expect(screen.getByText(stepTitles[i])).toBeInTheDocument();
      });

      if (i < stepTitles.length - 1) {
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
      }
    }
  });

  it('should show feature highlights on each step', () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    // Step 1 should show "For Advertisers" and "For Screen Owners"
    expect(screen.getByText(/for advertisers/i)).toBeInTheDocument();
    expect(screen.getByText(/for screen owners/i)).toBeInTheDocument();
  });

  it('should prevent closing by clicking outside', () => {
    const { container } = render(
      <FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />
    );

    // Try to click the overlay
    const overlay = container.querySelector('[data-radix-dialog-overlay]');
    if (overlay) {
      fireEvent.click(overlay);
    }

    // Should still be open
    expect(screen.getByText(/getting started/i)).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should prevent closing by pressing escape', () => {
    render(<FirstTimeWelcome isOpen={true} onComplete={mockOnComplete} />);

    // Try to press escape
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    // Should still be open
    expect(screen.getByText(/getting started/i)).toBeInTheDocument();
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
});
