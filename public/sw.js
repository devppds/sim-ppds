const CACHE_NAME = 'sim-ppds-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/login',
        '/manifest.json',
        '/logopondok.png',
        '/favicon.ico',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only process GET requests
  if (request.method !== 'GET') return;
  
  // Skip API calls since they are handled by the IndexedDB/client-side sync engine
  if (request.url.includes('/api/')) return;

  // Network-First falling back to Cache strategy for pages and static assets
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses from the same origin
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigating to a page offline, render the login page shell
          if (request.mode === 'navigate') {
            return caches.match('/login') || caches.match('/');
          }
          return new Response('Not found offline', { status: 404 });
        });
      })
  );
});

// Skip waiting on message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

