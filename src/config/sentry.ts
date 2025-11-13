/**
 * Sentry Configuration for Error Tracking
 *
 * Setup Instructions:
 * 1. Sign up for Sentry at https://sentry.io
 * 2. Create a new project for "Red Square"
 * 3. Copy the DSN (Data Source Name)
 * 4. Add VITE_SENTRY_DSN to your .env file
 * 5. Install Sentry SDK: npm install @sentry/react
 *
 * Environment Variables Required:
 * - VITE_SENTRY_DSN: Your Sentry project DSN
 * - VITE_SENTRY_ENVIRONMENT: production | staging | development
 * - VITE_SENTRY_RELEASE: Optional version/git SHA
 */

import * as Sentry from '@sentry/react';
import { env } from './env';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
const SENTRY_RELEASE = import.meta.env.VITE_SENTRY_RELEASE || 'development';

// Sample rates by environment
const SAMPLE_RATES = {
  production: {
    errorSampleRate: 1.0, // 100% of errors
    tracesSampleRate: 0.1, // 10% of transactions for performance
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  },
  staging: {
    errorSampleRate: 1.0,
    tracesSampleRate: 0.5, // 50% for more visibility
    replaysSessionSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0,
  },
  development: {
    errorSampleRate: 1.0,
    tracesSampleRate: 1.0, // 100% in dev
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  },
};

const sampleRates = SAMPLE_RATES[SENTRY_ENVIRONMENT as keyof typeof SAMPLE_RATES] || SAMPLE_RATES.development;

/**
 * Initialize Sentry error tracking
 */
export function initSentry() {
  // Don't init if no DSN or in localhost
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Sentry disabled on localhost');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,

    // Integrations
    integrations: [
      // Browser tracing for performance monitoring
      new Sentry.BrowserTracing({
        // Set custom trace propagation targets
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.redsquare\.app/,
          /^https:\/\/.*\.supabase\.co/,
        ],

        // React Router integration
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),

      // Session replay for debugging
      new Sentry.Replay({
        maskAllText: true, // Privacy: mask all text
        blockAllMedia: true, // Privacy: block all media
        maskAllInputs: true, // Privacy: mask all inputs
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: sampleRates.tracesSampleRate,

    // Session Replay Sampling
    replaysSessionSampleRate: sampleRates.replaysSessionSampleRate,
    replaysOnErrorSampleRate: sampleRates.replaysOnErrorSampleRate,

    // Error filtering
    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('chrome-extension://') ||
                 frame.filename?.includes('moz-extension://')
      )) {
        return null;
      }

      // Filter out common third-party errors
      const message = event.exception?.values?.[0]?.value || '';
      const ignoredMessages = [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'cancelled', // Common fetch cancellation
      ];

      if (ignoredMessages.some(ignored => message.includes(ignored))) {
        return null;
      }

      // Add user context if available
      const user = getCurrentUser(); // You'll need to implement this
      if (user) {
        event.user = {
          id: user.id,
          email: user.email,
        };
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',

      // Random plugins/extensions
      'atomicFindClose',

      // Network errors that we can't control
      'NetworkError',
      'Failed to fetch',
      'Load failed',

      // Errors from React DevTools
      '__REACT_DEVTOOLS_',
    ],

    // Set context automatically
    initialScope: {
      tags: {
        platform: getPlatform(),
        build_target: import.meta.env.VITE_BUILD_TARGET || 'web',
      },
    },
  });

  console.log(`Sentry initialized (${SENTRY_ENVIRONMENT})`);
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: { id: string; email?: string; username?: string } | null) {
  if (!SENTRY_DSN) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    console.error('Error:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message for logging
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!SENTRY_DSN) {
    console.log(`[${level}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set custom tag for filtering
 */
export function setTag(key: string, value: string) {
  if (!SENTRY_DSN) return;
  Sentry.setTag(key, value);
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, unknown>) {
  if (!SENTRY_DSN) return;
  Sentry.setContext(name, context);
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  if (!SENTRY_DSN) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Helper: Get current platform
 */
function getPlatform(): string {
  if (window.navigator.userAgent.includes('Electron')) return 'electron';
  if ((window as any).Capacitor) {
    const platform = (window as any).Capacitor.getPlatform();
    return platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'web';
  }
  return 'web';
}

/**
 * Helper: Get current user (implement based on your auth system)
 */
function getCurrentUser() {
  // TODO: Implement this based on your auth context
  // Example:
  // const { user } = useAuth();
  // return user;
  return null;
}

// React Router v6 imports (add these at the top of the file)
import React, { useEffect } from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';
