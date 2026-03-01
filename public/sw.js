const CACHE_NAME = 'committed-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/discover',
  '/messages',
  '/matches',
  '/manifest.json',
];

// Install — cache core pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests — always go live for those
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/') || event.request.url.includes('railway.app')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache fresh responses
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback — return cached version
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return the cached homepage
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});