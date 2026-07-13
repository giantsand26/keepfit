const CACHE = 'workout-app-v5';
const ASSETS = [
  './',
  './index.html',
  './preview.html',
  './css/style.css',
  './js/storage.js',
  './js/data.js',
  './js/nutrition.js',
  './js/illustrations.js',
  './js/timer.js',
  './js/app.js',
  './js/views/today.js',
  './js/views/week.js',
  './js/views/diet.js',
  './js/views/progress.js',
  './js/views/settings.js',
  './js/views/modal.js',
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
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        // Cache hit — stale-while-revalidate
        const fetchPromise = fetch(e.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return response;
        }).catch(() => {});
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
      // Offline fallback
      if (e.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      return new Response('离线不可用', { status: 503 });
    })
  );
});
