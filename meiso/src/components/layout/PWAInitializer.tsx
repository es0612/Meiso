'use client';

import { useEffect, useState } from 'react';
import {
  registerServiceWorker,
  requestNotificationPermission,
  isPWA,
  canInstallPWA,
  promptPWAInstall,
  addNetworkListeners,
  isOnline,
} from '@/utils/pwa';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInitializer = () => {
  const [isAppInstallable, setIsAppInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    // Initialize PWA features
    initializePWA();

    // Set up network status monitoring
    setIsOnlineStatus(isOnline());
    const removeNetworkListeners = addNetworkListeners(
      () => setIsOnlineStatus(true),
      () => setIsOnlineStatus(false)
    );

    // Listen for app update events
    const handleAppUpdate = () => {
      setSwUpdateAvailable(true);
    };

    window.addEventListener('app-update-available', handleAppUpdate);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setIsAppInstallable(true);
      
      // Show install prompt after user has used the app for a bit
      setTimeout(() => {
        if (!isPWA()) {
          setShowInstallPrompt(true);
        }
      }, 30000); // Show after 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up
    return () => {
      removeNetworkListeners();
      window.removeEventListener('app-update-available', handleAppUpdate);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const initializePWA = async () => {
    try {
      // Register Service Worker
      const registration = await registerServiceWorker();
      if (registration) {
        console.log('PWA initialized successfully');
      }

      // Request notification permission if not already granted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          // Don't request immediately, wait for user interaction
          console.log('Notification permission can be requested');
        }
      }
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      const result = await promptPWAInstall(deferredPrompt);
      if (result.outcome === 'accepted') {
        setIsAppInstallable(false);
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Remember that user dismissed prompt (could use localStorage)
    localStorage.setItem('installPromptDismissed', 'true');
  };

  const handleUpdateApp = () => {
    window.location.reload();
  };

  const handleRequestNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      console.log('Notifications enabled');
    }
  };

  // Don't render anything if running server-side
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <>
      {/* Install App Prompt */}
      {showInstallPrompt && isAppInstallable && !isPWA() && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                アプリをインストール
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Meisoをホーム画面に追加して、いつでも瞑想を始められます
              </p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleInstallApp}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  インストール
                </button>
                <button
                  onClick={handleDismissInstallPrompt}
                  className="text-xs text-gray-600 dark:text-gray-300 px-3 py-1 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  後で
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissInstallPrompt}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* App Update Available */}
      {swUpdateAvailable && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
                  アップデート利用可能
                </h3>
                <p className="text-xs text-green-700 dark:text-green-300">
                  新しいバージョンが利用できます
                </p>
              </div>
            </div>
            <button
              onClick={handleUpdateApp}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
            >
              更新
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnlineStatus && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-center py-2 text-sm">
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            オフラインモード - 一部の機能が制限されます
          </div>
        </div>
      )}

      {/* Development: Clear Cache Button */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => {
                    caches.delete(name);
                  });
                });
              }
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Clear Cache
          </button>
        </div>
      )}
    </>
  );
};