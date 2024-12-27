const CACHE_NAME = "mfp-cache-v1";
const ASSETS_TO_CACHE = [
  "/MovingForward/",
  "/MovingForward/index.html",
  "/MovingForward/assets/manifest.json",
  "/MovingForward/assets/css/styles.css",
  "/MovingForward/assets/js/script.js",
  "/MovingForward/assets/images/icon-192x192.png",
  "/MovingForward/assets/images/icon-512x512.png",
  "/MovingForward/assets/pages/about.html",
  "/MovingForward/assets/pages/contact.html",
  "/MovingForward/assets/pages/abstract.html",
  "/MovingForward/assets/pages/landscape.html",
  "/MovingForward/assets/pages/street.html",
  "/MovingForward/assets/pages/portal.html",
];

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files...");
      return Promise.all(
        ASSETS_TO_CACHE.map((asset) =>
          cache
            .add(asset)
            .catch((error) => console.error(`Failed to cache ${asset}:`, error))
        )
      );
    })
  );
  self.skipWaiting(); // Activate the service worker immediately
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  const allowedCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!allowedCaches.includes(cacheName)) {
            console.log(`Service Worker: Deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all open pages
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response or fetch from network
      return (
        response ||
        fetch(event.request).catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/MovingForward/index.html");
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    url.hostname === "portal.movingforward.photography" &&
    url.pathname === "/"
  ) {
    event.respondWith(fetch("/assets/pages/portal.html"));
  }
});
