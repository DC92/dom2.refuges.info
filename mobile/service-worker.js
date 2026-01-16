/* PWA service worker */
//https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
//https://korben.info/pwa-cache-cauchemar-solution.html

const cacheName = 'refuges.info';

console.log('Init PWA');

// Fetch any ressource, cache first with cache refresh
self.addEventListener('fetch', (evt) => {
  evt.respondWith((event) =>
    caches.match(event.request) ||
    fetch(event.request)
    .then((networkResponse) => {
      if (networkResponse.ok)
        caches.open(cacheName).put(event.request, networkResponse.clone());

      return networkResponse;
    }));
});