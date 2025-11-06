// service-worker.js
// Moving Forward Photography — PWA worker (patched)
// - Ignores chrome-extension and cross-origin requests
// - Only caches same-origin, successful GET responses
// - Uses separate PRECACHE (install-time) and RUNTIME (on-demand) caches

const PRECACHE = 'mfp-precache-v2';
const RUNTIME  = 'mfp-runtime-v2';

// Helper predicates
const isHttp = (url) => url.startsWith('http://') || url.startsWith('https://');
const sameOrigin = (url) => new URL(url).origin === self.location.origin;

self.addEventListener('install', (event) => {
  // Take control immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      cache.addAll([
        '/',                     // keep your existing precache list
        '/index.html',
        '/manifest.json',
        '/assets/css/grading.css',
        '/assets/js/app.js',
        '/assets/js/base.js',
        '/assets/js/develop.js',
        '/assets/js/foot.js',
        '/assets/js/frames.js',
        '/assets/js/images.js',
        '/assets/js/portfolio.js',
        '/assets/js/optics.js',
        '/assets/js/osd.js',
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

  // Only handle GET requests for same-origin HTTP(S) URLs
  if (request.method !== 'GET') return;

  const url = request.url;
  if (!isHttp(url) || !sameOrigin(url)) return; // ignore chrome-extension:, data:, cross-origin, etc.

  event.respondWith(
    (async () => {
      // Try cache first
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);

        // Cache only successful, same-origin basic responses
        const okToCache =
          response &&
          response.status === 200 &&
          response.type === 'basic';

        if (okToCache) {
          const runtime = await caches.open(RUNTIME);
          runtime.put(request, response.clone());
        }

        return response;
      } catch (err) {
        // Offline fallback (if available)
        const offline = await caches.match('/assets/pages/offline.html');
        return offline || new Response('Offline mode. Page not available.', { status: 408 });
      }
    })()
  );
});
