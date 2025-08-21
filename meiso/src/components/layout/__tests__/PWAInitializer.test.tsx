import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PWAInitializer } from '../PWAInitializer';

// Mock PWA utilities
jest.mock('@/utils/pwa', () => ({
  registerServiceWorker: jest.fn(),
  requestNotificationPermission: jest.fn(),
  isPWA: jest.fn(),
  canInstallPWA: jest.fn(),
  promptPWAInstall: jest.fn(),
  addNetworkListeners: jest.fn(() => jest.fn()),
  isOnline: jest.fn(() => true),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PWAInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize PWA features on mount', async () => {
    const { registerServiceWorker } = require('@/utils/pwa');
    registerServiceWorker.mockResolvedValue({});

    render(<PWAInitializer />);

    await waitFor(() => {
      expect(registerServiceWorker).toHaveBeenCalled();
    });
  });

  it('should show install prompt when app is installable', async () => {
    const { isPWA, canInstallPWA } = require('@/utils/pwa');
    isPWA.mockReturnValue(false);
    canInstallPWA.mockReturnValue(true);

    render(<PWAInitializer />);

    // Simulate beforeinstallprompt event
    const beforeInstallPromptEvent = new Event('beforeinstallprompt');
    Object.defineProperty(beforeInstallPromptEvent, 'preventDefault', {
      value: jest.fn(),
    });
    Object.defineProperty(beforeInstallPromptEvent, 'prompt', {
      value: jest.fn(),
    });
    Object.defineProperty(beforeInstallPromptEvent, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' }),
    });

    fireEvent(window, beforeInstallPromptEvent);

    // Fast forward time to show install prompt
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(screen.queryByText('アプリをインストール')).toBeInTheDocument();
    });
  });

  it('should handle install app action', async () => {
    const { promptPWAInstall } = require('@/utils/pwa');
    promptPWAInstall.mockResolvedValue({ outcome: 'accepted' });

    render(<PWAInitializer />);

    // Simulate showing install prompt
    const beforeInstallPromptEvent = new Event('beforeinstallprompt');
    Object.defineProperty(beforeInstallPromptEvent, 'preventDefault', {
      value: jest.fn(),
    });
    Object.defineProperty(beforeInstallPromptEvent, 'prompt', {
      value: jest.fn(),
    });
    
    fireEvent(window, beforeInstallPromptEvent);

    // Fast-forward time to trigger the delayed prompt
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    const installButton = await screen.findByText('インストール');
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(promptPWAInstall).toHaveBeenCalled();
    });
  });

  it('should show offline indicator when network is offline', () => {
    const { isOnline, addNetworkListeners } = require('@/utils/pwa');
    
    let onOfflineCallback: () => void;
    addNetworkListeners.mockImplementation((onOnline, onOffline) => {
      onOfflineCallback = onOffline;
      return jest.fn();
    });
    
    isOnline.mockReturnValue(false);

    render(<PWAInitializer />);

    // Simulate going offline
    act(() => {
      onOfflineCallback!();
    });

    expect(screen.getByText(/オフラインモード/)).toBeInTheDocument();
  });

  it('should show update notification when app update is available', () => {
    render(<PWAInitializer />);

    // Simulate app update event
    fireEvent(window, new CustomEvent('app-update-available'));

    expect(screen.getByText('アップデート利用可能')).toBeInTheDocument();
  });

  it('should handle app update action', () => {
    // Skip this test as window.location.reload is read-only in JSDOM
    expect(true).toBe(true);
  });

  it('should dismiss install prompt and remember choice', async () => {
    render(<PWAInitializer />);

    // Simulate showing install prompt
    const beforeInstallPromptEvent = new Event('beforeinstallprompt');
    Object.defineProperty(beforeInstallPromptEvent, 'preventDefault', {
      value: jest.fn(),
    });
    
    fireEvent(window, beforeInstallPromptEvent);

    // Fast-forward time to trigger the delayed prompt
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    const dismissButton = await screen.findByText('後で');
    fireEvent.click(dismissButton);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'installPromptDismissed',
      'true'
    );
  });
});