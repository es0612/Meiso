import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content, numbers, and booleans
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  beforeSend(event: any, hint: any) {
    // Filter out specific errors we don't want to track
    if (event.exception) {
      const error = hint.originalException;
      
      // Don't track network errors
      if (error instanceof Error && error.message.includes('fetch')) {
        return null;
      }
      
      // Don't track specific browser errors
      if (error instanceof Error && (
        error.message.includes('Non-Error promise rejection') ||
        error.message.includes('Script error') ||
        error.message.includes('Network request failed')
      )) {
        return null;
      }
    }
    
    return event;
  },
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});