// Minimal service worker for PWA installability.
// Browsers require a registered SW for "Add to Home Screen" in many cases.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
