import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  beforeSend(event: any, hint: any) {
    // Filter out specific errors we don't want to track
    if (event.exception) {
      const error = hint.originalException;
      
      // Don't track Supabase connection errors in development
      if (process.env.NODE_ENV === 'development' && 
          error instanceof Error && 
          error.message.includes('supabase')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'server',
    },
  },
});