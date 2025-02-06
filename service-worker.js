if (self.location.hostname.includes('localhost') || self.location.hostname.includes('127.0.0.1')) {
  console.warn('⚠️ Service Worker is disabled in development.');

  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', () => self.clients.claim());
  self.addEventListener('fetch', (event) => event.respondWith(fetch(event.request)));

  self.addEventListener('activate', async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.unregister();
      console.warn('⚠️ Service Worker unregistered in development.');
    }
  });
}

const CACHE_NAME = 'mfp-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const filesToCache = [
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
      ];

      try {
        const manifestResponse = await fetch('/manifest.json');
        const manifest = await manifestResponse.json();
        const iconUrls = manifest.icons.map((icon) => icon.src);
        filesToCache.push(...iconUrls);
      } catch (error) {
        console.warn('Manifest fetch failed, using default cache.');
      }

      return cache.addAll(filesToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const url = event.request.url;

      if (!url.startsWith(self.location.origin)) {
        return fetch(event.request);
      }

      if (event.request.method !== 'GET') {
        return fetch(event.request);
      }

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);

        if (networkResponse && networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        console.error('Fetch failed:', event.request.url, error);
        return new Response('Network error occurred', { status: 408 });
      }
    })(),
  );
});
