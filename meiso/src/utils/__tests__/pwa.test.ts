import {
  registerServiceWorker,
  unregisterServiceWorker,
  isPWA,
  canInstallPWA,
  promptPWAInstall,
  requestNotificationPermission,
  canSendNotifications,
  sendLocalNotification,
  isOnline,
  addNetworkListeners,
} from '../pwa';

// Mock Service Worker API
const mockRegistration = {
  scope: '/',
  update: jest.fn(),
  unregister: jest.fn(),
  installing: null,
  waiting: null,
  active: null,
  addEventListener: jest.fn(),
};

const mockServiceWorker = {
  register: jest.fn(),
  getRegistration: jest.fn(),
};

Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: mockServiceWorker,
    onLine: true,
  },
  writable: true,
});

// Mock Notification API
Object.defineProperty(global, 'Notification', {
  value: {
    permission: 'default' as NotificationPermission,
    requestPermission: jest.fn(),
  },
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query) => ({
    matches: query === '(display-mode: standalone)',
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window event listeners
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn(),
});

Object.defineProperty(window, 'removeEventListener', {
  value: jest.fn(),
});

describe('PWA Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Notification as any).permission = 'default';
  });

  describe('registerServiceWorker', () => {
    it('should register service worker successfully', async () => {
      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      const result = await registerServiceWorker();

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      expect(result).toBe(mockRegistration);
    });

    it('should return null when service worker is not supported', async () => {
      const originalNavigator = global.navigator;
      global.navigator = {} as any;

      const result = await registerServiceWorker();

      expect(result).toBeNull();

      global.navigator = originalNavigator;
    });

    it('should return null on server side (no window)', async () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = await registerServiceWorker();

      expect(result).toBeNull();

      global.window = originalWindow;
    });

    it('should handle registration failure gracefully', async () => {
      const error = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await registerServiceWorker();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Service Worker registration failed:',
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe('unregisterServiceWorker', () => {
    it('should unregister service worker successfully', async () => {
      mockServiceWorker.getRegistration.mockResolvedValue(mockRegistration);
      mockRegistration.unregister.mockResolvedValue(true);

      const result = await unregisterServiceWorker();

      expect(mockServiceWorker.getRegistration).toHaveBeenCalled();
      expect(mockRegistration.unregister).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no registration exists', async () => {
      mockServiceWorker.getRegistration.mockResolvedValue(null);

      const result = await unregisterServiceWorker();

      expect(result).toBe(false);
    });
  });

  describe('isPWA', () => {
    it('should return true when in standalone mode', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });

      const result = isPWA();

      expect(result).toBe(true);
    });

    it('should return true when navigator.standalone is true', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });
      Object.defineProperty(navigator, 'standalone', {
        value: true,
        configurable: true,
      });

      const result = isPWA();

      expect(result).toBe(true);
    });

    it('should return false when not in PWA mode', () => {
      (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });
      Object.defineProperty(navigator, 'standalone', {
        value: false,
        configurable: true,
      });

      const result = isPWA();

      expect(result).toBe(false);
    });

    it('should return false on server side', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = isPWA();

      expect(result).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('canInstallPWA', () => {
    it('should return true when BeforeInstallPromptEvent is available', () => {
      (global as any).BeforeInstallPromptEvent = class {};

      const result = canInstallPWA();

      expect(result).toBe(true);
    });

    it('should return false when BeforeInstallPromptEvent is not available', () => {
      delete (global as any).BeforeInstallPromptEvent;

      const result = canInstallPWA();

      expect(result).toBe(false);
    });
  });

  describe('promptPWAInstall', () => {
    const mockDeferredPrompt = {
      prompt: jest.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    it('should prompt for installation and return outcome', async () => {
      const result = await promptPWAInstall(mockDeferredPrompt as any);

      expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
      expect(result).toEqual({ outcome: 'accepted' });
    });

    it('should return error when no deferred prompt', async () => {
      const result = await promptPWAInstall(null);

      expect(result).toEqual({ outcome: 'error' });
    });

    it('should handle prompt failure gracefully', async () => {
      const failingPrompt = {
        prompt: jest.fn().mockRejectedValue(new Error('Prompt failed')),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await promptPWAInstall(failingPrompt as any);

      expect(result).toEqual({ outcome: 'error' });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request permission when default', async () => {
      (Notification as any).requestPermission = jest
        .fn()
        .mockResolvedValue('granted');

      const result = await requestNotificationPermission();

      expect(Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe('granted');
    });

    it('should return current permission when already set', async () => {
      (Notification as any).permission = 'granted';

      const result = await requestNotificationPermission();

      expect(result).toBe('granted');
    });

    it('should return denied when notifications not supported', async () => {
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;

      const result = await requestNotificationPermission();

      expect(result).toBe('denied');

      global.Notification = originalNotification;
    });
  });

  describe('canSendNotifications', () => {
    it('should return true when notifications are granted', () => {
      (Notification as any).permission = 'granted';

      const result = canSendNotifications();

      expect(result).toBe(true);
    });

    it('should return false when notifications are denied', () => {
      (Notification as any).permission = 'denied';

      const result = canSendNotifications();

      expect(result).toBe(false);
    });

    it('should return false when notifications not supported', () => {
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;

      const result = canSendNotifications();

      expect(result).toBe(false);

      global.Notification = originalNotification;
    });
  });

  describe('sendLocalNotification', () => {
    it('should create notification when permitted', () => {
      (Notification as any).permission = 'granted';
      const mockNotification = jest.fn();
      global.Notification = mockNotification as any;

      const result = sendLocalNotification('Test title', { body: 'Test body' });

      expect(mockNotification).toHaveBeenCalledWith('Test title', {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'meiso-notification',
        body: 'Test body',
      });
      expect(result).toBeInstanceOf(Function);
    });

    it('should return null when notifications not permitted', () => {
      (Notification as any).permission = 'denied';

      const result = sendLocalNotification('Test title');

      expect(result).toBeNull();
    });

    it('should handle notification creation failure', () => {
      (Notification as any).permission = 'granted';
      global.Notification = jest.fn().mockImplementation(() => {
        throw new Error('Notification failed');
      }) as any;

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = sendLocalNotification('Test title');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
      });

      const result = isOnline();

      expect(result).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });

      const result = isOnline();

      expect(result).toBe(false);
    });

    it('should return true when navigator is undefined', () => {
      const originalNavigator = global.navigator;
      // @ts-ignore
      delete global.navigator;

      const result = isOnline();

      expect(result).toBe(true);

      global.navigator = originalNavigator;
    });
  });

  describe('addNetworkListeners', () => {
    it('should add event listeners and return cleanup function', () => {
      const onOnline = jest.fn();
      const onOffline = jest.fn();

      const cleanup = addNetworkListeners(onOnline, onOffline);

      expect(window.addEventListener).toHaveBeenCalledWith('online', onOnline);
      expect(window.addEventListener).toHaveBeenCalledWith('offline', onOffline);

      // Test cleanup
      cleanup();

      expect(window.removeEventListener).toHaveBeenCalledWith('online', onOnline);
      expect(window.removeEventListener).toHaveBeenCalledWith('offline', onOffline);
    });

    it('should return noop function when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const cleanup = addNetworkListeners(jest.fn(), jest.fn());

      expect(typeof cleanup).toBe('function');
      expect(cleanup()).toBeUndefined();

      global.window = originalWindow;
    });
  });
});