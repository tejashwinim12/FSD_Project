const CACHE_NAME = "screenmate-cache-v1";

// List of files to cache (add more if needed)
const urlsToCache = [
  "/",                     // Home page
  "/index.html",
  "/offline.html",         // Offline fallback page
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Add other static assets here (CSS/JS if you want)
];

// Install event — caching essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching essential files...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate SW immediately
});

// Activate event — cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event — serve offline page for navigations
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // For page navigations, try network first, fallback to offline.html
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
  } else {
    // For other requests (JS/CSS/images), try network first, then cache
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
