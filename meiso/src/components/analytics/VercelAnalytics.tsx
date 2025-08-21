'use client';

import { useEffect } from 'react';

export function VercelAnalytics() {
  useEffect(() => {
    // Only load in production
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    // Dynamically import Vercel Analytics
    import('@vercel/analytics/react').then(({ inject }) => {
      inject();
    }).catch((error) => {
      console.warn('Failed to load Vercel Analytics:', error);
    });
  }, []);

  return null;
}