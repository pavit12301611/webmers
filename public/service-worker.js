/**
 * Webmers Service Worker — basic offline caching for listings and assets.
 */
const CACHE_NAME = 'webmers-v1';
const STATIC_ASSETS = [
  '/',
  '/marketplace',
  '/listing',
  '/styles/globals.css',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).catch(() => caches.match('/'));
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
