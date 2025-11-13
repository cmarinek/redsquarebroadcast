import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Rating, NoRating } from './rating';

describe('Rating Component', () => {
  describe('Display', () => {
    it('should render with default props', () => {
      render(<Rating value={4.5} />);
      const stars = screen.getAllByRole('button');
      expect(stars).toHaveLength(5);
    });

    it('should show correct number of stars for maxStars prop', () => {
      render(<Rating value={3} maxStars={10} />);
      const stars = screen.getAllByRole('button');
      expect(stars).toHaveLength(10);
    });

    it('should display rating value when showValue is true', () => {
      render(<Rating value={4.7} showValue />);
      expect(screen.getByText('4.7')).toBeInTheDocument();
    });

    it('should not display rating value when showValue is false', () => {
      render(<Rating value={4.7} showValue={false} />);
      expect(screen.queryByText('4.7')).not.toBeInTheDocument();
    });

    it('should display total ratings count when provided', () => {
      render(<Rating value={4.5} totalRatings={123} />);
      expect(screen.getByText(/123/)).toBeInTheDocument();
    });

    it('should format total ratings with locale thousands separator', () => {
      render(<Rating value={4.5} totalRatings={1234} />);
      expect(screen.getByText(/1,234/)).toBeInTheDocument();
    });
  });

  describe('Sizing', () => {
    it('should apply small size classes', () => {
      const { container } = render(<Rating value={4} size="sm" />);
      const star = container.querySelector('svg');
      expect(star).toHaveClass('h-3', 'w-3');
    });

    it('should apply medium size classes by default', () => {
      const { container } = render(<Rating value={4} />);
      const star = container.querySelector('svg');
      expect(star).toHaveClass('h-4', 'w-4');
    });

    it('should apply large size classes', () => {
      const { container } = render(<Rating value={4} size="lg" />);
      const star = container.querySelector('svg');
      expect(star).toHaveClass('h-5', 'w-5');
    });
  });

  describe('Rating Values', () => {
    it('should round 4.2 to 4 filled stars', () => {
      const { container } = render(<Rating value={4.2} />);
      const filledStars = container.querySelectorAll('[fill="currentColor"]');
      expect(filledStars.length).toBe(4);
    });

    it('should round 4.3 to 4.5 (show half star)', () => {
      const { container } = render(<Rating value={4.3} />);
      const halfFilledStars = container.querySelectorAll('[style*="clipPath"]');
      expect(halfFilledStars.length).toBe(1);
    });

    it('should round 4.8 to 5 filled stars', () => {
      const { container } = render(<Rating value={4.8} />);
      const filledStars = container.querySelectorAll('[fill="currentColor"]');
      expect(filledStars.length).toBe(5);
    });

    it('should handle zero rating', () => {
      const { container } = render(<Rating value={0} />);
      const filledStars = container.querySelectorAll('[fill="currentColor"]');
      expect(filledStars.length).toBe(0);
    });

    it('should handle maximum rating', () => {
      const { container } = render(<Rating value={5} />);
      const filledStars = container.querySelectorAll('[fill="currentColor"]');
      expect(filledStars.length).toBe(5);
    });
  });

  describe('Interactive Mode', () => {
    it('should not be interactive by default (readonly)', () => {
      const { container } = render(<Rating value={3} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('cursor-default');
      });
    });

    it('should be interactive when readonly is false', () => {
      const onChange = vi.fn();
      const { container } = render(<Rating value={3} readonly={false} onChange={onChange} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveClass('cursor-default');
        expect(button).toHaveClass('cursor-pointer');
      });
    });

    it('should call onChange when star is clicked in interactive mode', () => {
      const onChange = vi.fn();
      render(<Rating value={3} readonly={false} onChange={onChange} />);

      const stars = screen.getAllByRole('button');
      fireEvent.click(stars[3]); // Click 4th star (0-indexed)

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('should not call onChange in readonly mode', () => {
      const onChange = vi.fn();
      render(<Rating value={3} readonly onChange={onChange} />);

      const stars = screen.getAllByRole('button');
      fireEvent.click(stars[4]);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should disable star buttons in readonly mode', () => {
      render(<Rating value={3} readonly />);

      const stars = screen.getAllByRole('button');
      stars.forEach((star) => {
        expect(star).toBeDisabled();
      });
    });

    it('should enable star buttons in interactive mode', () => {
      render(<Rating value={3} readonly={false} onChange={() => {}} />);

      const stars = screen.getAllByRole('button');
      stars.forEach((star) => {
        expect(star).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for each star', () => {
      render(<Rating value={3} />);

      expect(screen.getByLabelText('1 star')).toBeInTheDocument();
      expect(screen.getByLabelText('2 stars')).toBeInTheDocument();
      expect(screen.getByLabelText('3 stars')).toBeInTheDocument();
      expect(screen.getByLabelText('4 stars')).toBeInTheDocument();
      expect(screen.getByLabelText('5 stars')).toBeInTheDocument();
    });

    it('should use button role for interactive elements', () => {
      render(<Rating value={3} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<Rating value={3} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<Rating value={3} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('items-center');
    });
  });
});

describe('NoRating Component', () => {
  it('should render "No ratings yet" message', () => {
    render(<NoRating />);
    expect(screen.getByText('No ratings yet')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    const { container } = render(<NoRating size="lg" />);
    const star = container.querySelector('svg');
    expect(star).toHaveClass('h-5', 'w-5');
  });

  it('should apply custom className', () => {
    const { container } = render(<NoRating className="custom-no-rating" />);
    expect(container.firstChild).toHaveClass('custom-no-rating');
  });

  it('should render empty star icon', () => {
    const { container } = render(<NoRating />);
    const star = container.querySelector('svg');
    expect(star).toBeInTheDocument();
    expect(star).not.toHaveAttribute('fill', 'currentColor');
  });

  it('should have muted styling', () => {
    const { container } = render(<NoRating />);
    const star = container.querySelector('svg');
    expect(star).toHaveClass('text-muted-foreground/30');
  });
});

describe('Rating Component - Edge Cases', () => {
  it('should handle negative values as zero', () => {
    const { container } = render(<Rating value={-1} />);
    const filledStars = container.querySelectorAll('[fill="currentColor"]');
    expect(filledStars.length).toBe(0);
  });

  it('should handle values above maxStars', () => {
    const { container } = render(<Rating value={10} maxStars={5} />);
    const filledStars = container.querySelectorAll('[fill="currentColor"]');
    expect(filledStars.length).toBe(5); // All stars filled
  });

  it('should handle decimal precision correctly', () => {
    render(<Rating value={4.666666} showValue />);
    expect(screen.getByText('4.7')).toBeInTheDocument(); // Rounded to 1 decimal
  });

  it('should handle zero total ratings', () => {
    render(<Rating value={4.5} totalRatings={0} />);
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });

  it('should not show rating count when totalRatings is undefined', () => {
    render(<Rating value={4.5} />);
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
  });
});

describe('Rating Component - Visual States', () => {
  it('should show all yellow stars for filled ratings', () => {
    const { container } = render(<Rating value={5} />);
    const yellowStars = container.querySelectorAll('.text-yellow-500');
    expect(yellowStars.length).toBeGreaterThan(0);
  });

  it('should show gray background stars for empty ratings', () => {
    const { container } = render(<Rating value={0} />);
    const grayStars = container.querySelectorAll('.text-muted-foreground\\/30');
    expect(grayStars.length).toBe(5);
  });

  it('should show half-filled star with correct styling', () => {
    const { container } = render(<Rating value={3.5} />);
    const halfStar = container.querySelector('[style*="clipPath"]');
    expect(halfStar).toBeInTheDocument();
    expect(halfStar).toHaveClass('text-yellow-500');
  });
});

describe('Rating Component - Hover Effects', () => {
  it('should show hover scale effect in interactive mode', () => {
    const { container } = render(<Rating value={3} readonly={false} onChange={() => {}} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      expect(button).toHaveClass('hover:scale-110');
    });
  });

  it('should not show hover effect in readonly mode', () => {
    const { container } = render(<Rating value={3} readonly />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      expect(button).not.toHaveClass('hover:scale-110');
    });
  });
});
