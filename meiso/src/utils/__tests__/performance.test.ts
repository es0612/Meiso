import {
  PerformanceTracker,
  optimizeImageLoading,
  optimizeFontLoading,
  preventLayoutShift,
  initializePerformanceOptimizations,
} from '../performance';

// Mock DOM APIs
const mockPerformanceObserver = jest.fn();
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

Object.defineProperty(global, 'PerformanceObserver', {
  value: jest.fn().mockImplementation((callback) => {
    mockPerformanceObserver.mockImplementation(callback);
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
    };
  }),
});

// Mock Performance API
Object.defineProperty(global, 'performance', {
  value: {
    getEntriesByType: jest.fn(),
    navigation: { type: 'navigate' },
  },
});

// Mock gtag
declare global {
  function gtag(...args: any[]): void;
}
global.gtag = jest.fn();

// Mock window properties
const mockWindow = {
  matchMedia: jest.fn(() => ({ matches: false })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  location: { href: 'http://localhost' },
  performance: {
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    navigation: { type: 0 },
    timing: {
      navigationStart: 0,
      loadEventEnd: 1000,
      domContentLoadedEventEnd: 500,
    },
  },
};

// Apply window mocks
Object.keys(mockWindow).forEach(key => {
  Object.defineProperty(window, key, {
    value: mockWindow[key as keyof typeof mockWindow],
    writable: true,
    configurable: true,
  });
});

Object.defineProperty(global, 'document', {
  value: {
    readyState: 'complete',
    createElement: jest.fn(() => ({
      rel: '',
      as: '',
      href: '',
      style: { textContent: '' },
    })),
    head: {
      appendChild: jest.fn(),
    },
    querySelectorAll: jest.fn(() => []),
    addEventListener: jest.fn(),
  },
});

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
});

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    sendBeacon: jest.fn(),
  },
});

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    jest.clearAllMocks();
    tracker = new PerformanceTracker();
  });

  afterEach(() => {
    if (tracker) {
      tracker.disconnect();
    }
  });

  it('should initialize performance observers', () => {
    expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['paint'] });
    expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['largest-contentful-paint'] });
    expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['layout-shift'] });
    expect(mockObserve).toHaveBeenCalledWith({ entryTypes: ['first-input'] });
  });

  it('should track First Contentful Paint (FCP)', () => {
    const fcpEntry = {
      name: 'first-contentful-paint',
      startTime: 1000,
    };

    mockPerformanceObserver({ getEntries: () => [fcpEntry] });

    const metrics = tracker.getMetrics();
    expect(metrics.has('FCP')).toBe(true);
  });

  it('should track Largest Contentful Paint (LCP)', () => {
    const lcpEntry = {
      startTime: 2000,
    };

    mockPerformanceObserver({ getEntries: () => [lcpEntry] });

    const metrics = tracker.getMetrics();
    expect(metrics.has('LCP')).toBe(true);
  });

  it('should track Cumulative Layout Shift (CLS)', () => {
    const clsEntries = [
      { value: 0.1, hadRecentInput: false },
      { value: 0.05, hadRecentInput: true }, // Should be ignored
      { value: 0.2, hadRecentInput: false },
    ];

    mockPerformanceObserver({ getEntries: () => clsEntries });

    const metrics = tracker.getMetrics();
    expect(metrics.has('CLS')).toBe(true);
  });

  it('should track First Input Delay (FID)', () => {
    const fidEntry = {
      startTime: 500,
      processingStart: 520,
    };

    mockPerformanceObserver({ getEntries: () => [fidEntry] });

    const metrics = tracker.getMetrics();
    expect(metrics.has('FID')).toBe(true);
  });

  it('should disconnect all observers', () => {
    tracker.disconnect();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should store metrics in localStorage', () => {
    const fcpEntry = {
      name: 'first-contentful-paint',
      startTime: 1000,
    };

    mockPerformanceObserver({ getEntries: () => [fcpEntry] });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'webVitals',
      expect.stringContaining('FCP')
    );
  });
});

describe('Performance Optimization Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('optimizeImageLoading', () => {
    it('should preload high priority images', () => {
      const mockImg = {
        src: '/hero-image.jpg',
        dataset: { priority: 'high' },
      };

      (document.querySelectorAll as jest.Mock).mockReturnValue([mockImg]);

      optimizeImageLoading();

      expect(document.createElement).toHaveBeenCalledWith('link');
      expect(document.head.appendChild).toHaveBeenCalled();
    });

    it('should handle missing priority images gracefully', () => {
      (document.querySelectorAll as jest.Mock).mockReturnValue([]);

      expect(() => optimizeImageLoading()).not.toThrow();
    });
  });

  describe('optimizeFontLoading', () => {
    it('should add font-display swap styles', () => {
      const mockStyle = {
        textContent: '',
      };

      (document.createElement as jest.Mock).mockReturnValue(mockStyle);

      optimizeFontLoading();

      expect(document.createElement).toHaveBeenCalledWith('style');
      expect(mockStyle.textContent).toContain('font-display: swap');
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });

  describe('preventLayoutShift', () => {
    it('should set dimensions for images without explicit size', () => {
      const mockImg = {
        style: {},
      };

      (document.querySelectorAll as jest.Mock).mockReturnValue([mockImg]);

      preventLayoutShift();

      expect(mockImg.style.aspectRatio).toBe('auto');
      expect(mockImg.style.height).toBe('auto');
    });

    it('should set minimum height for dynamic elements', () => {
      const mockElement = {
        dataset: { dynamicHeight: '200px' },
        style: {},
      };

      (document.querySelectorAll as jest.Mock)
        .mockReturnValueOnce([]) // For images
        .mockReturnValueOnce([mockElement]); // For dynamic elements

      preventLayoutShift();

      expect(mockElement.style.minHeight).toBe('200px');
    });
  });

  describe('initializePerformanceOptimizations', () => {
    it('should return null when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = initializePerformanceOptimizations();

      expect(result).toBeNull();

      global.window = originalWindow;
    });

    it('should return PerformanceTracker when window is available', () => {
      const result = initializePerformanceOptimizations();

      expect(result).toBeInstanceOf(PerformanceTracker);
    });

    it('should handle DOMContentLoaded when document is loading', () => {
      Object.defineProperty(document, 'readyState', {
        value: 'loading',
        configurable: true,
      });

      initializePerformanceOptimizations();

      expect(document.addEventListener).toHaveBeenCalledWith(
        'DOMContentLoaded',
        expect.any(Function)
      );
    });
  });
});