/* PWA service worker */
//https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
//https://korben.info/pwa-cache-cauchemar-solution.html

const cacheName = 'refuges.info';

console.log('Init PWA');

// Fetch any ressource, cache first with cache refresh
async function cacheFirstWithRefresh(request) {
  const fetchResponsePromise =
    fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });

  return (await caches.match(request)) || (await fetchResponsePromise);
}

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirstWithRefresh(event.request));
});