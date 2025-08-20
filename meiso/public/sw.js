// Service Worker for Meiso meditation app
// Provides offline functionality and caching strategies

const CACHE_NAME = 'meiso-v1';
const STATIC_CACHE_NAME = 'meiso-static-v1';
const DYNAMIC_CACHE_NAME = 'meiso-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/meditation',
  '/history',
  '/settings',
  '/offline',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/_error.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js',
  '/next.svg',
  '/vercel.svg',
  '/file.svg',
  '/globe.svg',
  '/window.svg',
];

// Cache strategies for different types of resources
const CACHE_STRATEGIES = {
  // Static assets - Cache first
  static: /\/_next\/static\//,
  // Images - Cache first with fallback
  images: /\.(jpg|jpeg|png|gif|webp|svg|ico)$/,
  // API routes - Network first
  api: /\/api\//,
  // Pages - Stale while revalidate
  pages: /^https?:\/\/[^\/]+\/(meditation|history|settings)?$/,
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Skip requests with certain methods
  if (request.method !== 'GET') {
    return;
  }
  
  event.respondWith(handleRequest(request, url));
});

async function handleRequest(request, url) {
  try {
    // Determine cache strategy based on request type
    if (CACHE_STRATEGIES.static.test(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    if (CACHE_STRATEGIES.images.test(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    if (CACHE_STRATEGIES.api.test(url.pathname)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    if (CACHE_STRATEGIES.pages.test(url.href)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
    }
    
    // Default strategy - network first
    return await networkFirst(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return await caches.match('/offline') || new Response('Offline');
    }
    
    return new Response('Network error', { status: 408 });
  }
}

// Cache first strategy - good for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Cache first failed:', error);
    throw error;
  }
}

// Network first strategy - good for API calls
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Stale while revalidate - good for pages
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Update cache in background
  const updateCache = async () => {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        await cache.put(request, response.clone());
      }
    } catch (error) {
      console.log('Background update failed:', error);
    }
  };
  
  // Start background update (don't wait for it)
  updateCache();
  
  // Return cached version immediately if available
  if (cached) {
    return cached;
  }
  
  // If no cache, wait for network
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Stale while revalidate failed:', error);
    throw error;
  }
}

// Handle background sync for offline meditation sessions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-sessions') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(syncOfflineSessions());
  }
});

async function syncOfflineSessions() {
  try {
    // Get stored offline sessions from IndexedDB
    const offlineSessions = await getOfflineSessions();
    
    for (const session of offlineSessions) {
      try {
        // Attempt to sync with server
        await syncSession(session);
        // Remove from offline storage on success
        await removeOfflineSession(session.id);
      } catch (error) {
        console.log('Failed to sync session:', session.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getOfflineSessions() {
  // Implementation would use IndexedDB to get stored sessions
  return [];
}

async function syncSession(session) {
  // Implementation would POST session to server
  return Promise.resolve();
}

async function removeOfflineSession(sessionId) {
  // Implementation would remove session from IndexedDB
  return Promise.resolve();
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '瞑想の時間です',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'meditation-reminder',
    renotify: true,
    actions: [
      {
        action: 'meditate',
        title: '瞑想を始める',
        icon: '/icon-start.png'
      },
      {
        action: 'dismiss',
        title: '後で',
        icon: '/icon-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Meiso', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'meditate') {
    event.waitUntil(
      clients.openWindow('/meditation')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});