const CACHE_NAME = 'mfp-cache-v1';

self.addEventListener('install', (event) => {
  console.log('🔄 Checking for updates...');
  if (self.registration.active) {
    console.log('⏩ Application up to date.');
    return;
  }

  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/assets/css/grading.css',
        '/assets/js/app.js',
        '/assets/js/base.js',
        '/assets/js/develop.js',
        '/assets/js/foot.js',
        '/assets/js/images.js',
        '/assets/js/nav.js',
        '/assets/js/portfolio.js',
        '/assets/js/optics.js',
        '/assets/js/transitions.js',
        '/assets/images/logo.png',
        '/assets/pages/offline.html',
      ]);
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log(`🗑 Deleting old cache: ${cache}`);
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => {
        console.log('✅ Application READY.');
        return self.clients.claim();
      }),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      if (event.request.method !== 'GET') {
        return fetch(event.request);
      }

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.error('Fetch failed:', event.request.url, error);
        const cache = await caches.open(CACHE_NAME);
        const offlinePage = await cache.match('/assets/pages/offline.html');

        if (offlinePage) {
          console.warn('Serving offline page for:', event.request.url);
          return offlinePage;
        }

        return new Response('Offline mode. Page not available.', { status: 408 });
      }
    })(),
  );
});
