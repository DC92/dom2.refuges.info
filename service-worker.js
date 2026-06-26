/********************
 * PWA service worker
 * S'installe avant tout autre chargement
 *
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 * https://korben.info/pwa-cache-cauchemar-solution.html
 */

//TODO service-worker.php avec derniere date de modif d'un fichier /mobile/...

const cacheName = 'refuges.info';

console.info('Service worker loaded');

// Active immédiatement le service worker et déclenche le changement de contrôleur s'il y a un update
self.skipWaiting();

// Le service worker se réinstalle s'il y a des modifs dans sa source (un marqueur de version par exemple)
self.addEventListener('install', (evt) => {
  console.info('PWA installed');

  // Alors on supprime le cache de l'appli pour recharger tous les autres fichiers (code, icônes, ...)
  caches.delete(cacheName)
    .then(console.info('Cache ' + cacheName + ' deleted'))
    .catch(error => console.error('PWA delete cache ' + cacheName + ' ' + error));

  // Puis on recrée ce cache et on charge les fichiers indispensables
  evt.waitUntil(
    caches.open(cacheName)
    .catch(error => console.error('PWA create cache ' + cacheName + ' ' + error))
    .then(cache => {
      console.info('PWA cache ' + cacheName + ' created');

      cache.addAll([
          //'index.php',
          'manifest.json',
          'service-worker.js',
        ])
        .then(console.info('PWA files added to cache'))
        .catch(error => console.error('Add PWA files to cache' + error));
    })
  );
});

self.addEventListener('fetch', (event) =>
  // Ouvre le cache ou le crée
  caches.open(cacheName).then(cache =>
    // Cherche l'url dans le cache
    cache.match(event.request).then(responseCache =>
      // On l'a trouvé dans le cache
      responseCache ||
      // Sinon, on le cherche via le réseau
      fetch(event.request).then(externFetch => {
        // On met en cache uniquement les resources du même serveur
        if (event.request.url.includes(location.host) ||
          event.request.url.includes('openhikingmap'))
          cache.put(event.request, externFetch.clone());
        return externFetch;
      })
      .catch(error => console.error(error + ' ' + event.request.url))
    )
  )
);