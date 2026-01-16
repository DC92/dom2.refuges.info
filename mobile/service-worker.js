/* PWA service worker */
//https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
//https://korben.info/pwa-cache-cauchemar-solution.html

const cacheName = 'refuges.info';

console.info('Service worker loaded');

self.skipWaiting(); // Immediately activate the SW & trigger controllerchange

self.addEventListener('install', () => {
  console.info('Service worker installed');
});

// Fetch any ressource, cache first with cache refresh
async function cacheFirstWithRefresh(request) {
  return (await caches.match(request)) ||
  fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
}

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirstWithRefresh(event.request));
});