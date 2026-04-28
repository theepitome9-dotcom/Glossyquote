const CACHE_NAME = 'glossyquote-v1';
const urlsToCache = ['/', '/index.html', '/privacy.html', '/terms.html', '/privacy-choices.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        console.log('Cache add failed, continuing anyway');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) return response;
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const cache = caches.open(CACHE_NAME);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        })
        .catch(() => {
          return caches.match(request);
        });
    })
  );
});
