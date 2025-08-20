// PWA utility functions for Service Worker registration and management

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

// Use native ServiceWorkerRegistration instead of custom interface

/**
 * Register Service Worker for PWA functionality
 */
export async function registerServiceWorker(): Promise<globalThis.ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none', // Always check for updates
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log('New Service Worker installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker installed, update available');
            // Notify user about update
            notifyUpdateAvailable();
          }
        });
      }
    });

    // Handle controlled state change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if app is running as PWA
 */
export function isPWA(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check if app can be installed as PWA
 */
export function canInstallPWA(): boolean {
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Prompt user to install PWA
 */
export async function promptPWAInstall(
  deferredPrompt: BeforeInstallPromptEvent | null
): Promise<{ outcome: 'accepted' | 'dismissed' | 'error' }> {
  if (!deferredPrompt) {
    return { outcome: 'error' };
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log('PWA install prompt result:', outcome);
    return { outcome };
  } catch (error) {
    console.error('PWA install prompt failed:', error);
    return { outcome: 'error' };
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and permitted
 */
export function canSendNotifications(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  );
}

/**
 * Send local notification
 */
export function sendLocalNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!canSendNotifications()) {
    return null;
  }

  try {
    return new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'meiso-notification',
      ...options,
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    return null;
  }
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Add online/offline event listeners
 */
export function addNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Get app version from package.json or build info
 */
export function getAppVersion(): string {
  // In a real implementation, this would be injected during build
  return process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
}

/**
 * Force Service Worker update
 */
export async function updateServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('Service Worker update triggered');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Service Worker update failed:', error);
    return false;
  }
}

/**
 * Notify user about available update
 */
function notifyUpdateAvailable(): void {
  // This could show a toast notification or modal
  // For now, just log it
  console.log('App update available! Refresh to get the latest version.');
  
  // Could dispatch custom event for UI components to listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-update-available'));
  }
}

/**
 * Clear all caches (useful for troubleshooting)
 */
export async function clearAppCaches(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear caches:', error);
    return false;
  }
}

/**
 * Get cache usage information
 */
export async function getCacheUsage(): Promise<{
  quota: number;
  usage: number;
  percentage: number;
} | null> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const quota = estimate.quota || 0;
    const usage = estimate.usage || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return {
      quota,
      usage,
      percentage,
    };
  } catch (error) {
    console.error('Failed to get cache usage:', error);
    return null;
  }
}