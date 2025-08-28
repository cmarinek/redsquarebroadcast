import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should combine basic class names', () => {
    expect(cn('text-center', 'font-bold')).toBe('text-center font-bold');
  });

  it('should handle conditional class names correctly', () => {
    const isActive = true;
    const hasError = false;
    expect(cn('base', isActive && 'active', hasError && 'error')).toBe('base active');
  });

  it('should override conflicting tailwind classes', () => {
    // twMerge should handle this: p-4 overrides p-2
    expect(cn('p-2', 'p-4')).toBe('p-4');
    // twMerge should handle this: text-lg overrides text-sm
    expect(cn('text-sm', 'font-bold', 'text-lg')).toBe('font-bold text-lg');
  });

  it('should handle empty, null, or undefined inputs gracefully', () => {
    expect(cn('class1', null, 'class2', undefined, false && 'class3')).toBe('class1 class2');
  });

  it('should handle an array of class names', () => {
    const classes = ['class1', 'class2'];
    expect(cn(classes, 'class3')).toBe('class1 class2 class3');
  });
});
