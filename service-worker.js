// service-worker.js
// Moving Forward Photography — PWA worker (v4)
// - Precache main shell (HTML, CSS, JS that "run the show")
// - Network-first for HTML + JS (so new builds show up)
// - Cache-first for images and everything else

const PRECACHE = 'mfp-precache-v4';
const RUNTIME  = 'mfp-runtime-v4';

// Helpers
const isHttp = (url) =>
  url.startsWith('http://') || url.startsWith('https://');

const sameOrigin = (url) =>
  new URL(url).origin === self.location.origin;

self.addEventListener('install', (event) => {
  // Take control ASAP
  self.skipWaiting();

  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',

        // CSS
        '/assets/css/grading.css',
        '/assets/css/nav.css',

        // Core JS
        '/assets/js/app.js',
        '/assets/js/base.js',
        '/assets/js/develop.js',
        '/assets/js/foot.js',
        '/assets/js/frames.js',
        '/assets/js/images.js',
        '/assets/js/optics.js',
        '/assets/js/osd.js',
        '/assets/js/portfolio.js',

        // Core images / offline
        '/assets/images/logo.png',
        '/assets/pages/offline.html',
      ])
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PRECACHE, RUNTIME]);
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => !keep.has(n))
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const urlStr = request.url;
  if (!isHttp(urlStr) || !sameOrigin(urlStr)) return;

  const url = new URL(urlStr);

  // HTML / navigation → NETWORK-FIRST
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(RUNTIME);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cache = await caches.open(RUNTIME);
          const cached = await cache.match(request);
          if (cached) return cached;

          const offline = await caches.match('/assets/pages/offline.html');
          return (
            offline ||
            new Response('Offline mode. Page not available.', { status: 408 })
          );
        }
      })()
    );
    return;
  }

  // JS & CSS → NETWORK-FIRST, CACHE FALLBACK
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(request);

        try {
          const networkResponse = await fetch(request);
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }

  // Images & everything else → CACHE-FIRST
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const networkResponse = await fetch(request);
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const cache = await caches.open(RUNTIME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        return new Response('Offline.', { status: 408 });
      }
    })()
  );
});
