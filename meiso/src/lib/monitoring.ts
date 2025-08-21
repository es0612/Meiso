/**
 * Performance monitoring utilities for the Meiso application
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

// Web Vitals thresholds based on Google's recommendations
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

/**
 * Get performance rating based on thresholds
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];
  if (!thresholds) return 'good';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Send performance metrics to monitoring service
 */
export function sendToAnalytics(metric: WebVitalsMetric) {
  // Send to Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'Web Vitals', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
    });
  }

  // Send to Sentry
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${metric.value}`,
      level: metric.rating === 'poor' ? 'warning' : 'info',
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      },
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric);
  }
}

/**
 * Track custom performance metrics
 */
export function trackCustomMetric(name: string, value: number) {
  const metric: PerformanceMetric = {
    name,
    value,
    rating: getRating(name, value),
    timestamp: Date.now(),
  };

  // Send to analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'Custom Metric', {
      metric_name: name,
      metric_value: value,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Custom Metric:', metric);
  }
}

/**
 * Track meditation session performance
 */
export function trackMeditationPerformance(sessionData: {
  duration: number;
  scriptId: string;
  completed: boolean;
  loadTime?: number;
  audioLoadTime?: number;
}) {
  trackCustomMetric('meditation_session_duration', sessionData.duration);
  
  if (sessionData.loadTime) {
    trackCustomMetric('meditation_load_time', sessionData.loadTime);
  }
  
  if (sessionData.audioLoadTime) {
    trackCustomMetric('audio_load_time', sessionData.audioLoadTime);
  }

  // Track completion rate
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'Meditation Session', {
      script_id: sessionData.scriptId,
      completed: sessionData.completed,
      duration: sessionData.duration,
    });
  }
}

/**
 * Track user errors for monitoring
 */
export function trackError(error: Error, context?: Record<string, any>) {
  // Send to Sentry
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      extra: context,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Tracked Error:', error, context);
  }
}

/**
 * Performance observer for navigation timing
 */
export function initializePerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Observe navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Track key navigation metrics
          trackCustomMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart);
          trackCustomMetric('load_complete', navEntry.loadEventEnd - navEntry.navigationStart);
          trackCustomMetric('dom_interactive', navEntry.domInteractive - navEntry.navigationStart);
        }
      }
    });

    navObserver.observe({ entryTypes: ['navigation'] });

    // Observe resource timing for critical resources
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Track audio file load times
        if (resourceEntry.name.includes('.mp3') || resourceEntry.name.includes('.wav')) {
          trackCustomMetric('audio_resource_load', resourceEntry.duration);
        }
        
        // Track large image load times
        if (resourceEntry.name.includes('.jpg') || resourceEntry.name.includes('.png') || resourceEntry.name.includes('.webp')) {
          if (resourceEntry.transferSize > 50000) { // > 50KB
            trackCustomMetric('large_image_load', resourceEntry.duration);
          }
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

  } catch (error) {
    console.warn('Failed to initialize performance observer:', error);
  }
}

// Global type extensions
declare global {
  interface Window {
    va?: (event: string, name: string, data?: Record<string, any>) => void;
    Sentry?: any;
  }
}