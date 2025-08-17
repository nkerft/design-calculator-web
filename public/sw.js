const CACHE_NAME = 'design-calculator-v3';

self.addEventListener('install', (event) => {
  // Простая установка без кэширования
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Просто пропускаем все запросы без кэширования
  event.respondWith(fetch(event.request));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
