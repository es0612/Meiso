// Performance utilities for Core Web Vitals optimization

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

declare global {
  function gtag(
    command: string,
    eventName: string,
    parameters?: Record<string, unknown>
  ): void;
}

/**
 * Web Vitals metric types
 */
export interface WebVitalMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  navigationType: string;
}

/**
 * Performance observer for tracking key metrics
 */
export class PerformanceTracker {
  private metrics: Map<string, WebVitalMetric> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Track First Contentful Paint (FCP)
    this.observeMetric('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.recordMetric('FCP', fcpEntry.startTime);
      }
    });

    // Track Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.recordMetric('LCP', lastEntry.startTime);
      }
    });

    // Track Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        const layoutShiftEntry = entry as LayoutShift;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      this.recordMetric('CLS', clsValue);
    });

    // Track First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const firstInput = entries[0] as FirstInputEntry;
      if (firstInput) {
        const fid = firstInput.processingStart - firstInput.startTime;
        this.recordMetric('FID', fid);
      }
    });
  }

  private observeMetric(
    entryType: string,
    callback: (entries: PerformanceEntry[]) => void
  ) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: [entryType] });
      this.observers.set(entryType, observer);
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error);
    }
  }

  private recordMetric(name: WebVitalMetric['name'], value: number) {
    const metric: WebVitalMetric = {
      id: this.generateId(),
      name,
      value,
      delta: value,
      entries: [],
      navigationType: this.getNavigationType(),
    };

    this.metrics.set(name, metric);
    this.reportMetric(metric);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNavigationType(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    // Try to get navigation type from Performance Navigation API
    try {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navEntry?.type || 'navigate';
    } catch {
      return 'navigate';
    }
  }

  private reportMetric(metric: WebVitalMetric) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value);
    }

    // Report to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }

    // Store in localStorage for debugging
    this.storeMetric(metric);
  }

  private sendToAnalytics(metric: WebVitalMetric) {
    // Send to Google Analytics 4 if available
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }

    // Send to custom analytics endpoint
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        url: window.location.href,
        timestamp: Date.now(),
      });

      navigator.sendBeacon('/api/analytics/web-vitals', data);
    }
  }

  private storeMetric(metric: WebVitalMetric) {
    try {
      const stored = JSON.parse(localStorage.getItem('webVitals') || '{}');
      stored[metric.name] = {
        value: metric.value,
        timestamp: Date.now(),
      };
      localStorage.setItem('webVitals', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store web vital metric:', error);
    }
  }

  public getMetrics(): Map<string, WebVitalMetric> {
    return this.metrics;
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * Optimize images for better LCP
 */
export const optimizeImageLoading = () => {
  if (typeof window === 'undefined') return;

  // Preload critical images
  const preloadImage = (src: string, as: 'image' = 'image') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    document.head.appendChild(link);
  };

  // Find and preload hero images
  const heroImages = document.querySelectorAll('img[data-priority="high"]');
  heroImages.forEach((img) => {
    if (img instanceof HTMLImageElement && img.src) {
      preloadImage(img.src);
    }
  });
};

/**
 * Optimize fonts for better FCP
 */
export const optimizeFontLoading = () => {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const preloadFont = (href: string, type: string = 'font/woff2') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  // Add font-display: swap to improve FCP
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Geist';
      font-display: swap;
    }
    @font-face {
      font-family: 'Geist Mono';
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Reduce layout shift by setting dimensions
 */
export const preventLayoutShift = () => {
  if (typeof window === 'undefined') return;

  // Set explicit dimensions for images without them
  const images = document.querySelectorAll('img:not([width]):not([height])');
  images.forEach((img) => {
    if (img instanceof HTMLImageElement) {
      // Use aspect ratio to maintain proportions
      img.style.aspectRatio = 'auto';
      img.style.height = 'auto';
    }
  });

  // Reserve space for dynamic content
  const dynamicElements = document.querySelectorAll('[data-dynamic-height]');
  dynamicElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      const minHeight = element.dataset.dynamicHeight;
      if (minHeight) {
        element.style.minHeight = minHeight;
      }
    }
  });
};

/**
 * Optimize third-party scripts
 */
export const optimizeThirdPartyScripts = () => {
  if (typeof window === 'undefined') return;

  // Defer non-critical scripts
  const scripts = document.querySelectorAll('script[data-defer="true"]');
  scripts.forEach((script) => {
    if (script instanceof HTMLScriptElement) {
      script.defer = true;
    }
  });

  // Use resource hints for third-party domains
  const addResourceHint = (href: string, rel: 'dns-prefetch' | 'preconnect') => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  };

  // Common third-party domains
  const thirdPartyDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ];

  thirdPartyDomains.forEach(domain => {
    addResourceHint(domain, 'preconnect');
  });
};

/**
 * Initialize all performance optimizations
 */
export const initializePerformanceOptimizations = (): PerformanceTracker | null => {
  if (typeof window === 'undefined') return null;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeImageLoading();
      optimizeFontLoading();
      preventLayoutShift();
      optimizeThirdPartyScripts();
    });
  } else {
    optimizeImageLoading();
    optimizeFontLoading();
    preventLayoutShift();
    optimizeThirdPartyScripts();
  }

  // Start performance tracking
  return new PerformanceTracker();
};

/**
 * Critical resource preloader
 */
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    // Critical CSS
    { href: '/_next/static/css/app.css', as: 'style' },
    // Critical fonts
    { href: '/fonts/geist-sans.woff2', as: 'font', type: 'font/woff2' },
    // Critical images
    { href: '/hero-meditation.webp', as: 'image' },
  ];

  criticalResources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) {
      link.type = type;
    }
    if (as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// Export global performance tracker instance
export let globalPerformanceTracker: PerformanceTracker | null = null;

if (typeof window !== 'undefined') {
  globalPerformanceTracker = initializePerformanceOptimizations();
}