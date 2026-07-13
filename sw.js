const CACHE = 'workout-app-v4';
const ASSETS = [
  './',
  './index.html',
  './preview.html',
  './css/style.css',
  './js/app.js',
  './js/data.js',
  './js/nutrition.js',
  './js/illustrations.js',
  './js/timer.js',
  './js/storage.js',
  './manifest.json',
  './icons/icon-192.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        // Cache hit — return cached, but also update cache in background
        const fetchPromise = fetch(e.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return response;
        }).catch(() => {});
        // Don't wait for the network update
        return cached;
      }
      // Cache miss — try network
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      });
    }).catch(() => {
      // Offline and not in cache — return the main page for navigation requests
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      return new Response('离线不可用', { status: 503 });
    })
  );
});
