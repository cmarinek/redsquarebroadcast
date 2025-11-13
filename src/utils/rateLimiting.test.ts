import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit, incrementRateLimit, formatRetryAfter, handleRateLimitError } from './rateLimiting';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('rateLimiting utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should check rate limit for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockResponse = {
        allowed: true,
        remaining: 5,
        limit: 10,
        window_minutes: 60,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      } as any);

      const result = await checkRateLimit('auth_signin');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('rate-limit', {
        body: {
          identifier: 'user-123',
          endpoint: 'auth_signin',
          action: 'check',
        },
      });
    });

    it('should use custom identifier if provided', async () => {
      const mockResponse = {
        allowed: true,
        remaining: 5,
        limit: 10,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      } as any);

      await checkRateLimit('auth_signin', 'custom-id-123');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('rate-limit', {
        body: {
          identifier: 'custom-id-123',
          endpoint: 'auth_signin',
          action: 'check',
        },
      });
    });

    it('should generate fingerprint for anonymous users', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { allowed: true, remaining: 5, limit: 10 },
        error: null,
      } as any);

      await checkRateLimit('auth_signin');

      const callArgs = vi.mocked(supabase.functions.invoke).mock.calls[0][1];
      expect(callArgs.body.identifier).toMatch(/^anon-/);
    });

    it('should fail open on error', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'));

      const result = await checkRateLimit('auth_signin');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should handle rate limit exceeded', async () => {
      const mockResponse = {
        allowed: false,
        remaining: 0,
        limit: 5,
        retry_after_seconds: 900,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      } as any);

      const result = await checkRateLimit('auth_signin');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retry_after_seconds).toBe(900);
    });
  });

  describe('incrementRateLimit', () => {
    it('should increment rate limit counter', async () => {
      const mockUser = { id: 'user-123' };
      const mockResponse = {
        allowed: true,
        remaining: 4,
        limit: 5,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      } as any);

      const result = await incrementRateLimit('content_upload');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('rate-limit', {
        body: {
          identifier: 'user-123',
          endpoint: 'content_upload',
          action: 'increment',
        },
      });
    });

    it('should handle rate limit reached', async () => {
      const mockResponse = {
        allowed: false,
        error: 'Rate limit exceeded',
        retry_after_seconds: 3600,
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      } as any);

      const result = await incrementRateLimit('content_upload');

      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Rate limit exceeded');
    });

    it('should fail open on error', async () => {
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'));

      const result = await incrementRateLimit('content_upload');

      expect(result.allowed).toBe(true);
    });
  });

  describe('formatRetryAfter', () => {
    it('should format seconds correctly', () => {
      expect(formatRetryAfter(30)).toBe('30 seconds');
      expect(formatRetryAfter(45)).toBe('45 seconds');
      expect(formatRetryAfter(1)).toBe('1 seconds');
    });

    it('should format minutes correctly', () => {
      expect(formatRetryAfter(60)).toBe('1 minute');
      expect(formatRetryAfter(120)).toBe('2 minutes');
      expect(formatRetryAfter(90)).toBe('2 minutes'); // Rounds up
      expect(formatRetryAfter(300)).toBe('5 minutes');
    });

    it('should round up partial minutes', () => {
      expect(formatRetryAfter(61)).toBe('2 minutes');
      expect(formatRetryAfter(119)).toBe('2 minutes');
      expect(formatRetryAfter(181)).toBe('4 minutes');
    });
  });

  describe('handleRateLimitError', () => {
    it('should format error with retry time', () => {
      const response = {
        allowed: false,
        remaining: 0,
        limit: 5,
        retry_after_seconds: 900,
      };

      const message = handleRateLimitError(response);

      expect(message).toContain('15 minutes');
      expect(message).toContain('Too many requests');
    });

    it('should handle missing retry_after_seconds', () => {
      const response = {
        allowed: false,
        remaining: 0,
        limit: 5,
      };

      const message = handleRateLimitError(response);

      expect(message).toBe('Too many requests. Please slow down and try again later.');
    });

    it('should format seconds correctly in error', () => {
      const response = {
        allowed: false,
        remaining: 0,
        limit: 5,
        retry_after_seconds: 45,
      };

      const message = handleRateLimitError(response);

      expect(message).toContain('45 seconds');
    });

    it('should format minutes correctly in error', () => {
      const response = {
        allowed: false,
        remaining: 0,
        limit: 5,
        retry_after_seconds: 300,
      };

      const message = handleRateLimitError(response);

      expect(message).toContain('5 minutes');
    });
  });
});
