const CACHE_NAME = "mfp-cache-v1";
const ASSETS_TO_CACHE = [
  "/MovingForward/",
  "/MovingForward/index.html",
  "/MovingForward/assets/css/styles.css",
  "/MovingForward/assets/js/script.js",
  "/MovingForward/assets/images/icon-192x192.png",
  "/MovingForward/assets/images/icon-512x512.png",
  "/MovingForward/assets/pages/about.html",
  "/MovingForward/assets/pages/abstract.html",
  "/MovingForward/assets/pages/contact.html",
  "/MovingForward/assets/pages/landscape.html",
  "/MovingForward/assets/pages/street.html",
];

// Install event: Cache app assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
